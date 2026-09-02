'use client';

import { useEffect, useState } from 'react';
import { suggestionsVilles } from './villes';

// Un même pays est souvent consulté plusieurs fois dans une session (aller-retour entre
// les onglets du formulaire). Le cache évite de redemander la même liste au serveur.
const cache = new Map<string, string[]>();

/**
 * Suggestions de villes pour un pays.
 *
 * Part immédiatement des villes figées, puis les remplace par la liste enrichie du
 * serveur — celle qui inclut les villes réellement saisies par d'autres utilisateurs.
 * Aucune attente : le champ est utilisable dès le premier rendu, et s'étoffe ensuite.
 */
export function useSuggestionsVilles(pays: string): string[] {
  const [villes, setVilles] = useState<string[]>(() => suggestionsVilles(pays));

  useEffect(() => {
    if (!pays) {
      setVilles([]);
      return;
    }

    const enCache = cache.get(pays);
    if (enCache) {
      setVilles(enCache);
      return;
    }

    // Repli immédiat sur la liste figée le temps de la réponse.
    setVilles(suggestionsVilles(pays));

    let annule = false;
    fetch(`/api/villes?pays=${encodeURIComponent(pays)}`)
      .then((r) => r.json())
      .then((d) => {
        if (annule || !d.success || !Array.isArray(d.villes) || !d.villes.length) return;
        cache.set(pays, d.villes);
        setVilles(d.villes);
      })
      .catch(() => undefined);

    return () => {
      annule = true;
    };
  }, [pays]);

  return villes;
}
