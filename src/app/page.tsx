'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Store, 
  BarChart2, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Tag, 
  Search, 
  Filter, 
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Layers,
  Award,
  Zap,
  Phone,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import OfferCard from '@/components/marketplace/OfferCard';
import ShopCard from '@/components/marketplace/ShopCard';
import MobileMoneyModal from '@/components/payment/MobileMoneyModal';
import { VILLES_AFRIQUE } from '@/lib/geo';

export default function HomePage() {
  const [produits, setProduits] = useState<any[]>([]);
  const [boutiques, setBoutiques] = useState<any[]>([]);
  const [offres, setOffres] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUTES');
  const [selectedCity, setSelectedCity] = useState<string>('Toutes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoMoModalOpen, setIsMoMoModalOpen] = useState(false);

  useEffect(() => {
    // Tenter de géolocaliser l'utilisateur avec consentement
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          });
        },
        () => {
          // Si refusé ou indisponible, fallback standard
        }
      );
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const geoQuery = userLocation ? `&lat=${userLocation.lat}&lon=${userLocation.lon}` : '';
      const cityQuery = selectedCity !== 'Toutes' ? `&ville=${encodeURIComponent(selectedCity)}` : '';
      const catQuery = selectedCategory !== 'TOUTES' ? `&categorie=${selectedCategory}` : '';
      const qQuery = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';

      // Charger les produits de référence
      const resProd = await fetch(`/api/produits-reference?${catQuery}${qQuery}`);
      const dataProd = await resProd.json();
      if (dataProd.success) setProduits(dataProd.produits || []);

      // Charger les boutiques
      const resBoutiques = await fetch(`/api/boutiques?${cityQuery}${catQuery}${qQuery}${geoQuery}`);
      const dataBoutiques = await resBoutiques.json();
      if (dataBoutiques.success) setBoutiques(dataBoutiques.boutiques || []);

      // Charger les offres pour le comparateur
      const resOffres = await fetch(`/api/offres?${cityQuery}${catQuery}${geoQuery}`);
      const dataOffres = await resOffres.json();
      if (dataOffres.success) setOffres(dataOffres.offres || []);

    } catch (err) {
      console.error('Erreur chargement données accueil:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedCity, searchQuery, userLocation]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* HERO BANNER MOBILE-FIRST */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-5 sm:p-8 shadow-2xl">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Marketplace n°1 des Glaciers Africains</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2.5">
            Trouvez vos Ingrédients, Emballages & Équipements de Glacerie
          </h1>
          
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 max-w-2xl">
            Accédez aux fournisseurs vérifiés en Côte d’Ivoire, Sénégal, Cameroun et Bénin. Comparez les prix de référence du stabilisant Cremodan SE 30, des arômes et des machines.
          </p>

          {/* Search bar inside Hero */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher Cremodan SE 30, vanille, pots 100ml, turbine..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <button
              onClick={fetchData}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <span>Trouver un produit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick metric pills */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Fournisseurs Modérés
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              Comparateur de Prix Garanti
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-400" />
              Paiements Mobile Money
            </span>
          </div>
        </div>
      </section>

      {/* FILTER TABS & METROPOLIS SELECTOR */}
      <section className="space-y-3">
        {/* City Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCity('Toutes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
              selectedCity === 'Toutes'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            🌍 Toutes les villes
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
              <span className="text-[10px] opacity-70">({v.pays.split(' ')[0]})</span>
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'TOUTES', label: 'Tous les produits', icon: '🍨' },
            { id: 'INGREDIENT', label: 'Ingrédients & Arômes', icon: '🧪' },
            { id: 'EMBALLAGE', label: 'Pots & Emballages', icon: '📦' },
            { id: 'EQUIPEMENT', label: 'Turbines & Matériel', icon: '⚙️' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                selectedCategory === cat.id
                  ? 'border-amber-500/80 bg-amber-500/10 text-white shadow-lg shadow-amber-500/10'
                  : 'border-slate-800/80 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <div className="truncate">
                <span className="block text-xs font-bold truncate">{cat.label}</span>
                <span className="text-[10px] text-slate-500">
                  {cat.id === 'TOUTES' ? `${produits.length} références` : `${produits.filter(p => p.categorie === cat.id).length} références`}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* COMPARATEUR DE PRIX VEDETTE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Comparateur de Prix en Direct
              </h2>
              <p className="text-[11px] text-slate-400">
                Offres réelles proposées par nos fournisseurs partenaires
              </p>
            </div>
          </div>
          <Link
            href="/comparateur"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Voir tout le comparateur</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {offres.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-300">Aucune offre trouvée pour ces critères.</p>
            <p className="text-xs text-slate-500">Essayez de réinitialiser la ville ou la catégorie sélectionnée.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {offres.slice(0, 6).map((offre) => (
              <OfferCard
                key={offre.id}
                id={offre.id}
                prix={offre.prix}
                devise={offre.devise}
                unite={offre.unite}
                quantiteDisponible={offre.quantiteDisponible}
                description={offre.description}
                produit={offre.produitReference}
                boutique={offre.boutique}
              />
            ))}
          </div>
        )}
      </section>

      {/* CATALOGUE DE RÉFÉRENCE OFFICIEL */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Catalogue de Référence GLACE OS
              </h2>
              <p className="text-[11px] text-slate-400">
                Fiches techniques standardisées pour stabilisants, extraits et emballages
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {produits.map((prod) => (
            <Link
              key={prod.id}
              href={`/comparateur/${prod.id}`}
              className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 mb-2">
                  <span className="uppercase">{prod.sousCategorie}</span>
                  <span className="text-slate-400 font-mono">{prod.offresCount} offres</span>
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {prod.nom}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Meilleur prix</span>
                  <span className="text-xs font-extrabold text-emerald-400">
                    {prod.prixMin ? `${prod.prixMin.toLocaleString('fr-FR')} ${prod.devise}` : 'Sur devis'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Comparer <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BOUTIQUES FOURNISSEURS VÉRIFIÉES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Fournisseurs Locaux Recommandés
              </h2>
              <p className="text-[11px] text-slate-400">
                Boutiques physiques & distributeurs officiels vérifiés
              </p>
            </div>
          </div>
          <Link
            href="/boutiques"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Toutes les boutiques</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boutiques.map((boutique) => (
            <ShopCard
              key={boutique.id}
              id={boutique.id}
              nom={boutique.nom}
              description={boutique.description}
              pays={boutique.pays}
              ville={boutique.ville}
              quartier={boutique.quartier}
              badgeCertifie={boutique.badgeCertifie}
              noteMoyenne={boutique.noteMoyenne}
              offresCount={boutique.offresCount}
              distanceKm={boutique.distanceKm}
            />
          ))}
        </div>
      </section>

      {/* MOBILE MONEY CTA BANNER */}
      <section className="rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-emerald-500/20 border border-amber-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-lg">⭐</span>
            <h3 className="text-base font-extrabold text-white">
              Débloquez l'accès direct WhatsApp & Téléphone aux Fournisseurs
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Abonnement membre à 2 000 FCFA/mois payable instantanément par Orange Money, MTN MoMo ou Wave. Contactez les fournisseurs directement et commandez vos matières premières sans intermédiaire.
          </p>
        </div>

        <button
          onClick={() => setIsMoMoModalOpen(true)}
          className="w-full sm:w-auto shrink-0 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:scale-105 transition flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>S'abonner via Mobile Money</span>
        </button>
      </section>

      {/* Modal Mobile Money */}
      <MobileMoneyModal
        isOpen={isMoMoModalOpen}
        onClose={() => setIsMoMoModalOpen(false)}
        onSuccess={() => {
          setIsMoMoModalOpen(false);
          fetchData();
        }}
        type="ABONNEMENT_MEMBRE"
        targetId="current-user"
        titre="Abonnement Membre Glacier PRO"
        description="Accès illimité aux fiches fournisseurs, coordonnées WhatsApp directes et négociation de prix pour 30 jours."
        montant={2000}
        devise="FCFA"
      />

    </div>
  );
}
