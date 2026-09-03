import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface Props {
  certifie: boolean;
  taille?: 'normal' | 'compact';
}

/**
 * Statut de vérification d'une boutique.
 *
 * L'ancien libellé « Vérifié », affiché en gris à toute boutique sans badge, disait
 * l'inverse de la réalité : aucune vérification ne lui correspondait, et il rendait
 * l'option payante inutile — pourquoi payer pour être « certifié » quand on est déjà
 * annoncé « vérifié » ?
 *
 * Deux états franchement opposés désormais : vert pour la boutique certifiée — la
 * couleur porte ici le gage de confiance, qui est le signal le plus important du
 * site — et rouge pour celle qui ne l'est pas.
 */
export default function BadgeVerification({ certifie, taille = 'normal' }: Props) {
  const compact = taille === 'compact';
  const dimensions = compact
    ? 'gap-1 px-2 py-0.5 text-[9px]'
    : 'gap-1 px-2.5 py-0.5 text-[10px]';
  const icone = compact ? 'w-3 h-3' : 'w-3.5 h-3.5';

  if (certifie) {
    return (
      <span
        className={`shrink-0 inline-flex items-center rounded-full bg-emerald-500/25 text-emerald-100 border border-emerald-400/60 font-extrabold tracking-wide uppercase certifie-glow ${dimensions}`}
      >
        <ShieldCheck className={`text-emerald-300 ${icone}`} />
        <span>Certifié</span>
      </span>
    );
  }

  return (
    <span
      title="Cette boutique n’a pas encore fourni ses justificatifs à GLACE OS."
      className={`shrink-0 inline-flex items-center rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/40 font-extrabold tracking-wide uppercase ${dimensions}`}
    >
      <ShieldAlert className={`text-rose-400 ${icone}`} />
      <span>Non vérifiée</span>
    </span>
  );
}
