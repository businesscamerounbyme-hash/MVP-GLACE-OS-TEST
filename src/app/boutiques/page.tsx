'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Store, 
  MapPin, 
  Search, 
  ShieldCheck, 
  SlidersHorizontal, 
  Compass, 
  Star, 
  Loader2,
  ChevronRight,
  Filter
} from 'lucide-react';
import ShopCard from '@/components/marketplace/ShopCard';
import { VILLES_AFRIQUE } from '@/lib/geo';

export default function BoutiquesPage() {
  return (
    <Suspense fallback={null}>
      <ListeBoutiques />
    </Suspense>
  );
}

function ListeBoutiques() {
  const searchParams = useSearchParams();
  // Une adresse cliquee ailleurs sur le site arrive ici sous forme de ?ville=...
  // La valeur initialise le filtre, qui reste modifiable ensuite.
  const villeInitiale = searchParams.get('ville') || 'Toutes';

  const [boutiques, setBoutiques] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>(villeInitiale);
  const [selectedCountry, setSelectedCountry] = useState<string>('Tous');
  const [onlyCertified, setOnlyCertified] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBoutiques = async () => {
    setIsLoading(true);
    try {
      const cityQuery = selectedCity !== 'Toutes' ? `&ville=${encodeURIComponent(selectedCity)}` : '';
      const countryQuery = selectedCountry !== 'Tous' ? `&pays=${encodeURIComponent(selectedCountry)}` : '';
      const qQuery = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
      const geoQuery = userLocation ? `&lat=${userLocation.lat}&lon=${userLocation.lon}` : '';

      const res = await fetch(`/api/boutiques?${cityQuery}${countryQuery}${qQuery}${geoQuery}`);
      const data = await res.json();
      if (data.success) {
        let list = data.boutiques || [];
        if (onlyCertified) {
          list = list.filter((b: any) => b.badgeCertifie);
        }
        setBoutiques(list);
      }
    } catch (err) {
      console.error('Erreur chargement boutiques:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoutiques();
  }, [selectedCity, selectedCountry, onlyCertified, searchQuery, userLocation]);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n’est pas supportée par votre navigateur.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert('Impossible de récupérer votre position GPS. Veuillez sélectionner votre ville manuellement.');
      }
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Store className="w-7 h-7 text-amber-400" />
            <span>Fournisseurs de Glacerie</span>
          </h1>
          <p className="text-xs text-slate-400">
            Trouvez les boutiques locales vérifiées pour vos approvisionnements en Afrique
          </p>
        </div>

        {/* GPS Button */}
        <button
          onClick={handleGeolocation}
          disabled={isLocating}
          className={`py-2 px-4 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
            userLocation
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-400'
          }`}
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ) : (
            <Compass className="w-4 h-4 text-amber-400" />
          )}
          <span>{userLocation ? '📍 Trié par distance GPS' : 'Localiser autour de moi'}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par nom de boutique ou quartier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          {/* City */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Toutes">🌍 Toutes les villes</option>
              {/* Les villes sont saisies librement par les fournisseurs : celle qui
                  arrive par l'URL peut ne pas figurer dans la liste de référence. Sans
                  cette entrée, le filtre s'appliquerait sans que rien n'apparaisse
                  sélectionné. */}
              {selectedCity !== 'Toutes' &&
                !VILLES_AFRIQUE.some((v) => v.nom === selectedCity) && (
                  <option value={selectedCity}>{selectedCity}</option>
                )}
              {VILLES_AFRIQUE.map((v) => (
                <option key={v.nom} value={v.nom}>
                  {v.nom} ({v.pays})
                </option>
              ))}
            </select>
          </div>

          {/* Certified toggle */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 select-none">
              <input
                type="checkbox"
                checked={onlyCertified}
                onChange={(e) => setOnlyCertified(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-800"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Uniquement Fournisseurs Certifiés
              </span>
            </label>
          </div>

        </div>
      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Chargement des fournisseurs locaux...</p>
        </div>
      ) : boutiques.length === 0 ? (
        <div className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <Store className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Aucun fournisseur trouvé</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Aucune boutique ne correspond à vos filtres actuels. Essayez de réinitialiser la ville ou le mot-clé.
          </p>
        </div>
      ) : (
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
      )}

    </div>
  );
}
