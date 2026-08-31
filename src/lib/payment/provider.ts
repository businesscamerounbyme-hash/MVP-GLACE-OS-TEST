import { TypePaiement, OperateurMobileMoney } from '@/types';

export interface DemandeInitiation {
  referenceInterne: string;
  type: TypePaiement;
  montant: number;
  devise: string;
  operateur: OperateurMobileMoney;
  numeroTelephone: string;
  libelle: string;
  userEmail?: string;
}

export interface ResultatInitiation {
  /** Identifiant de la transaction chez l'agrégateur, si déjà connu. */
  referencePSP?: string;
  /** URL de paiement à ouvrir, pour les agrégateurs à redirection. */
  urlPaiement?: string;
  /** Message destiné à l'utilisateur (ex. « validez sur votre téléphone »). */
  message: string;
}

export type IssueWebhook =
  | { valide: false; raison: string }
  | {
      valide: true;
      referenceInterne: string;
      referencePSP: string;
      statut: 'REUSSI' | 'ECHOUE';
      motifEchec?: string;
    };

/**
 * Contrat commun à tous les agrégateurs Mobile Money.
 *
 * La règle qui ne se négocie pas : `initier` ne fait qu'ouvrir une transaction. Seul
 * `interpreterWebhook`, sur une charge utile dont la signature a été vérifiée, peut
 * conclure qu'un paiement a réussi. La réponse renvoyée au navigateur est fournie par
 * le client et ne peut donc jamais servir de preuve d'encaissement.
 */
export interface PaymentProvider {
  readonly nom: string;
  /** Vrai si l'issue est connue immédiatement, sans webhook (simulation uniquement). */
  readonly confirmationImmediate: boolean;

  initier(demande: DemandeInitiation): Promise<ResultatInitiation>;

  interpreterWebhook(corpsBrut: string, entetes: Headers): Promise<IssueWebhook>;
}
