import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireUser, requireBoutiqueOwnership, authErrorResponse } from '@/lib/guard';
import { ouvrirPaiement } from '@/lib/payment/service';
import { TypePaiement, OperateurMobileMoney } from '@/types';

const TYPES_VALIDES: TypePaiement[] = [
  'ABONNEMENT_MEMBRE',
  'ABONNEMENT_FOURNISSEUR',
  'DEMANDE_BADGE',
];

const OPERATEURS_VALIDES: OperateurMobileMoney[] = [
  'ORANGE_MONEY',
  'MTN_MOMO',
  'MOOV_MONEY',
  'WAVE',
];

/**
 * Ouvre un paiement Mobile Money. N'accorde aucun droit : l'abonnement ou le badge
 * ne sera créé que lorsque l'agrégateur aura confirmé l'encaissement sur
 * /api/paiements/webhook.
 */
export async function POST(request: Request) {
  try {
    const user = requireUser(await getCurrentUser());

    const { type, boutiqueId, operateur, numeroTelephone } = await request.json();

    if (!TYPES_VALIDES.includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Type de paiement invalide.' },
        { status: 400 }
      );
    }

    if (!OPERATEURS_VALIDES.includes(operateur)) {
      return NextResponse.json(
        { success: false, message: 'Opérateur Mobile Money invalide.' },
        { status: 400 }
      );
    }

    if (!numeroTelephone || !/^[+0-9\s-]{8,20}$/.test(String(numeroTelephone))) {
      return NextResponse.json(
        { success: false, message: 'Numéro de téléphone invalide.' },
        { status: 400 }
      );
    }

    // La cible n'est jamais lue telle quelle : dérivée de la session pour un abonnement
    // membre, vérifiée en propriété pour tout ce qui concerne une boutique.
    let cibleId: string;
    if (type === 'ABONNEMENT_MEMBRE') {
      cibleId = user.id;
    } else {
      if (!boutiqueId) {
        return NextResponse.json(
          { success: false, message: 'Boutique non précisée.' },
          { status: 400 }
        );
      }
      const boutique = await requireBoutiqueOwnership(user, boutiqueId);
      cibleId = boutique.id;
    }

    const resultat = await ouvrirPaiement({
      utilisateurId: user.id,
      type,
      cibleId,
      operateur,
      numeroTelephone: String(numeroTelephone).trim(),
      userEmail: user.email,
    });

    return NextResponse.json(resultat);
  } catch (error: unknown) {
    const refus = authErrorResponse(error);
    if (refus) return refus;

    console.error('Erreur API Paiement MoMo:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l’initiation du paiement.' },
      { status: 500 }
    );
  }
}
