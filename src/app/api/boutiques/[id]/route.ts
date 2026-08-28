import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeBoutiqueForUser } from '@/lib/permissions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const boutique = await prisma.boutique.findUnique({
      where: { id },
      include: {
        offres: {
          include: {
            produitReference: true
          },
          orderBy: { prix: 'asc' }
        },
        avis: {
          where: { statut: 'PUBLIE' },
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                ville: true
              }
            }
          },
          orderBy: { dateCreation: 'desc' }
        },
        utilisateur: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        }
      }
    });

    if (!boutique) {
      return NextResponse.json(
        { success: false, message: 'Boutique introuvable.' },
        { status: 404 }
      );
    }

    // Si la boutique n'est pas publiée, seuls l'admin, modérateur ou le propriétaire peuvent la voir
    if (boutique.statut !== 'PUBLIEE') {
      const isAuthorized = user && (user.role === 'ADMIN' || user.role === 'MODERATOR' || boutique.utilisateurId === user.id);
      if (!isAuthorized) {
        return NextResponse.json(
          { success: false, message: 'Cette boutique est en cours de validation par un modérateur.' },
          { status: 403 }
        );
      }
    }

    const sanitizedBoutique = sanitizeBoutiqueForUser(boutique, user);

    return NextResponse.json({
      success: true,
      boutique: sanitizedBoutique
    });

  } catch (error: any) {
    console.error('Erreur API Boutique Details:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du chargement de la boutique.' },
      { status: 500 }
    );
  }
}
