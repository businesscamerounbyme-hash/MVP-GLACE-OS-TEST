import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { requireUser, authErrorResponse } from '@/lib/guard';
import { depuisJours } from '@/lib/audience';

/**
 * Audience de la boutique du fournisseur connecté.
 *
 * Scopée par `utilisateurId` : un fournisseur ne consulte que ses propres chiffres,
 * ceux d'un concurrent renseigneraient sur son activité commerciale.
 */
export async function GET() {
  try {
    const user = requireUser(await getCurrentUser(), ['SUPPLIER', 'ADMIN']);

    const boutique = await prisma.boutique.findFirst({
      where: { utilisateurId: user.id },
      select: { id: true, dateCreation: true },
    });
    if (!boutique) {
      return NextResponse.json(
        { success: false, message: 'Aucune boutique associée à votre compte.' },
        { status: 404 }
      );
    }

    const sept = depuisJours(7);
    const trente = depuisJours(30);

    const [vues30, vues7, contacts30, contacts7, vuesTotal, contactsTotal, parCanal, offres] =
      await Promise.all([
        prisma.vueBoutique.count({ where: { boutiqueId: boutique.id, dateVue: { gte: trente } } }),
        prisma.vueBoutique.count({ where: { boutiqueId: boutique.id, dateVue: { gte: sept } } }),
        prisma.contactBoutique.count({
          where: { boutiqueId: boutique.id, dateContact: { gte: trente } },
        }),
        prisma.contactBoutique.count({
          where: { boutiqueId: boutique.id, dateContact: { gte: sept } },
        }),
        prisma.vueBoutique.count({ where: { boutiqueId: boutique.id } }),
        prisma.contactBoutique.count({ where: { boutiqueId: boutique.id } }),
        prisma.contactBoutique.groupBy({
          by: ['canal'],
          where: { boutiqueId: boutique.id, dateContact: { gte: trente } },
          _count: { canal: true },
        }),
        prisma.offre.count({ where: { boutiqueId: boutique.id } }),
      ]);

    // Vues quotidiennes des 30 derniers jours, pour la courbe. Les jours sans visite
    // sont remplis à zéro : une courbe qui saute les jours creux ment sur la régularité.
    const brut = await prisma.vueBoutique.groupBy({
      by: ['jour'],
      where: { boutiqueId: boutique.id, dateVue: { gte: trente } },
      _count: { jour: true },
    });
    const parJour = new Map(brut.map((l) => [l.jour, l._count.jour]));
    const serie: { jour: string; vues: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const cle = d.toISOString().slice(0, 10);
      serie.push({ jour: cle, vues: parJour.get(cle) ?? 0 });
    }

    return NextResponse.json({
      success: true,
      statistiques: {
        vues: { total: vuesTotal, trenteJours: vues30, septJours: vues7 },
        contacts: { total: contactsTotal, trenteJours: contacts30, septJours: contacts7 },
        // Part des visiteurs qui sont allés jusqu'à vouloir appeler : c'est le chiffre
        // qui dit si la fiche convainc, indépendamment du volume de trafic.
        tauxContact: vues30 > 0 ? Math.round((contacts30 / vues30) * 100) : 0,
        parCanal: parCanal.map((c) => ({ canal: c.canal, nombre: c._count.canal })),
        serie,
        offres,
        depuis: boutique.dateCreation,
      },
    });
  } catch (error: unknown) {
    const refus = authErrorResponse(error);
    if (refus) return refus;

    console.error('Erreur statistiques fournisseur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du chargement des statistiques.' },
      { status: 500 }
    );
  }
}
