import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorie = searchParams.get('categorie');
    const sousCategorie = searchParams.get('sousCategorie');
    const q = searchParams.get('q');

    const whereClause: any = {};

    if (categorie && categorie !== 'TOUTES') {
      whereClause.categorie = categorie;
    }

    if (sousCategorie && sousCategorie !== 'TOUTES') {
      whereClause.sousCategorie = sousCategorie;
    }

    if (q) {
      whereClause.OR = [
        { nom: { contains: q } },
        { description: { contains: q } },
        { sousCategorie: { contains: q } }
      ];
    }

    const produits = await prisma.produitReference.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            offres: {
              where: {
                boutique: {
                  statut: 'PUBLIEE'
                }
              }
            }
          }
        },
        offres: {
          where: {
            boutique: {
              statut: 'PUBLIEE'
            }
          },
          select: {
            prix: true,
            devise: true
          },
          orderBy: {
            prix: 'asc'
          },
          take: 1
        }
      },
      orderBy: {
        nom: 'asc'
      }
    });

    const formattedProduits = produits.map((p) => ({
      id: p.id,
      nom: p.nom,
      categorie: p.categorie,
      sousCategorie: p.sousCategorie,
      unitesAutorisees: p.unitesAutorisees,
      description: p.description,
      image: p.image,
      offresCount: p._count.offres,
      prixMin: p.offres?.[0]?.prix || null,
      devise: p.offres?.[0]?.devise || 'XOF'
    }));

    return NextResponse.json({
      success: true,
      produits: formattedProduits
    });

  } catch (error: any) {
    console.error('Erreur API Produits Référence:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération du catalogue.' },
      { status: 500 }
    );
  }
}
