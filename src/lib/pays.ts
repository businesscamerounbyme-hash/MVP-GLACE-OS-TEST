export interface Pays {
  /** Code ISO 3166-1 alpha-2. Clé canonique : c'est lui qui est comparé, jamais le nom. */
  code: string;
  nom: string;
  indicatif: string;
}

/**
 * Les 54 pays africains.
 *
 * Les noms sont écrits ici plutôt que dérivés de `Intl.DisplayNames`, qui rendrait
 * « Côte d’Ivoire » avec une apostrophe typographique là où la base contient une
 * apostrophe droite. Deux graphies pour un même pays, et les filtres ne trouvent plus
 * rien — c'est précisément ce genre d'écart qui a déjà cassé des données ici.
 *
 * Les drapeaux ne sont pas stockés : `drapeau()` les calcule depuis le code ISO.
 */
export const PAYS_AFRICAINS: Pays[] = [
  { code: 'DZ', nom: 'Algérie', indicatif: '+213' },
  { code: 'AO', nom: 'Angola', indicatif: '+244' },
  { code: 'BJ', nom: 'Bénin', indicatif: '+229' },
  { code: 'BW', nom: 'Botswana', indicatif: '+267' },
  { code: 'BF', nom: 'Burkina Faso', indicatif: '+226' },
  { code: 'BI', nom: 'Burundi', indicatif: '+257' },
  { code: 'CM', nom: 'Cameroun', indicatif: '+237' },
  { code: 'CV', nom: 'Cap-Vert', indicatif: '+238' },
  { code: 'CF', nom: 'République centrafricaine', indicatif: '+236' },
  { code: 'KM', nom: 'Comores', indicatif: '+269' },
  { code: 'CG', nom: 'Congo-Brazzaville', indicatif: '+242' },
  { code: 'CD', nom: 'Congo-Kinshasa', indicatif: '+243' },
  { code: 'CI', nom: "Côte d'Ivoire", indicatif: '+225' },
  { code: 'DJ', nom: 'Djibouti', indicatif: '+253' },
  { code: 'EG', nom: 'Égypte', indicatif: '+20' },
  { code: 'ER', nom: 'Érythrée', indicatif: '+291' },
  { code: 'SZ', nom: 'Eswatini', indicatif: '+268' },
  { code: 'ET', nom: 'Éthiopie', indicatif: '+251' },
  { code: 'GA', nom: 'Gabon', indicatif: '+241' },
  { code: 'GM', nom: 'Gambie', indicatif: '+220' },
  { code: 'GH', nom: 'Ghana', indicatif: '+233' },
  { code: 'GN', nom: 'Guinée', indicatif: '+224' },
  { code: 'GW', nom: 'Guinée-Bissau', indicatif: '+245' },
  { code: 'GQ', nom: 'Guinée équatoriale', indicatif: '+240' },
  { code: 'KE', nom: 'Kenya', indicatif: '+254' },
  { code: 'LS', nom: 'Lesotho', indicatif: '+266' },
  { code: 'LR', nom: 'Liberia', indicatif: '+231' },
  { code: 'LY', nom: 'Libye', indicatif: '+218' },
  { code: 'MG', nom: 'Madagascar', indicatif: '+261' },
  { code: 'MW', nom: 'Malawi', indicatif: '+265' },
  { code: 'ML', nom: 'Mali', indicatif: '+223' },
  { code: 'MA', nom: 'Maroc', indicatif: '+212' },
  { code: 'MU', nom: 'Maurice', indicatif: '+230' },
  { code: 'MR', nom: 'Mauritanie', indicatif: '+222' },
  { code: 'MZ', nom: 'Mozambique', indicatif: '+258' },
  { code: 'NA', nom: 'Namibie', indicatif: '+264' },
  { code: 'NE', nom: 'Niger', indicatif: '+227' },
  { code: 'NG', nom: 'Nigeria', indicatif: '+234' },
  { code: 'UG', nom: 'Ouganda', indicatif: '+256' },
  { code: 'RW', nom: 'Rwanda', indicatif: '+250' },
  { code: 'ST', nom: 'Sao Tomé-et-Principe', indicatif: '+239' },
  { code: 'SN', nom: 'Sénégal', indicatif: '+221' },
  { code: 'SC', nom: 'Seychelles', indicatif: '+248' },
  { code: 'SL', nom: 'Sierra Leone', indicatif: '+232' },
  { code: 'SO', nom: 'Somalie', indicatif: '+252' },
  { code: 'SD', nom: 'Soudan', indicatif: '+249' },
  { code: 'SS', nom: 'Soudan du Sud', indicatif: '+211' },
  { code: 'ZA', nom: 'Afrique du Sud', indicatif: '+27' },
  { code: 'TZ', nom: 'Tanzanie', indicatif: '+255' },
  { code: 'TD', nom: 'Tchad', indicatif: '+235' },
  { code: 'TG', nom: 'Togo', indicatif: '+228' },
  { code: 'TN', nom: 'Tunisie', indicatif: '+216' },
  { code: 'ZM', nom: 'Zambie', indicatif: '+260' },
  { code: 'ZW', nom: 'Zimbabwe', indicatif: '+263' },
];

/**
 * Drapeau déduit du code ISO : deux lettres converties en indicateurs régionaux.
 * Aucun fichier image, aucune requête réseau — le système dessine le glyphe.
 */
export function drapeau(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return '';
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

export function paysParCode(code: string): Pays | undefined {
  return PAYS_AFRICAINS.find((p) => p.code === code.toUpperCase());
}

/** Retrouve un pays par son nom, en tolérant accents, casse et apostrophes. */
export function paysParNom(nom: string): Pays | undefined {
  const normalise = (v: string) =>
    v
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z]/gi, '')
      .toLowerCase();
  const cible = normalise(nom);
  return PAYS_AFRICAINS.find((p) => normalise(p.nom) === cible);
}

export const PAYS_TRIES = [...PAYS_AFRICAINS].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
