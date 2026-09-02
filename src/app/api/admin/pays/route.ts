import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { requireUser, authErrorResponse } from '@/lib/guard';
import { paysParCode } from '@/lib/pays';

/**
 * Ouverture ou fermeture d'un marché.
 *
 * Réservé à l'ADMIN : décider où des boutiques peuvent exister est une décision
 * commerciale, pas un acte de modération. Un MODERATOR traite les files d'attente,
 * il n'ouvre pas de pays.
 */
export async function PATCH(request: Request) {
  try {
    const user = requireUser(await getCurrentUser(), ['ADMIN']);
    const { code, ouvert } = await request.json();

    if (!paysParCode(String(code || ''))) {
      return NextResponse.json(
        { success: false, message: 'Pays inconnu.' },
        { status: 400 }
      );
    }

    if (typeof ouvert !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Valeur d’ouverture invalide.' },
        { status: 400 }
      );
    }

    const codeIso = String(code).toUpperCase();

    // Fermer un marché n'affecte pas les boutiques déjà en place : les fournisseurs
    // installés ne doivent pas disparaître parce qu'on suspend les inscriptions.
    const boutiquesExistantes = ouvert
      ? 0
      : await prisma.boutique.count({ where: { pays: paysParCode(codeIso)!.nom } });

    const marche = await prisma.marchePays.upsert({
      where: { code: codeIso },
      update: { ouvert, dateOuverture: ouvert ? new Date() : null, modifiePar: user.id },
      create: {
        code: codeIso,
        ouvert,
        dateOuverture: ouvert ? new Date() : null,
        modifiePar: user.id,
      },
    });

    await prisma.journalModeration.create({
      data: {
        cibleId: codeIso,
        typeCible: 'MARCHE_PAYS',
        moderateurId: user.id,
        action: ouvert ? 'OUVRIR' : 'FERMER',
        motif: null,
      },
    });

    return NextResponse.json({
      success: true,
      marche,
      message: ouvert
        ? `Marché ouvert : les fournisseurs peuvent y créer une boutique.`
        : boutiquesExistantes > 0
          ? `Marché fermé aux nouvelles inscriptions. ${boutiquesExistantes} boutique(s) déjà en place restent actives.`
          : `Marché fermé aux nouvelles inscriptions.`,
    });
  } catch (error: unknown) {
    const refus = authErrorResponse(error);
    if (refus) return refus;

    console.error('Erreur ouverture de marché:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour du marché.' },
      { status: 500 }
    );
  }
}
