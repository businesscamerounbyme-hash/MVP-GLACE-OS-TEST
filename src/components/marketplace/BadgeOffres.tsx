import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  nombre: number;
  /** `compact` pour les cartes denses : mêmes animations, moins d'encombrement. */
  taille?: 'normal' | 'compact';
  /** Nom de ce qui est compté, au singulier. « offre » par défaut. */
  libelle?: string;
}

/**
 * Compteur d'offres animé.
 *
 * Le nombre était auparavant un texte gris en chasse fixe, que l'œil traitait comme
 * de la décoration. Le scintillement, le point pulsant et l'étincelle en font un
 * signal de disponibilité, qui est l'information la plus utile de la carte.
 *
 * À zéro, l'animation disparaît : elle doit signaler une disponibilité réelle, sinon
 * elle attire l'attention sur un produit qu'on ne peut pas acheter.
 */
export default function BadgeOffres({ nombre, taille = 'normal', libelle = 'offre' }: Props) {
  const pluriel = nombre > 1 ? `${libelle}s disponibles` : `${libelle} disponible`;
  const compact = taille === 'compact';

  if (nombre <= 0) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-bold bg-slate-900/80 border border-slate-800 text-slate-500 ${
          compact ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'
        }`}
      >
        0 {libelle} disponible
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-extrabold badge-scintillant text-white shadow-md ${
        compact ? 'gap-1 px-2 py-0.5 text-[10px]' : 'gap-1.5 px-2.5 py-1 text-[11px]'
      }`}
    >
      <span className={`relative flex shrink-0 ${compact ? 'h-1.5 w-1.5' : 'h-2 w-2'}`}>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-85" />
        <span
          className={`relative inline-flex rounded-full bg-emerald-400 ${
            compact ? 'h-1.5 w-1.5' : 'h-2 w-2'
          }`}
        />
      </span>

      <span className="text-emerald-100 drop-shadow-sm whitespace-nowrap">
        <strong className={`text-white font-black ${compact ? 'text-[11px]' : 'text-xs'}`}>
          {nombre}
        </strong>{' '}
        {pluriel}
      </span>

      <Sparkles
        className={`text-amber-300 animate-spin-slow shrink-0 ${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`}
      />
    </span>
  );
}
