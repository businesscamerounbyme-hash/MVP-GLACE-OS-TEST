'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart2, 
  MapPin, 
  ShieldCheck, 
  ArrowLeft, 
  Store, 
  Tag, 
  TrendingDown, 
  CheckCircle2, 
  Loader2,
  ExternalLink,
  Phone,
  Layers
} from 'lucide-react';
import { VILLES_AFRIQUE } from '@/lib/geo';

export default function ProductComparatorDetailPage() {
  const params = useParams();
  const produitId = params?.produitId as string;

  const [produit, setProduit] = useState<any>(null);
  const [offres, setOffres] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('Toutes');
  const [selectedCountry, setSelectedCountry] = useState<string>('Tous');
  const [isLoading, setIsLoading] = useState(true);

  const fetchComparatorData = async () => {
    setIsLoading(true);
    try {
      // 1. Récupérer les infos du produit de référence
      const resProd = await fetch('/api/produits-reference');
      const dataProd = await resProd.json();
      if (dataProd.success) {
        const found = dataProd.produits.find((p: any) => p.id === produitId);
        setProduit(found || null);
      }

      // 2. Récupérer les offres triées par prix
      const cityQuery = selectedCity !== 'Toutes' ? `&ville=${encodeURIComponent(selectedCity)}` : '';
      const countryQuery = selectedCountry !== 'Tous' ? `&pays=${encodeURIComponent(selectedCountry)}` : '';
      const resOffres = await fetch(`/api/offres?produitId=${produitId}${cityQuery}${countryQuery}`);
      const dataOffres = await resOffres.json();
      if (dataOffres.success) {
        setOffres(dataOffres.offres || []);
      }
    } catch (err) {
      console.error('Erreur chargement comparateur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (produitId) {
      fetchComparatorData();
    }
  }, [produitId, selectedCity, selectedCountry]);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Calcul du comparatif des prix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Back button */}
      <Link
        href="/comparateur"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au comparateur</span>
      </Link>

      {/* Product Reference Card */}
      {produit && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {produit.categorie} • {produit.sousCategorie}
            </span>
            <span className="text-xs text-slate-400">
              Unités autorisées : <strong className="text-white">{produit.unitesAutorisees}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {produit.nom}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {produit.description}
          </p>
        </div>
      )}

      {/* Filter by City / Country */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCity('Toutes')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
            selectedCity === 'Toutes'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          🌍 Tous les pays & villes ({offres.length} offres)
        </button>

        {VILLES_AFRIQUE.map((v) => (
          <button
            key={v.nom}
            onClick={() => setSelectedCity(v.nom)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              selectedCity === v.nom
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>{v.nom}</span>
          </button>
        ))}
      </div>

      {/* COMPARISON OFFERS LIST (Ranked from cheapest to most expensive) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-black text-white">
              Classement des offres par prix croissant ({offres.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Toutes devises locales</span>
        </div>

        {offres.length === 0 ? (
          <div className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <p className="text-sm font-bold text-slate-200">Aucune offre disponible pour cette référence dans cette ville.</p>
            <p className="text-xs text-slate-500">Les fournisseurs peuvent soumettre leurs prix depuis leur espace.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {offres.map((offre, index) => (
              <div
                key={offre.id}
                className={`glass-card rounded-2xl p-5 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  index === 0
                    ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                
                {/* Left: Rank badge & Supplier info */}
                <div className="flex items-start gap-4">
                  {/* Rank number */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    index === 0
                      ? 'bg-emerald-500 text-slate-950'
                      : index === 1
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    #{index + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/boutiques/${offre.boutique.id}`}
                        className="font-extrabold text-sm text-white hover:text-amber-400 transition"
                      >
                        {offre.boutique.nom}
                      </Link>
                      {offre.boutique.badgeCertifie && (
                        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{offre.boutique.quartier ? `${offre.boutique.quartier}, ` : ''}{offre.boutique.ville} ({offre.boutique.pays})</span>
                      {offre.boutique.distanceKm !== undefined && (
                        <span className="text-amber-400 font-bold">• {offre.boutique.distanceKm} km</span>
                      )}
                    </div>

                    {offre.description && (
                      <p className="text-xs text-slate-400 pt-0.5">
                        {offre.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Unit & Price & CTA */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Format / Unité</span>
                    <span className="text-xs font-semibold text-slate-300">{offre.unite}</span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Prix proposé</span>
                    <span className="text-xl font-black text-amber-400">
                      {offre.prix.toLocaleString('fr-FR')} <span className="text-xs font-semibold text-slate-300">{offre.devise}</span>
                    </span>
                  </div>

                  <Link
                    href={`/boutiques/${offre.boutique.id}`}
                    className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white hover:text-amber-400 transition flex items-center gap-1.5 shrink-0"
                  >
                    <span>Fiche & Contact</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
