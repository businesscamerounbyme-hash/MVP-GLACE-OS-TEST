import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateDistanceKm } from '@/lib/geo';
import { sanitizeBoutiqueForUser } from '@/lib/permissions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pays = searchParams.get('pays');
    const ville = searchParams.get('ville');
    const categorie = searchParams.get('categorie');
    const q = searchParams.get('q');
    const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const userLon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : null;

    const user = await getCurrentUser();

    // RÈGLE MÉTIER STRICTE : Les boutiques publiques doivent avoir le statut 'PUBLIEE'
    const whereClause: any = {
      statut: 'PUBLIEE'
    };

    if (pays && pays !== 'Tous' && pays !== 'Toutes') {
      whereClause.pays = pays;
    }

    if (ville && ville !== 'Toutes' && ville !== 'Toutes les villes') {
      whereClause.ville = ville;
    }

    if (q) {
      whereClause.OR = [
        { nom: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { quartier: { contains: q, mode: 'insensitive' } },
        { offres: { some: { produitReference: { nom: { contains: q, mode: 'insensitive' } } } } }
      ];
    }

    if (categorie && categorie !== 'TOUTES') {
      whereClause.offres = {
        some: {
          produitReference: {
            categorie: categorie
          }
        }
      };
    }

    const boutiques = await prisma.boutique.findMany({
      where: whereClause,
      include: {
        offres: {
          include: {
            produitReference: true
          }
        },
        avis: {
          where: { statut: 'PUBLIE' }
        }
      },
      orderBy: [
        { badgeCertifie: 'desc' },
        { noteMoyenne: 'desc' }
      ]
    });

    // Sanitization & Calcul de distance
    const formattedBoutiques = boutiques.map((b) => {
      const sanitized = sanitizeBoutiqueForUser(b, user);
      let distanceKm: number | undefined = undefined;

      if (userLat !== null && userLon !== null && b.latitude && b.longitude) {
        distanceKm = calculateDistanceKm(userLat, userLon, b.latitude, b.longitude);
      }

      return {
        ...sanitized,
        offresCount: b.offres.length,
        avisCount: b.avis.length,
        distanceKm
      };
    });

    // Si géolocalisation active, trier par distance
    if (userLat !== null && userLon !== null) {
      formattedBoutiques.sort((a, b) => {
        if (a.distanceKm === undefined) return 1;
        if (b.distanceKm === undefined) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return NextResponse.json({
      success: true,
      boutiques: formattedBoutiques,
      count: formattedBoutiques.length
    });

  } catch (error: any) {
    console.error('Erreur API Boutiques:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du chargement des boutiques.' },
      { status: 500 }
    );
  }
}
