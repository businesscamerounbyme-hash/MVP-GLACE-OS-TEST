import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { cleVisiteur, jourCourant } from '@/lib/audience';

/**
 * Enregistre la consultation d'une fiche boutique.
 *
 * Silencieuse par nature : une statistique qui échoue ne doit jamais empêcher
 * l'affichage de la page. La réponse est donc toujours un succès, même si rien
 * n'a été écrit.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: boutiqueId } = await params;

    const boutique = await prisma.boutique.findUnique({
      where: { id: boutiqueId },
      select: { id: true, utilisateurId: true, statut: true },
    });
    if (!boutique || boutique.statut !== 'PUBLIEE') {
      return NextResponse.json({ success: true, compte: false });
    }

    // Le fournisseur qui consulte sa propre fiche ne se compte pas lui-même :
    // sinon le chiffre qu'il regarde mesure surtout sa propre activité.
    const user = await getCurrentUser();
    if (user && (user.id === boutique.utilisateurId || user.role === 'ADMIN' || user.role === 'MODERATOR')) {
      return NextResponse.json({ success: true, compte: false });
    }

    // createMany + skipDuplicates s'appuie sur la contrainte d'unicité : deux onglets
    // ouverts en même temps ne créent pas deux lignes, sans verrou applicatif.
    // Le nombre de lignes reellement inserees dit si la visite comptait : annoncer
    // un succes sans le lire ferait croire a un doublon compte.
    const ecrit = await prisma.vueBoutique.createMany({
      data: [{ boutiqueId, visiteurCle: await cleVisiteur(), jour: jourCourant() }],
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true, compte: ecrit.count > 0 });
  } catch (error) {
    console.error('Erreur enregistrement vue:', error);
    return NextResponse.json({ success: true, compte: false });
  }
}
