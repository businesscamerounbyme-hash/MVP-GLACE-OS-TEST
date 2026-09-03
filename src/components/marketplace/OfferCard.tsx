'use client';

import React from 'react';
import Link from 'next/link';
import { Store, MapPin, Tag, ArrowRight, ShieldCheck } from 'lucide-react';
import Adresse from './Adresse';

interface OfferCardProps {
  id: string;
  prix: number;
  devise: string;
  unite: string;
  quantiteDisponible: number;
  description?: string | null;
  produit: {
    id: string;
    nom: string;
    categorie: string;
    sousCategorie: string;
    image?: string | null;
  };
  boutique: {
    id: string;
    nom: string;
    pays: string;
    ville: string;
    quartier?: string;
    badgeCertifie: boolean;
    distanceKm?: number;
  };
}

export default function OfferCard({
  id,
  prix,
  devise,
  unite,
  quantiteDisponible,
  description,
  produit,
  boutique
}: OfferCardProps) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
      {/* Top category & unit badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
          {produit.sousCategorie || produit.categorie}
        </span>
        <span className="text-[11px] font-semibold text-slate-400">
          Par {unite}
        </span>
      </div>

      {/* Product Name */}
      <div className="mb-3">
        <Link 
          href={`/comparateur/${produit.id}`}
          className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-2"
        >
          {produit.nom}
        </Link>
        {description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            {description}
          </p>
        )}
      </div>

      {/* Price Block */}
      <div className="pt-2 border-t border-slate-800/80 mb-3 flex items-baseline justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block">Prix unitaire</span>
          <span className="text-lg font-black text-amber-400">
            {prix.toLocaleString('fr-FR')} <span className="text-xs font-semibold text-slate-300">{devise}</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Disponibilité</span>
          <span className="text-xs font-bold text-emerald-400">
            {quantiteDisponible > 0 ? `${quantiteDisponible} en stock` : 'Sur commande'}
          </span>
        </div>
      </div>

      {/* Supplier & Location */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
        <Link
          href={`/boutiques/${boutique.id}`}
          className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 truncate max-w-[65%]"
        >
          <Store className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate font-medium">{boutique.nom}</span>
          {boutique.badgeCertifie && (
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
        </Link>

        <Adresse ville={boutique.ville} distanceKm={boutique.distanceKm} taille="compact" />
      </div>

      {/* Compare button */}
      <Link
        href={`/comparateur/${produit.id}`}
        className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 text-[11px] font-bold text-slate-300 hover:text-amber-300 transition flex items-center justify-center gap-1"
      >
        <span>Comparer les prix fournisseurs</span>
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
