import { NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payment';
import { appliquerIssuePaiement } from '@/lib/payment/service';

/**
 * Confirmation d'encaissement par l'agrégateur.
 *
 * Point d'entrée non authentifié par session — c'est un serveur tiers qui appelle.
 * La preuve d'authenticité est la signature de la charge utile, vérifiée par
 * l'agrégateur actif. Une charge non signée ou mal signée est rejetée sans effet.
 *
 * Toujours répondre 200 sur un rejeu : un agrégateur qui reçoit une erreur réessaie,
 * et un rejeu correctement ignoré n'est pas une erreur.
 */
export async function POST(request: Request) {
  // Le corps est lu en texte brut : la signature porte sur les octets reçus, pas sur
  // un objet re-sérialisé, dont l'ordre des clés pourrait différer.
  const corpsBrut = await request.text();

  try {
    const provider = getPaymentProvider();
    const issue = await provider.interpreterWebhook(corpsBrut, request.headers);

    if (!issue.valide) {
      console.warn('Webhook paiement rejeté:', issue.raison);
      return NextResponse.json({ success: false, message: 'Rejeté.' }, { status: 400 });
    }

    const resultat = await appliquerIssuePaiement({
      referenceInterne: issue.referenceInterne,
      referencePSP: issue.referencePSP,
      statut: issue.statut,
      motifEchec: issue.motifEchec,
      payloadBrut: corpsBrut,
    });

    return NextResponse.json({ success: true, ...resultat });
  } catch (error) {
    console.error('Erreur webhook paiement:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne.' },
      { status: 500 }
    );
  }
}
