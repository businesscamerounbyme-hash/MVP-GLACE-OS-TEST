/**
 * Compose le nom affiché.
 *
 * Le champ `prenom` a été ajouté après la mise en service : les comptes créés avant
 * gardent leur nom complet dans `nom` avec `prenom` à null. Les deux cas donnent donc
 * un affichage correct sans avoir à découper rétroactivement des noms existants —
 * un découpage automatique se serait trompé sur « Fatou Ndiaye (Dakar Ingrédients) ».
 */
export function nomComplet(u: { nom: string; prenom?: string | null }): string {
  return [u.prenom, u.nom].filter(Boolean).join(' ').trim();
}

/** Initiales pour l'avatar de repli, quand aucune photo n'est chargée. */
export function initiales(u: { nom: string; prenom?: string | null }): string {
  if (u.prenom && u.nom) {
    return (u.prenom[0] + u.nom[0]).toUpperCase();
  }
  return u.nom.slice(0, 2).toUpperCase();
}
