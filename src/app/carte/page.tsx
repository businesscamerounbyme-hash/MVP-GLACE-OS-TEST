'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Compass, 
  Store, 
  Loader2, 
  ShieldCheck, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { VILLES_AFRIQUE } from '@/lib/geo';

// Import dynamique sans SSR pour Leaflet
const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center">
      <div className="text-center space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
        <p className="text-xs text-slate-400">Chargement de la carte interactive OpenStreetMap...</p>
      </div>
    </div>
  )
});

export default function CartePage() {
  const [boutiques, setBoutiques] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('Abidjan');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([5.359952, -4.008256]); // Abidjan par défaut
  const [zoom, setZoom] = useState<number>(12);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // Charger les boutiques
    fetch('/api/boutiques')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBoutiques(data.boutiques || []);
        }
      })
      .catch((err) => console.error('Erreur chargement carte:', err));
  }, []);

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const city = VILLES_AFRIQUE.find(v => v.nom === cityName);
    if (city) {
      setMapCenter([city.latitude, city.longitude]);
      setZoom(12);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n’est pas disponible.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };
        setUserLocation(coords);
        setMapCenter([coords.lat, coords.lon]);
        setZoom(13);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert('Position GPS indisponible. Veuillez choisir une métropole.');
      }
    );
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <MapPin className="w-7 h-7 text-amber-400" />
            <span>Carte des Fournisseurs</span>
          </h1>
          <p className="text-xs text-slate-400">
            Localisez les distributeurs de stabilisants, arômes et machines les plus proches
          </p>
        </div>

        {/* GPS Button */}
        <button
          onClick={handleGeolocation}
          disabled={isLocating}
          className="py-2 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-xs font-bold text-slate-200 hover:text-white transition flex items-center gap-2"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ) : (
            <Compass className="w-4 h-4 text-amber-400" />
          )}
          <span>Ma position actuelle</span>
        </button>
      </div>

      {/* City Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {VILLES_AFRIQUE.map((v) => (
          <button
            key={v.nom}
            onClick={() => handleCityChange(v.nom)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 ${
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

      {/* Interactive Map Canvas */}
      <div className="h-[600px] w-full">
        <InteractiveMap
          boutiques={boutiques}
          center={mapCenter}
          zoom={zoom}
          userLocation={userLocation}
        />
      </div>

      {/* Bottom helper info */}
      <div className="flex items-center justify-between text-xs text-slate-400 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <span>📍 {boutiques.length} boutiques géolocalisées en Afrique de l'Ouest & Centrale</span>
        <span className="text-amber-400 font-bold">Cliquez sur un marqueur pour voir la fiche</span>
      </div>

    </div>
  );
}
