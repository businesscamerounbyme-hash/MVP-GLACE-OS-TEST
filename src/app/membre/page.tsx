'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Crown, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Phone, 
  MessageCircle, 
  Store, 
  Search, 
  Loader2 
} from 'lucide-react';
import MobileMoneyModal from '@/components/payment/MobileMoneyModal';
import { UserSession } from '@/types';

export default function MembreDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoMoModalOpen, setIsMoMoModalOpen] = useState(false);

  const fetchSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.user) {
        router.push('/login');
        return;
      }
      setUser(data.user);
    } catch (err) {
      console.error('Erreur session membre:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Chargement de votre profil membre...</p>
      </div>
    );
  }

  const isActive = user?.hasActiveMembership;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold mb-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Espace Membre Artisan Glacier</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Mon Compte & Abonnement GLACE OS
        </h1>
        <p className="text-xs text-slate-400">
          Gérez votre pass d'accès aux fournisseurs d'ingrédients et machines de glacerie
        </p>
      </div>

      {/* Subscription Status Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Statut de votre abonnement
            </span>

            {isActive ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pass PRO Actif ⭐</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                <XCircle className="w-4 h-4 text-slate-500" />
                <span>Compte Gratuit (Accès Restreint)</span>
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isActive ? 'Accès Illimité aux Fournisseurs Débloqué' : 'Passez à l’abonnement Membre GLACE OS'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              {isActive
                ? 'Vous pouvez consulter les numéros de téléphone directs, envoyer des messages WhatsApp pré-remplis aux fournisseurs et négocier vos commandes sans intermédiaire.'
                : 'Pour seulement 2 000 FCFA/mois, contactez directement tous les fournisseurs d’ingrédients (Cremodan, arômes...) et d’équipements en Afrique.'}
            </p>
          </div>

          {/* Perks list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isActive ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Bouton WhatsApp direct sur chaque fournisseur</span>
            </div>

            <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isActive ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <Phone className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Numéros de téléphone & adresses complètes</span>
            </div>

            <div className="p-3.5 rounded-2xl border bg-slate-900 border-slate-800 text-slate-300 flex items-center gap-3">
              <Search className="w-5 h-5 text-sky-400 shrink-0" />
              <span>Recherche & Comparateur de prix illimité</span>
            </div>

            <div className="p-3.5 rounded-2xl border bg-slate-900 border-slate-800 text-slate-300 flex items-center gap-3">
              <Zap className="w-5 h-5 text-orange-400 shrink-0" />
              <span>Renouvellement instantané Mobile Money</span>
            </div>
          </div>

          {/* CTA Action */}
          <div className="pt-3">
            <button
              onClick={() => setIsMoMoModalOpen(true)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isActive ? 'Prolonger mon abonnement (2 000 FCFA)' : 'Activer mon abonnement via Mobile Money (2 000 FCFA)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Mes Coordonnées
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Nom complet</span>
            <span className="font-bold text-white">{user?.nom}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Email</span>
            <span className="font-bold text-white">{user?.email}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Téléphone</span>
            <span className="font-bold text-white">{user?.telephone}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Localisation</span>
            <span className="font-bold text-white">{user?.ville}, {user?.pays}</span>
          </div>
        </div>
      </div>

      {/* Modal Mobile Money */}
      <MobileMoneyModal
        isOpen={isMoMoModalOpen}
        onClose={() => setIsMoMoModalOpen(false)}
        onSuccess={() => {
          setIsMoMoModalOpen(false);
          fetchSession();
        }}
        type="ABONNEMENT_MEMBRE"
        targetId={user?.id || 'guest'}
        titre="Abonnement Membre Glacier GLACE OS"
        description="Activez instantanément votre accès illimité aux contacts directs WhatsApp et téléphones de tous les fournisseurs."
        montant={2000}
        devise="FCFA"
      />

    </div>
  );
}
