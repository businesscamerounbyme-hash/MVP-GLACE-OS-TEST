'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { nomComplet, initiales } from '@/lib/nom';
import { 
  User, 
  Crown, 
  Store, 
  ShieldCheck, 
  LogOut, 
  ArrowRight,
  Loader2,
  Sparkles,
  Settings,
  ChevronRight
} from 'lucide-react';
import { UserSession } from '@/types';

export default function EspaceHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Chargement de votre espace...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6 pb-16">
      
      {/* Profile Card */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 text-center space-y-3 relative overflow-hidden">
        {user.photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={user.photoUrl}
            alt="Photo de profil"
            className="w-16 h-16 rounded-2xl object-cover mx-auto shadow-xl border border-slate-700"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center font-black text-xl text-white mx-auto shadow-xl">
            {initiales(user)}
          </div>
        )}

        <div>
          <h1 className="text-xl font-black text-white">{nomComplet(user)}</h1>
          <p className="text-xs text-slate-400">{user.email} • {user.telephone}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {user.role === 'ADMIN' ? '👑 Super Administrateur' : user.role === 'MODERATOR' ? '🛡️ Modérateur' : user.role === 'SUPPLIER' ? '🏪 Fournisseur' : '🍦 Artisan Glacier'}
            </span>
            {user.hasActiveMembership && (
              <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Abonnement Actif ⭐
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation shortcuts based on role */}
      <div className="space-y-3">
        {user.role === "MEMBER" && (
          <Link
            href="/devenir-fournisseur"
            className="glass-card glass-card-hover rounded-2xl p-4 border border-emerald-500/40 bg-emerald-500/5 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-300">
                  Devenir fournisseur
                </h3>
                <p className="text-[11px] text-slate-400">
                  Publiez votre boutique et vendez aux glaciers
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </Link>
        )}

        <Link
          href="/profil"
          className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-700 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white group-hover:text-amber-300">
                Modifier mon profil
              </h3>
              <p className="text-[11px] text-slate-400">
                Nom, coordonnées, photo et mot de passe
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300" />
        </Link>

        {user.role === 'ADMIN' || user.role === 'MODERATOR' ? (
          <Link
            href="/admin"
            className="glass-card glass-card-hover rounded-2xl p-4 border border-amber-500/30 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-amber-300">
                  Centre de Modération & Administration
                </h3>
                <p className="text-xs text-slate-400">
                  Valider les boutiques, avis et nouveaux produits
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : null}

        {user.role === 'SUPPLIER' ? (
          <Link
            href="/fournisseur"
            className="glass-card glass-card-hover rounded-2xl p-4 border border-emerald-500/30 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-300">
                  Gérer ma Boutique & mes Offres
                </h3>
                <p className="text-xs text-slate-400">
                  Ajouter des offres au comparateur et gérer les abonnements
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : null}

        <Link
          href="/membre"
          className="glass-card glass-card-hover rounded-2xl p-4 border border-slate-800 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white group-hover:text-amber-300">
                Mon Abonnement & Avantages Membre
              </h3>
              <p className="text-xs text-slate-400">
                Pass contact direct WhatsApp & Téléphone
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Se déconnecter de GLACE OS</span>
      </button>

    </div>
  );
}
