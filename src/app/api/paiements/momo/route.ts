import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireUser, requireBoutiqueOwnership, authErrorResponse } from '@/lib/guard';
import { getTarif } from '@/lib/tarifs';
import { MobileMoneyService } from '@/lib/payment-gateway';
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

export async function POST(request: Request) {
  try {
    const user = requireUser(await getCurrentUser());

    const body = await request.json();
    const { type, boutiqueId, operateur, numeroTelephone } = body;

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

    // La cible n'est jamais lue telle quelle dans la requête : elle est dérivée de la
    // session pour un abonnement membre, et vérifiée en propriété pour une boutique.
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

    // Le montant vient du barème serveur, jamais du client.
    const tarif = getTarif(type);

    const resultat = await MobileMoneyService.processPayment({
      type,
      cibleId,
      montant: tarif.montant,
      devise: tarif.devise,
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
      { success: false, message: 'Erreur lors du paiement Mobile Money.' },
      { status: 500 }
    );
  }
}
