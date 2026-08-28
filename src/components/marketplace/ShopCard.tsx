'use client';

import React from 'react';
import Link from 'next/link';
import { Store, MapPin, Star, ShieldCheck, ChevronRight, Phone, MessageCircle } from 'lucide-react';

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
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{ville}, {pays}</span>
          {quartier && <span className="text-slate-500">• {quartier}</span>}
        </div>

        {badgeCertifie ? (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold tracking-wide uppercase gold-glow">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Fournisseur Certifié</span>
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full">
            Vérifié
          </span>
        )}
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
          <span className="text-xs font-black text-emerald-400 block mt-0.5">
            {offresCount} offres
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
