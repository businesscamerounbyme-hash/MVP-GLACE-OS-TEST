import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { MobileMoneyService } from '@/lib/payment-gateway';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentification requise pour effectuer un paiement.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, targetId, montant, devise, operateur, numeroTelephone } = body;

    if (!type || !targetId || !montant || !operateur || !numeroTelephone) {
      return NextResponse.json(
        { success: false, message: 'Paramètres de paiement incomplets.' },
        { status: 400 }
      );
    }

    // Traitement via le service Mobile Money
    const resultat = await MobileMoneyService.processPayment({
      type,
      targetId,
      montant: parseFloat(montant),
      devise: devise || 'XOF',
      operateur,
      numeroTelephone,
      userEmail: user.email
    });

    return NextResponse.json(resultat);

  } catch (error: any) {
    console.error('Erreur API Paiement MoMo:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Erreur lors du paiement Mobile Money.' },
      { status: 500 }
    );
  }
}
