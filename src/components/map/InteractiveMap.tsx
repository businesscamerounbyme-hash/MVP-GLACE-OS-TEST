'use client';

import React, { useEffect, useRef } from 'react';

interface ShopLocation {
  id: string;
  nom: string;
  ville: string;
  pays: string;
  quartier?: string;
  latitude: number;
  longitude: number;
  badgeCertifie: boolean;
  noteMoyenne: number;
  distanceKm?: number;
  offresCount?: number;
}

interface InteractiveMapProps {
  boutiques: ShopLocation[];
  center: [number, number];
  zoom: number;
  userLocation: { lat: number; lon: number } | null;
}

export default function InteractiveMap({
  boutiques,
  center,
  zoom,
  userLocation
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const loadLeaflet = async () => {
      const L = (await import('leaflet')).default;

      if (!mapRef.current) return;

      // Nettoyer si déjà initialisé
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Initialiser la carte
      const map = L.map(mapRef.current).setView(center, zoom);
      mapInstanceRef.current = map;

      // Fond de carte OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Icône utilisateur
      if (userLocation) {
        const userIcon = L.divIcon({
          className: 'custom-user-pin',
          html: `<div style="background-color: #3b82f6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px #3b82f6;"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });

        L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
          .addTo(map)
          .bindPopup('<b>📍 Votre position actuelle</b>');
      }

      // Marqueurs boutiques
      boutiques.forEach((b) => {
        if (!b.latitude || !b.longitude) return;

        const isCertified = b.badgeCertifie;
        const pinHtml = `
          <div style="
            background: ${isCertified ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#1e293b'};
            color: white;
            padding: 6px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid ${isCertified ? '#fde68a' : '#475569'};
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            white-space: nowrap;
          ">
            <span>${isCertified ? '⭐' : '🏪'}</span>
            <span>${b.nom}</span>
          </div>
        `;

        const shopIcon = L.divIcon({
          className: 'custom-shop-pin',
          html: pinHtml,
          iconSize: [120, 30],
          iconAnchor: [60, 15]
        });

        const popupContent = `
          <div style="font-family: inherit; padding: 4px;">
            <div style="font-size: 13px; font-weight: bold; color: #f8fafc; margin-bottom: 2px;">
              ${b.nom} ${isCertified ? '⭐' : ''}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
              📍 ${b.quartier ? b.quartier + ', ' : ''}${b.ville} (${b.pays})
            </div>
            <div style="font-size: 11px; color: #38bdf8; font-weight: bold; margin-bottom: 8px;">
              🍦 ${b.offresCount || 0} offres de glacerie disponibles
            </div>
            <a href="/boutiques/${b.id}" style="
              display: block;
              background: #f59e0b;
              color: #0f172a;
              padding: 6px 12px;
              border-radius: 8px;
              text-align: center;
              font-size: 11px;
              font-weight: 800;
              text-decoration: none;
            ">
              Consulter la fiche boutique →
            </a>
          </div>
        `;

        L.marker([b.latitude, b.longitude], { icon: shopIcon })
          .addTo(map)
          .bindPopup(popupContent);
      });
    };

    loadLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [boutiques, center, zoom, userLocation]);

  return (
    <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <div ref={mapRef} className="w-full h-full min-h-[500px]" />
    </div>
  );
}
