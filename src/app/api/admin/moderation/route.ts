import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return NextResponse.json(
        { success: false, message: 'Accès réservé aux administrateurs et modérateurs.' },
        { status: 403 }
      );
    }

    // 1. Boutiques en attente de modération
    const boutiquesEnAttente = await prisma.boutique.findMany({
      where: { statut: 'EN_ATTENTE' },
      include: {
        utilisateur: {
          select: { id: true, nom: true, email: true, telephone: true }
        }
      },
      orderBy: { dateCreation: 'desc' }
    });

    // 2. Propositions de nouveaux produits en attente
    const propositionsEnAttente = await prisma.propositionProduit.findMany({
      where: { statut: 'EN_ATTENTE' },
      include: {
        boutique: {
          select: { id: true, nom: true, ville: true, pays: true }
        }
      },
      orderBy: { dateCreation: 'desc' }
    });

    // 3. Avis clients en attente de modération
    const avisEnAttente = await prisma.avis.findMany({
      where: { statut: 'EN_ATTENTE' },
      include: {
        boutique: {
          select: { id: true, nom: true }
        },
        utilisateur: {
          select: { id: true, nom: true, email: true }
        }
      },
      orderBy: { dateCreation: 'desc' }
    });

    // 4. Demandes de badges payées en attente de validation
    const demandesBadges = await prisma.demandeBadge.findMany({
      where: { statut: { in: ['PAYEE', 'EN_ATTENTE'] } },
      include: {
        boutique: {
          select: { id: true, nom: true, ville: true, pays: true, badgeCertifie: true }
        }
      },
      orderBy: { dateDemande: 'desc' }
    });

    // 5. Journal d'audit de modération récent
    const journalModeration = await prisma.journalModeration.findMany({
      include: {
        moderateur: {
          select: { id: true, nom: true, role: true }
        }
      },
      orderBy: { dateAction: 'desc' },
      take: 50
    });

    // 6. Liste des utilisateurs (si admin)
    let utilisateurs: any[] = [];
    if (user.role === 'ADMIN') {
      utilisateurs = await prisma.utilisateur.findMany({
        select: {
          id: true,
          nom: true,
          email: true,
          telephone: true,
          pays: true,
          ville: true,
          role: true,
          dateCreation: true,
          boutiques: {
            select: { id: true, nom: true, statut: true }
          }
        },
        orderBy: { dateCreation: 'desc' },
        take: 100
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        boutiquesEnAttente,
        propositionsEnAttente,
        avisEnAttente,
        demandesBadges,
        journalModeration,
        utilisateurs
      }
    });

  } catch (error: any) {
    console.error('Erreur API Moderation data:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des données de modération.' },
      { status: 500 }
    );
  }
}
