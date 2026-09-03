'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart2, 
  Search, 
  MapPin, 
  Tag, 
  TrendingDown, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck,
  Loader2,
  Filter
} from 'lucide-react';
import BadgeOffres from '@/components/marketplace/BadgeOffres';
import OfferCard from '@/components/marketplace/OfferCard';
import { VILLES_AFRIQUE } from '@/lib/geo';

export default function ComparateurPage() {
  const [produits, setProduits] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUTES');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const catQuery = selectedCategory !== 'TOUTES' ? `?categorie=${selectedCategory}` : '';
        const res = await fetch(`/api/produits-reference${catQuery}`);
        const data = await res.json();
        if (data.success) {
          setProduits(data.produits || []);
        }
      } catch (err) {
        console.error('Erreur catalogue comparateur:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, [selectedCategory]);

  const filteredProduits = produits.filter((p) => {
    if (!searchQuery) return true;
    return (
      p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sousCategorie.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <BarChart2 className="w-7 h-7 text-amber-400" />
          <span>Comparateur de Prix Glacerie</span>
        </h1>
        <p className="text-xs text-slate-400">
          Comparez les tarifs fournisseurs pour un même produit de référence en Afrique
        </p>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par ingrédient (ex: SE 30, Vanille, Pistache, Pots...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'TOUTES', label: 'Tous' },
            { id: 'INGREDIENT', label: '🧪 Ingrédients' },
            { id: 'EMBALLAGE', label: '📦 Emballages' },
            { id: 'EQUIPEMENT', label: '⚙️ Équipements' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Chargement des références du comparateur...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProduits.map((prod) => (
            <div
              key={prod.id}
              className="glass-card glass-card-hover rounded-3xl p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 shrink-0">
                    {prod.sousCategorie}
                  </span>

                  <BadgeOffres nombre={prod.offresCount} />
                </div>

                <h3 className="font-extrabold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {prod.nom}
                </h3>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>

                <div className="mt-3 inline-block text-[11px] text-slate-500 font-medium">
                  Unités comparables : <span className="text-slate-300">{prod.unitesAutorisees}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Meilleur tarif relevé</span>
                  <span className="text-base font-black text-emerald-400">
                    {prod.prixMin ? `${prod.prixMin.toLocaleString('fr-FR')} ${prod.devise}` : 'À négocier'}
                  </span>
                </div>

                <Link
                  href={`/comparateur/${prod.id}`}
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition flex items-center gap-1"
                >
                  <span>Comparer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
