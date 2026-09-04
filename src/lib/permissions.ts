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
 * Masque un nom en gardant son premier mot.
 *
 * Le premier mot suffit à reconnaître une boutique qu'on cherche, et laisse la liste
 * lisible ; les suivants, eux, la rendraient identifiable auprès de n'importe qui en
 * ville — ce qui permettrait de contourner l'abonnement en allant simplement demander
 * l'adresse sur place.
 *
 * La longueur des mots et la ponctuation sont conservées : le masque doit ressembler
 * à un nom, pas à un bloc opaque.
 */
/**
 * Arrondit une coordonnee pour les non-abonnes.
 *
 * Masquer le nom et le quartier ne servirait a rien en laissant passer les
 * coordonnees exactes : elles sont plus precises encore, et il suffirait de les
 * coller dans une carte pour se rendre sur place. Un arrondi au centieme de degre
 * place le point dans le bon secteur — la carte garde son interet — sans designer
 * la boutique.
 */
function flouterCoordonnee(v: number): number {
  return Math.round(v * 100) / 100;
}

function masquerNom(nom: string): string {
  const mots = nom.trim().split(/\s+/);
  if (mots.length <= 1) return nom;
  return [
    mots[0],
    ...mots.slice(1).map((mot) => mot.replace(/[\p{L}\p{N}]/gu, '•')),
  ].join(' ');
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
    // Nom et quartier masques tant que labonnement nest pas actif : ensemble, ils
    // suffisent a retrouver le fournisseur sur place et rendraient labonnement
    // inutile. La ville, elle, reste visible — elle porte la recherche et les
    // filtres, et une ville entiere est trop vaste pour localiser une boutique.
    nom: deverrouille ? boutique.nom : masquerNom(boutique.nom),
    description: boutique.description,
    pays: boutique.pays,
    ville: boutique.ville,
    quartier: deverrouille ? boutique.quartier : null,
    latitude: deverrouille ? boutique.latitude : flouterCoordonnee(boutique.latitude),
    longitude: deverrouille ? boutique.longitude : flouterCoordonnee(boutique.longitude),
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
