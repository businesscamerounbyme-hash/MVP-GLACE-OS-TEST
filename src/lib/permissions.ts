import { UserSession } from '@/types';

/**
 * Filtre les données sensibles d'une boutique pour les non-abonnés
 * Protège le numéro de téléphone et le lien WhatsApp côté back-end
 */
export function sanitizeBoutiqueForUser(boutique: any, user: UserSession | null) {
  // L'administrateur, le modérateur, ou le propriétaire de la boutique ont accès complet
  if (user && (user.role === 'ADMIN' || user.role === 'MODERATOR' || boutique.utilisateurId === user.id)) {
    return {
      ...boutique,
      isUnlocked: true
    };
  }

  // Un membre avec abonnement actif a accès complet
  if (user && user.hasActiveMembership) {
    return {
      ...boutique,
      isUnlocked: true
    };
  }

  // Utilisateur non abonné / public : Masquer les coordonnées directes
  const maskedPhone = boutique.telephone ? boutique.telephone.slice(0, 4) + ' •• •• ••' : null;
  const maskedWhatsapp = boutique.whatsapp ? boutique.whatsapp.slice(0, 4) + ' •• •• ••' : null;

  return {
    ...boutique,
    telephone: maskedPhone,
    whatsapp: maskedWhatsapp,
    isUnlocked: false,
    lockReason: 'Abonnement Membre GLACE OS requis pour contacter directement ce fournisseur.'
  };
}
