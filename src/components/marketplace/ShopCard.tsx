'use client';

import React from 'react';
import Link from 'next/link';
import { Store, MapPin, Star, ShieldCheck, ChevronRight, Phone, MessageCircle } from 'lucide-react';
import BadgeOffres from './BadgeOffres';
import Adresse from './Adresse';
import BadgeVerification from './BadgeVerification';

interface ShopCardProps {
  id: string;
  nom: string;
  description: string;
  pays: string;
  ville: string;
  quartier?: string;
  badgeCertifie: boolean;
  noteMoyenne: number;
  offresCount?: number;
  avisCount?: number;
  distanceKm?: number;
  isUnlocked?: boolean;
}

export default function ShopCard({
  id,
  nom,
  description,
  pays,
  ville,
  quartier,
  badgeCertifie,
  noteMoyenne,
  offresCount = 0,
  avisCount = 0,
  distanceKm,
  isUnlocked = false
}: ShopCardProps) {
  return (
    <Link
      href={`/boutiques/${id}`}
      className="glass-card glass-card-hover rounded-3xl p-5 block relative overflow-hidden group"
    >
      {/* Top row: Badge and Location */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* min-w-0 est indispensable : sans lui un enfant flex refuse de descendre
            sous la largeur de son contenu, le `truncate` de l'adresse ne s'applique
            jamais et la pastille pousse le badge certifié hors de la carte.
            Seules la ville et la distance sont montrées ici — quartier et pays
            allongeaient la pastille sans aider à choisir dans une liste. */}
        <span className="min-w-0 shrink">
          <Adresse ville={ville} distanceKm={distanceKm} taille="compact" />
        </span>

        <BadgeVerification certifie={badgeCertifie} taille="compact" />

      </div>

      {/* Shop Name & Description */}
      <div className="mb-4">
        <h3 className="font-extrabold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
          {nom}
        </h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Metrics: Note, Offres, Distance */}
      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-center mb-3">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Note</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-black text-slate-200">
              {noteMoyenne > 0 ? noteMoyenne.toFixed(1) : 'Nouveau'}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Produits</span>
          <span className="block mt-0.5">
            <BadgeOffres nombre={offresCount} taille="compact" />
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Proximité</span>
          <span className="text-xs font-black text-amber-300 block mt-0.5">
            {distanceKm !== undefined ? `${distanceKm} km` : 'Local'}
          </span>
        </div>
      </div>

      {/* Bottom info link */}
      <div className="flex items-center justify-between text-xs text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
        <span>Voir les produits & coordonnées</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
