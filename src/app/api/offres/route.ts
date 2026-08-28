import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateDistanceKm } from '@/lib/geo';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const produitId = searchParams.get('produitId');
    const categorie = searchParams.get('categorie');
    const sousCategorie = searchParams.get('sousCategorie');
    const pays = searchParams.get('pays');
    const ville = searchParams.get('ville');
    const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const userLon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : null;

    const whereClause: any = {
      boutique: {
        statut: 'PUBLIEE'
      }
    };

    if (produitId) {
      whereClause.produitReferenceId = produitId;
    }

    if (pays && pays !== 'Tous' && pays !== 'Toutes') {
      whereClause.boutique.pays = pays;
    }

    if (ville && ville !== 'Toutes' && ville !== 'Toutes les villes') {
      whereClause.boutique.ville = ville;
    }

    if (categorie && categorie !== 'TOUTES') {
      whereClause.produitReference = {
        ...(whereClause.produitReference || {}),
        categorie: categorie
      };
    }

    if (sousCategorie && sousCategorie !== 'TOUTES') {
      whereClause.produitReference = {
        ...(whereClause.produitReference || {}),
        sousCategorie: sousCategorie
      };
    }

    const offres = await prisma.offre.findMany({
      where: whereClause,
      include: {
        produitReference: true,
        boutique: {
          select: {
            id: true,
            nom: true,
            pays: true,
            ville: true,
            quartier: true,
            latitude: true,
            longitude: true,
            badgeCertifie: true,
            noteMoyenne: true,
            statut: true
          }
        }
      },
      orderBy: {
        prix: 'asc' // COMPARATEUR : Tri par prix croissant par défaut
      }
    });

    const formattedOffres = offres.map((o) => {
      let distanceKm: number | undefined = undefined;
      if (userLat !== null && userLon !== null && o.boutique.latitude && o.boutique.longitude) {
        distanceKm = calculateDistanceKm(userLat, userLon, o.boutique.latitude, o.boutique.longitude);
      }

      return {
        ...o,
        boutique: {
          ...o.boutique,
          distanceKm
        }
      };
    });

    return NextResponse.json({
      success: true,
      offres: formattedOffres,
      count: formattedOffres.length
    });

  } catch (error: any) {
    console.error('Erreur API Offres:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des offres.' },
      { status: 500 }
    );
  }
}
