import { TypePaiement } from '@/types';

/**
 * Source de vérité unique des tarifs.
 *
 * Le montant ne doit JAMAIS provenir du client : il était auparavant lu dans le corps
 * de la requête, ce qui permettait de régler un abonnement à 1 FCFA au lieu de 2 000.
 */
export const TARIFS: Record<TypePaiement, { montant: number; devise: string; libelle: string }> = {
  ABONNEMENT_MEMBRE: {
    montant: 2000,
    devise: 'XOF',
    libelle: 'Abonnement Membre Glacier — 30 jours',
  },
  ABONNEMENT_FOURNISSEUR: {
    montant: 5000,
    devise: 'XOF',
    libelle: 'Abonnement Fournisseur — 30 jours',
  },
  DEMANDE_BADGE: {
    montant: 15000,
    devise: 'XOF',
    libelle: 'Badge Certifié « Validé par Le Roi de la Glace »',
  },
};

export function getTarif(type: TypePaiement) {
  const tarif = TARIFS[type];
  if (!tarif) {
    throw new Error(`Type de paiement inconnu : ${type}`);
  }
  return tarif;
}
