import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { cleVisiteur, jourCourant } from '@/lib/audience';

const CANAUX = ['TELEPHONE', 'WHATSAPP'];

/**
 * Enregistre un contact déclenché vers un fournisseur.
 *
 * C'est la mesure qui compte pour lui : une vue dit qu'on l'a regardé, un contact dit
 * qu'on a voulu l'appeler. Dédoublonné par jour et par canal — la même personne qui
 * clique trois fois reste un seul prospect, et gonfler ce chiffre le rendrait inutile
 * au moment de décider si l'abonnement vaut son prix.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: boutiqueId } = await params;
    const { canal } = await request.json();

    if (!CANAUX.includes(canal)) {
      return NextResponse.json({ success: false, message: 'Canal inconnu.' }, { status: 400 });
    }

    const boutique = await prisma.boutique.findUnique({
      where: { id: boutiqueId },
      select: { id: true, utilisateurId: true, statut: true },
    });
    if (!boutique || boutique.statut !== 'PUBLIEE') {
      return NextResponse.json({ success: true, compte: false });
    }

    const user = await getCurrentUser();
    if (user && user.id === boutique.utilisateurId) {
      return NextResponse.json({ success: true, compte: false });
    }

    // Le nombre de lignes reellement inserees dit si la visite comptait : annoncer
    // un succes sans le lire ferait croire a un doublon compte.
    const ecrit = await prisma.contactBoutique.createMany({
      data: [{ boutiqueId, visiteurCle: await cleVisiteur(), canal, jour: jourCourant() }],
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true, compte: ecrit.count > 0 });
  } catch (error) {
    console.error('Erreur enregistrement contact:', error);
    return NextResponse.json({ success: true, compte: false });
  }
}
