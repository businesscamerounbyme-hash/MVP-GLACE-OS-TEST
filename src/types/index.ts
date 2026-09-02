export type Role = 'ADMIN' | 'MODERATOR' | 'SUPPLIER' | 'MEMBER';

export type BoutiqueStatut = 'EN_ATTENTE' | 'PUBLIEE' | 'REJETEE' | 'INACTIVE';

export type CategorieProduit = 'INGREDIENT' | 'EMBALLAGE' | 'EQUIPEMENT';

export type StatutProposition = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

export type StatutAvis = 'EN_ATTENTE' | 'PUBLIE' | 'REJETE';

export type StatutAbonnement = 'ACTIF' | 'EXPIRE' | 'EN_ATTENTE';

export type OperateurMobileMoney = 'ORANGE_MONEY' | 'MTN_MOMO' | 'MOOV_MONEY' | 'WAVE';

export type TypePaiement = 'ABONNEMENT_FOURNISSEUR' | 'ABONNEMENT_MEMBRE' | 'DEMANDE_BADGE';

export interface UserSession {
  id: string;
  nom: string;
  prenom?: string | null;
  photoUrl?: string | null;
  email: string;
  telephone: string;
  pays: string;
  ville: string;
  role: Role;
  hasActiveMembership?: boolean;
  boutiqueId?: string;
  boutiqueStatut?: string;
}

export interface BoutiqueWithDetails {
  id: string;
  nom: string;
  description: string;
  pays: string;
  ville: string;
  quartier: string;
  latitude: number;
  longitude: number;
  telephone: string;
  whatsapp: string;
  statut: string;
  badgeCertifie: boolean;
  noteMoyenne: number;
  dateValidation?: string | null;
  offresCount?: number;
  avisCount?: number;
  distanceKm?: number;
}
