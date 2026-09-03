import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface Props {
  ville: string;
  pays?: string;
  quartier?: string | null;
  distanceKm?: number;
  /** `pastille` pour un bloc autonome, `ligne` pour une mention dans un flux de texte. */
  variante?: 'pastille' | 'ligne';
  taille?: 'normal' | 'compact';
}

/**
 * Localisation d'une boutique ou d'une offre.
 *
 * L'adresse est la raison d'être du produit : trouver **où** acheter. Elle était
 * pourtant rendue en gris secondaire, moins visible que le nom du fournisseur.
 *
 * Le bleu ciel lui est réservé : l'ambre appartient à la marque, l'émeraude à la
 * disponibilité. Une troisième couleur permet de repérer une adresse d'un coup d'œil
 * sans la confondre avec le reste.
 */
export default function Adresse({
  ville,
  pays,
  quartier,
  distanceKm,
  variante = 'pastille',
  taille = 'normal',
}: Props) {
  const compact = taille === 'compact';

  const texte = [quartier, ville].filter(Boolean).join(', ');
  const complet = pays ? `${texte} (${pays})` : texte;

  const distance =
    distanceKm !== undefined ? (
      <span
        className={`inline-flex items-center gap-0.5 font-black text-sky-200 shrink-0 ${
          compact ? 'text-[10px]' : 'text-[11px]'
        }`}
      >
        <Navigation className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        {distanceKm} km
      </span>
    ) : null;

  if (variante === 'ligne') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold text-sky-300 ${
          compact ? 'text-[11px]' : 'text-xs'
        }`}
      >
        <MapPin className={`text-sky-400 shrink-0 ${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
        <span className="truncate">{complet}</span>
        {distance && <span className="text-sky-500">•</span>}
        {distance}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-sky-500/15 border border-sky-400/40 text-sky-200 font-bold shadow-sm shadow-sky-500/10 ${
        compact ? 'gap-1 px-2 py-0.5 text-[10px]' : 'gap-1.5 px-2.5 py-1 text-xs'
      }`}
    >
      <MapPin className={`text-sky-300 shrink-0 ${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
      <span className="truncate">{complet}</span>
      {distance && <span className="text-sky-500/70">•</span>}
      {distance}
    </span>
  );
}
