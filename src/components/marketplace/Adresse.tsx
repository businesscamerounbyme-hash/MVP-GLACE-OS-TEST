import React from 'react';
import Link from 'next/link';
import { MapPin, Navigation } from 'lucide-react';

interface Props {
  ville: string;
  pays?: string;
  quartier?: string | null;
  distanceKm?: number;
  /** `pastille` pour un bloc autonome, `ligne` pour une mention dans un flux de texte. */
  variante?: 'pastille' | 'ligne';
  taille?: 'normal' | 'compact';
  /**
   * Rend l adresse cliquable : elle mene aux boutiques de cette ville.
   *
   * A laisser a false lorsque l adresse est deja contenue dans un lien — imbriquer
   * deux ancres produit un balisage invalide, que les navigateurs resolvent chacun
   * a leur maniere.
   */
  cliquable?: boolean;
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
  cliquable = false,
}: Props) {
  const compact = taille === 'compact';

  const texte = [quartier, ville].filter(Boolean).join(', ');
  const complet = pays ? `${texte} (${pays})` : texte;

  const distance =
    distanceKm !== undefined ? (
      <span
        className={`inline-flex items-center gap-0.5 font-black text-white drop-shadow-sm shrink-0 ${
          compact ? 'text-[10px]' : 'text-[11px]'
        }`}
      >
        <Navigation className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        {distanceKm} km
      </span>
    ) : null;

  // Enveloppe commune aux deux variantes : la destination est toujours la liste des
  // boutiques filtree sur cette ville.
  const enrobe = (contenu: React.ReactElement) =>
    cliquable ? (
      <Link
        href={`/boutiques?ville=${encodeURIComponent(ville)}`}
        title={`Voir les boutiques à ${ville}`}
        className="inline-flex max-w-full min-w-0 hover:brightness-125 hover:scale-[1.03] active:scale-95 transition"
      >
        {contenu}
      </Link>
    ) : (
      contenu
    );

  if (variante === 'ligne') {
    return enrobe(
      <span
        className={`inline-flex items-center gap-1.5 font-semibold text-sky-300 max-w-full min-w-0 ${
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

  return enrobe(
    <span
      className={`inline-flex items-center rounded-full adresse-scintillante text-white font-bold max-w-full min-w-0 ${
        cliquable ? 'cursor-pointer hover:brightness-125' : ''
      } ${compact ? 'gap-1 px-2 py-0.5 text-[10px]' : 'gap-1.5 px-2.5 py-1 text-xs'}`}
    >
      {/* Le fond défile : sans ombre portée, le texte devient illisible chaque fois que
          la bande claire du dégradé passe dessous. */}
      <MapPin
        className={`text-sky-100 drop-shadow shrink-0 ${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`}
      />
      <span className="truncate text-white drop-shadow-sm">{complet}</span>
      {distance && <span className="text-sky-100/70">•</span>}
      {distance}
    </span>
  );
}
