import { prisma } from './prisma';

export interface MobileMoneyPaymentRequest {
  type: 'ABONNEMENT_FOURNISSEUR' | 'ABONNEMENT_MEMBRE' | 'DEMANDE_BADGE';
  /**
   * Identifiant de la cible : utilisateur pour un abonnement membre, boutique sinon.
   * Toujours dérivé de la session ou validé en propriété par l'appelant — jamais lu
   * directement dans le corps de la requête.
   */
  cibleId: string;
  /** Montant issu du barème serveur (src/lib/tarifs.ts), jamais du client. */
  montant: number;
  devise?: string;
  operateur: 'ORANGE_MONEY' | 'MTN_MOMO' | 'MOOV_MONEY' | 'WAVE';
  numeroTelephone: string;
  userEmail?: string;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  message: string;
  statut: 'ACTIF' | 'EN_ATTENTE' | 'ECHEC';
}

export class MobileMoneyService {
  /**
   * Génère une référence unique de transaction Mobile Money
   */
  static generateReference(prefix: string = 'GOS'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Traite un paiement Mobile Money (Mode Sandbox instantané + préparation production CinetPay/FedaPay)
   */
  static async processPayment(req: MobileMoneyPaymentRequest): Promise<PaymentResult> {
    const reference = this.generateReference(req.operateur === 'ORANGE_MONEY' ? 'OM' : req.operateur === 'MTN_MOMO' ? 'MTN' : req.operateur === 'WAVE' ? 'WAVE' : 'MOOV');
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 jours de validité

    try {
      if (req.type === 'ABONNEMENT_FOURNISSEUR') {
        // Enregistrer / renouveler l'abonnement fournisseur
        await prisma.abonnementFournisseur.create({
          data: {
            boutiqueId: req.cibleId,
            statut: 'ACTIF',
            dateDebut: now,
            dateFin: expiryDate,
            montant: req.montant,
            devise: req.devise || 'XOF',
            referenceMobileMoney: reference,
            operateur: req.operateur,
          },
        });

        // Si la boutique était en attente ou inactive et a déjà été validée, on s'assure qu'elle est publiée
        const boutique = await prisma.boutique.findUnique({
          where: { id: req.cibleId },
        });
        if (boutique && boutique.statut === 'INACTIVE' && boutique.dateValidation) {
          await prisma.boutique.update({
            where: { id: req.cibleId },
            data: { statut: 'PUBLIEE' },
          });
        }

        return {
          success: true,
          reference,
          message: `Abonnement Fournisseur activé avec succès pour 30 jours (${req.operateur}).`,
          statut: 'ACTIF',
        };
      } else if (req.type === 'ABONNEMENT_MEMBRE') {
        // Enregistrer / renouveler l'abonnement membre
        await prisma.abonnementMembre.create({
          data: {
            utilisateurId: req.cibleId,
            statut: 'ACTIF',
            dateDebut: now,
            dateFin: expiryDate,
            montant: req.montant,
            devise: req.devise || 'XOF',
            referenceMobileMoney: reference,
            operateur: req.operateur,
          },
        });

        return {
          success: true,
          reference,
          message: `Abonnement Membre Glacier activé avec succès pour 30 jours (${req.operateur}).`,
          statut: 'ACTIF',
        };
      } else if (req.type === 'DEMANDE_BADGE') {
        // Enregistrer le paiement du badge certifié (en attente de vérification documents)
        await prisma.demandeBadge.create({
          data: {
            boutiqueId: req.cibleId,
            statut: 'PAYEE',
            montant: req.montant,
            referencePaiement: reference,
            operateur: req.operateur,
          },
        });

        return {
          success: true,
          reference,
          message: `Frais de vérification du Badge Certifié réglés (${reference}). Le modérateur va examiner vos documents.`,
          statut: 'ACTIF',
        };
      }

      return {
        success: false,
        reference,
        message: 'Type de paiement non reconnu.',
        statut: 'ECHEC',
      };
    } catch (err: any) {
      console.error('Erreur lors du traitement Mobile Money:', err);
      return {
        success: false,
        reference,
        // Pas de err.message vers le client : cela exposerait la structure interne
        // (contraintes Prisma, noms de tables) à un appelant non authentifié à ce stade.
        message: 'Erreur technique lors du traitement du paiement.',
        statut: 'ECHEC',
      };
    }
  }
}
