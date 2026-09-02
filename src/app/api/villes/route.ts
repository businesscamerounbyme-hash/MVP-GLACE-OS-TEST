import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { suggestionsVilles } from '@/lib/villes';
import { paysParNom } from '@/lib/pays';

/**
 * Nombre de saisies avant qu'une ville rejoigne les suggestions.
 *
 * À 1, la liste s'enrichit dès la première inscription — mais une faute de frappe
 * devient aussitôt une suggestion proposée à tous, et se propage. Passer à 2 exige
 * que deux personnes écrivent la même chose : une vraie ville y arrive vite, une
 * coquille presque jamais.
 */
const SAISIES_MINIMUM = 1;

/** Clé de comparaison : insensible à la casse, aux accents et à la ponctuation. */
function cle(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

/**
 * Suggestions de villes pour un pays : les 15 plus grandes, complétées par celles que
 * les utilisateurs ont réellement saisies. Une ville absente du jeu de données figé
 * finit donc par être proposée aux suivants.
 */
export async function GET(request: Request) {
  try {
    const pays = new URL(request.url).searchParams.get('pays');
    if (!pays || !paysParNom(pays)) {
      return NextResponse.json({ success: true, villes: [] });
    }

    const figees = suggestionsVilles(pays);

    // Les deux sources : la ville de résidence des comptes et celle des boutiques.
    const [depuisComptes, depuisBoutiques] = await Promise.all([
      prisma.utilisateur.groupBy({
        by: ['ville'],
        where: { pays },
        _count: { ville: true },
      }),
      prisma.boutique.groupBy({
        by: ['ville'],
        where: { pays },
        _count: { ville: true },
      }),
    ]);

    const comptage = new Map<string, { libelle: string; total: number }>();
    for (const l of [...depuisComptes, ...depuisBoutiques]) {
      const libelle = (l.ville ?? '').trim().replace(/\s+/g, ' ');
      if (libelle.length < 2 || libelle.length > 60) continue;
      const k = cle(libelle);
      if (!k) continue;
      const actuel = comptage.get(k);
      // On garde la première graphie rencontrée plutôt que d'en inventer une :
      // « N'Djamena » ne doit pas devenir « N'djamena ».
      comptage.set(k, {
        libelle: actuel?.libelle ?? libelle,
        total: (actuel?.total ?? 0) + l._count.ville,
      });
    }

    const dejaFigees = new Set(figees.map(cle));
    const ajoutees = [...comptage.values()]
      .filter((v) => v.total >= SAISIES_MINIMUM && !dejaFigees.has(cle(v.libelle)))
      .sort((a, b) => b.total - a.total || a.libelle.localeCompare(b.libelle, 'fr'))
      .map((v) => v.libelle);

    return NextResponse.json({
      success: true,
      villes: [...figees, ...ajoutees],
      // Utile pour comprendre d'où vient une suggestion lors d'un diagnostic.
      details: { figees: figees.length, ajoutees: ajoutees.length },
    });
  } catch (error) {
    console.error('Erreur suggestions de villes:', error);
    // Un échec ne doit pas priver l'utilisateur du champ : il reste libre de saisir.
    return NextResponse.json({ success: true, villes: [] });
  }
}
