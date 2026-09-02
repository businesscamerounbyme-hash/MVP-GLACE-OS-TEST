import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { estEmailValide } from '@/lib/validation';
import { ipDepuisRequete, verifierLimite, enregistrerTentative } from '@/lib/rate-limit';
import { envoyerCourriel, courrielReinitialisation } from '@/lib/email';
import { nomComplet } from '@/lib/nom';

const DUREE_VALIDITE_MINUTES = 60;

/**
 * Demande de réinitialisation.
 *
 * La réponse est identique que l'adresse existe ou non : distinguer les deux cas
 * transformerait ce formulaire en annuaire des comptes inscrits.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const reponseNeutre = NextResponse.json({
      success: true,
      message:
        'Si un compte existe pour cette adresse, un lien de réinitialisation vient d’être envoyé.',
    });

    if (!estEmailValide(email)) return reponseNeutre;

    const emailNormalise = String(email).toLowerCase().trim();
    const ip = ipDepuisRequete(request);

    // Sans limite, ce point d'entrée permettrait d'inonder une boîte de messages.
    const limite = await verifierLimite(emailNormalise, ip);
    if (!limite.autorise) {
      return NextResponse.json({ success: false, message: limite.message }, { status: 429 });
    }
    await enregistrerTentative(emailNormalise, ip, false);

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email: emailNormalise },
      select: { id: true, nom: true, prenom: true, email: true },
    });

    if (!utilisateur) return reponseNeutre;

    // Les demandes précédentes encore valides sont annulées : plusieurs liens actifs
    // multiplient les occasions qu'un seul d'entre eux fuite.
    await prisma.reinitialisationMotDePasse.updateMany({
      where: { utilisateurId: utilisateur.id, utiliseLe: null },
      data: { utiliseLe: new Date() },
    });

    const jeton = crypto.randomBytes(32).toString('base64url');
    const empreinte = crypto.createHash('sha256').update(jeton).digest('hex');

    await prisma.reinitialisationMotDePasse.create({
      data: {
        utilisateurId: utilisateur.id,
        tokenHash: empreinte,
        expiration: new Date(Date.now() + DUREE_VALIDITE_MINUTES * 60 * 1000),
      },
    });

    const base = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const lien = `${base}/reinitialiser?jeton=${jeton}`;

    const courriel = courrielReinitialisation(lien, nomComplet(utilisateur));
    await envoyerCourriel({ ...courriel, destinataire: utilisateur.email });

    return reponseNeutre;
  } catch (error) {
    console.error('Erreur demande de réinitialisation:', error);
    // Même en cas d'échec technique, la réponse reste neutre.
    return NextResponse.json({
      success: true,
      message:
        'Si un compte existe pour cette adresse, un lien de réinitialisation vient d’être envoyé.',
    });
  }
}
