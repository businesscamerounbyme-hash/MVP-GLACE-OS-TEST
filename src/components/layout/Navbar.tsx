'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  MapPin, 
  Search, 
  User, 
  ShieldCheck, 
  LogOut, 
  Store, 
  Crown, 
  CheckCircle2, 
  Clock, 
  ChevronDown,
  Menu,
  Settings,
  X
} from 'lucide-react';
import { VILLES_AFRIQUE } from '@/lib/geo';
import { UserSession } from '@/types';
import { nomComplet, initiales } from '@/lib/nom';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const menuUtilisateur = useRef<HTMLDivElement>(null);
  const menuVille = useRef<HTMLDivElement>(null);

  // Fermeture des menus au clic extérieur et à la touche Échap : sans cela un menu
  // ouvert reste affiché par-dessus la page jusqu'à ce qu'on reclique exactement
  // sur le bouton qui l'a ouvert.
  useEffect(() => {
    if (!isDropdownOpen && !isCityDropdownOpen) return;

    const auClic = (e: MouseEvent) => {
      const cible = e.target as Node;
      if (isDropdownOpen && menuUtilisateur.current && !menuUtilisateur.current.contains(cible)) {
        setIsDropdownOpen(false);
      }
      if (isCityDropdownOpen && menuVille.current && !menuVille.current.contains(cible)) {
        setIsCityDropdownOpen(false);
      }
    };

    const auClavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsCityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', auClic);
    document.addEventListener('keydown', auClavier);
    return () => {
      document.removeEventListener('mousedown', auClic);
      document.removeEventListener('keydown', auClavier);
    };
  }, [isDropdownOpen, isCityDropdownOpen]);

  useEffect(() => {
    // Charger la session utilisateur
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setIsDropdownOpen(false);
    router.push('/');
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}${selectedCity !== 'Toutes' ? `&ville=${encodeURIComponent(selectedCity)}` : ''}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🍦</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-emerald-400 bg-clip-text text-transparent">
                  GLACE OS
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  MVP
                </span>
              </div>
              <span className="text-[11px] text-slate-400 -mt-0.5 hidden sm:inline">
                Fournisseurs Glaciers Afrique
              </span>
            </div>
          </Link>

          {/* Search bar & City Selector (Desktop / Tablet) */}
          <div className="hidden md:flex flex-1 max-w-xl items-center gap-2">
            {/* Ville Dropdown */}
            <div className="relative" ref={menuVille}>
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white hover:border-amber-500/50 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[90px]">{selectedCity}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute left-0 mt-1 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedCity('Toutes');
                      setIsCityDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-amber-400"
                  >
                    🌍 Toutes les villes
                  </button>
                  {VILLES_AFRIQUE.map((v) => (
                    <button
                      key={v.nom}
                      onClick={() => {
                        setSelectedCity(v.nom);
                        setIsCityDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-amber-400 flex items-center justify-between"
                    >
                      <span>{v.nom}</span>
                      <span className="text-[10px] text-slate-500">{v.pays}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Search */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher stabilisant SE 30, arôme vanille, pots kraft..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </form>
          </div>

          {/* User Nav / Auth Controls */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative" ref={menuUtilisateur}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                >
                  {user.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={user.photoUrl}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center font-bold text-xs text-white uppercase">
                      {initiales(user)}
                    </div>
                  )}
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                      {nomComplet(user)}
                    </span>
                    <span className="text-[10px] text-amber-400 font-medium">
                      {user.role === 'ADMIN' ? '👑 Admin' : user.role === 'MODERATOR' ? '🛡️ Modérateur' : user.role === 'SUPPLIER' ? '🏪 Fournisseur' : user.hasActiveMembership ? '⭐ Membre PRO' : 'Glacier Gratuit'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-2 z-50 divide-y divide-slate-800">
                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-white">{nomComplet(user)}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {user.role}
                        </span>
                        {user.hasActiveMembership && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Abonnement Actif ⭐
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profil"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Mon profil
                      </Link>

                      <Link
                        href="/espace"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl transition"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Mon espace
                      </Link>

                      {user.role === 'ADMIN' || user.role === 'MODERATOR' ? (
                        <Link
                          href="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/10 rounded-xl transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                          Dashboard Modération & Admin
                        </Link>
                      ) : null}

                      {user.role === 'MEMBER' ? (
                        <Link
                          href="/devenir-fournisseur"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition"
                        >
                          <Store className="w-4 h-4 text-emerald-400" />
                          Devenir fournisseur
                        </Link>
                      ) : null}

                      {user.role === 'SUPPLIER' ? (
                        <Link
                          href="/fournisseur"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition"
                        >
                          <Store className="w-4 h-4 text-emerald-400" />
                          Espace Fournisseur (Mes Offres)
                        </Link>
                      ) : null}

                      <Link
                        href="/membre"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl transition"
                      >
                        <Crown className="w-4 h-4 text-amber-400" />
                        Mon Abonnement Mobile Money
                      </Link>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-700 transition"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
