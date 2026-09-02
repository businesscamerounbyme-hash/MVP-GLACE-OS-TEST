import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { verifierMotDePasse } from '@/lib/validation';

/**
 * Consommation du jeton et changement effectif du mot de passe.
 *
 * Le jeton est comparé par son empreinte, marqué utilisé dans la même transaction
 * que le changement, et `motDePasseModifieLe` est mis à jour pour invalider les
 * sessions ouvertes — sans quoi un intrus déjà connecté le resterait 30 jours,
 * précisément dans le cas où l'on réinitialise pour se débarrasser de lui.
 */
export async function POST(request: Request) {
  try {
    const { jeton, nouveauMotDePasse } = await request.json();

    if (!jeton || typeof jeton !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Lien de réinitialisation invalide.' },
        { status: 400 }
      );
    }

    const verif = verifierMotDePasse(nouveauMotDePasse);
    if (!verif.ok) {
      return NextResponse.json({ success: false, message: verif.message }, { status: 400 });
    }

    const empreinte = crypto.createHash('sha256').update(jeton).digest('hex');

    const demande = await prisma.reinitialisationMotDePasse.findUnique({
      where: { tokenHash: empreinte },
      include: { utilisateur: { select: { id: true } } },
    });

    if (!demande || demande.utiliseLe || demande.expiration < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.',
        },
        { status: 400 }
      );
    }

    const empreinteMotDePasse = await hashPassword(nouveauMotDePasse);

    await prisma.$transaction(async (tx) => {
      // Marquage conditionnel : deux requêtes simultanées ne peuvent pas consommer
      // le même jeton deux fois.
      const consomme = await tx.reinitialisationMotDePasse.updateMany({
        where: { id: demande.id, utiliseLe: null },
        data: { utiliseLe: new Date() },
      });
      if (consomme.count === 0) {
        throw new Error('Jeton déjà consommé.');
      }

      await tx.utilisateur.update({
        where: { id: demande.utilisateurId },
        data: { motDePasse: empreinteMotDePasse, motDePasseModifieLe: new Date() },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé. Vous pouvez vous connecter.',
    });
  } catch (error) {
    console.error('Erreur réinitialisation:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la réinitialisation.' },
      { status: 500 }
    );
  }
}
