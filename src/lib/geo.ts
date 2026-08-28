/**
 * Calcule la distance en kilomètres entre deux points géographiques (Formule de Haversine)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  
  const R = 6371; // Rayon moyen de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Arrondi à 1 décimale (ex: 2.4 km)
}

export interface AfricanCity {
  nom: string;
  pays: string;
  latitude: number;
  longitude: number;
  quartiers: string[];
}

export const VILLES_AFRIQUE: AfricanCity[] = [
  {
    nom: 'Abidjan',
    pays: "Côte d'Ivoire",
    latitude: 5.359952,
    longitude: -4.008256,
    quartiers: ['Cocody', 'Plateau', 'Treichville', 'Yopougon', 'Marcory', 'Riviera', 'Koumassi', 'Adjamé']
  },
  {
    nom: 'Dakar',
    pays: 'Sénégal',
    latitude: 14.716677,
    longitude: -17.467686,
    quartiers: ['Almadies', 'Plateau', 'Ouakam', 'Fann Résidence', 'Mermoz', 'Point E', 'Yoff', 'Médina']
  },
  {
    nom: 'Douala',
    pays: 'Cameroun',
    latitude: 4.051056,
    longitude: 9.767869,
    quartiers: ['Akwa', 'Bonanjo', 'Bonapriso', 'Makèpè', 'Bali', 'Deïdo', 'Bassa']
  },
  {
    nom: 'Cotonou',
    pays: 'Bénin',
    latitude: 6.365360,
    longitude: 2.418330,
    quartiers: ['Haie Vive', 'Ganhi', 'Cadjehoun', 'Gbegamey', 'Akpakpa', 'Agla', 'Zogbo']
  },
  {
    nom: 'Lomé',
    pays: 'Togo',
    latitude: 6.137480,
    longitude: 1.212270,
    quartiers: ['Centre-Ville', 'Tokoin', 'Bè', 'Baguida', 'Adidogomé', 'Hedzranawoé']
  },
  {
    nom: 'Ouagadougou',
    pays: 'Burkina Faso',
    latitude: 12.371428,
    longitude: -1.519660,
    quartiers: ['Ouaga 2000', 'Gounghin', 'Paspanga', 'Kalgondin', 'Tanghin']
  },
  {
    nom: 'Yaoundé',
    pays: 'Cameroun',
    latitude: 3.848033,
    longitude: 11.502075,
    quartiers: ['Bastos', 'Centre-ville', 'Omnisports', 'Mimboman', 'Essos', 'Biyem-Assi']
  },
  {
    nom: 'Bamako',
    pays: 'Mali',
    latitude: 12.639232,
    longitude: -8.002889,
    quartiers: ['Badalabougou', 'ACI 2000', 'Hamdallaye', 'Torokorobougou', 'Hippodrome']
  },
  {
    nom: 'Conakry',
    pays: 'Guinée',
    latitude: 9.641185,
    longitude: -13.578401,
    quartiers: ['Kaloum', 'Dixinn', 'Ratoma', 'Matam', 'Matoto', 'Kipé']
  }
];
