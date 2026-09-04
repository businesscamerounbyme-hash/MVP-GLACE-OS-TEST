import { UserSession } from '@/types';

/**
 * Détermine si l'utilisateur a le droit de voir les coordonnées directes d'une boutique.
 * Propriétaire, administrateur, modérateur, ou membre avec abonnement actif.
 */
function peutVoirContacts(boutique: any, user: UserSession | null): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN' || user.role === 'MODERATOR') return true;
  if (boutique.utilisateurId === user.id) return true;
  return Boolean(user.hasActiveMembership);
}

/**
 * Projette une boutique vers l'extérieur en **liste blanche**.
 *
 * L'implémentation précédente recopiait l'objet entier (`...boutique`) puis masquait
 * quelques champs. Toute donnée jointe non prévue passait donc au travers : c'est ainsi
 * que l'email du fournisseur était servi en clair à des visiteurs anonymes, alors même
 * que son téléphone était masqué derrière l'abonnement.
 *
 * Ici, seul ce qui est explicitement listé sort. Un nouveau champ ajouté au modèle
 * n'est pas exposé tant qu'il n'a pas été ajouté ici volontairement.
 */
export function sanitizeBoutiqueForUser(boutique: any, user: UserSession | null) {
  const deverrouille = peutVoirContacts(boutique, user);

  const base = {
    id: boutique.id,
    nom: boutique.nom,
    description: boutique.description,
    pays: boutique.pays,
    ville: boutique.ville,
    quartier: boutique.quartier,
    latitude: boutique.latitude,
    longitude: boutique.longitude,
    statut: boutique.statut,
    badgeCertifie: boutique.badgeCertifie,
    noteMoyenne: boutique.noteMoyenne,
    dateValidation: boutique.dateValidation ?? null,
    dateCreation: boutique.dateCreation ?? null,
    utilisateurId: boutique.utilisateurId,

    // Champs calculés éventuellement ajoutés par les routes (comptages, distance).
    offresCount: boutique.offresCount,
    avisCount: boutique.avisCount,
    distanceKm: boutique.distanceKm,

    // Relations : projetées à leur tour, jamais recopiées telles quelles.
    offres: boutique.offres,
    avis: Array.isArray(boutique.avis) ? boutique.avis.map(sanitizeAvis) : undefined,

    // Le propriétaire est identifié par son nom public uniquement. Son email est une
    // donnée personnelle qui n'a aucune raison d'être servie au public.
    proprietaire: boutique.utilisateur
      ? { id: boutique.utilisateur.id, nom: boutique.utilisateur.nom }
      : undefined,
  };

  if (deverrouille) {
    return {
      ...base,
      telephone: boutique.telephone,
      whatsapp: boutique.whatsapp,
      isUnlocked: true,
    };
  }

  return {
    ...base,
    telephone: boutique.telephone ? boutique.telephone.slice(0, 4) + ' •• •• ••' : null,
    whatsapp: boutique.whatsapp ? boutique.whatsapp.slice(0, 4) + ' •• •• ••' : null,
    isUnlocked: false,
    lockReason:
      'Abonnement Membre GLACE OS requis pour contacter directement ce fournisseur.',
  };
}

/** Projette un avis : l'auteur est réduit à son identité publique. */
export function sanitizeAvis(avis: any) {
  return {
    id: avis.id,
    note: avis.note,
    commentaire: avis.commentaire,
    photoUrl: avis.photoUrl ?? null,
    statut: avis.statut,
    dateCreation: avis.dateCreation,
    auteur: avis.utilisateur
      ? { id: avis.utilisateur.id, nom: avis.utilisateur.nom, ville: avis.utilisateur.ville }
      : undefined,
  };
}
