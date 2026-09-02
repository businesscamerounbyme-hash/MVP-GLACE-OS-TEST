'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Lock, Mail, ArrowRight, Loader2, ShieldCheck, Store, User, Zap } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <FormulaireConnexion />
    </Suspense>
  );
}

function FormulaireConnexion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, motDePasse })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Identifiants incorrects.');
        setIsLoading(false);
        return;
      }

      // Le middleware transmet la page demandee dans `suite`. Sans cela, un
      // utilisateur renvoye vers la connexion depuis /profil atterrissait sur
      // l'accueil et devait renaviguer a la main.
      // Seuls les chemins internes sont acceptes : une URL absolue permettrait
      // de rediriger la victime vers un site tiers apres une connexion reussie.
      const suite = searchParams.get('suite');
      const destination = suite && suite.startsWith('/') && !suite.startsWith('//') ? suite : '/';
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setError('Erreur de connexion au serveur.');
      setIsLoading(false);
    }
  };

  const quickLogin = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setMotDePasse(testPass);
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          <span className="text-2xl">🍦</span>
        </div>
        <h1 className="text-2xl font-black text-white">Connexion GLACE OS</h1>
        <p className="text-xs text-slate-400">
          Accédez à la marketplace B2B des glaciers et fournisseurs d'Afrique
        </p>
      </div>

      {/* Quick Demo Logins Box */}
      <div className="glass-card rounded-2xl p-4 border border-amber-500/20 space-y-2.5">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400 block">
          ⚡ Comptes de Démonstration (1 Clic)
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => quickLogin('admin@glace-os.com', 'admin123')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 text-left transition"
          >
            <span className="font-bold text-amber-300 block">👑 Super Admin</span>
            <span className="text-[10px] text-slate-400">Accès total & rôles</span>
          </button>

          <button
            type="button"
            onClick={() => quickLogin('moderateur@glace-os.com', 'modo123')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 text-left transition"
          >
            <span className="font-bold text-emerald-300 block">🛡️ Modérateur</span>
            <span className="text-[10px] text-slate-400">Validation & avis</span>
          </button>

          <button
            type="button"
            onClick={() => quickLogin('fournisseur.abidjan@cremodan-africa.com', 'fournisseur123')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 text-left transition"
          >
            <span className="font-bold text-sky-300 block">🏪 Fournisseur</span>
            <span className="text-[10px] text-slate-400">Abidjan (Certifié)</span>
          </button>

          <button
            type="button"
            onClick={() => quickLogin('membre.actif@glacier-dakar.com', 'membre123')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 text-left transition"
          >
            <span className="font-bold text-amber-400 block">⭐ Membre Abonné</span>
            <span className="text-[10px] text-slate-400">Contact débloqué</span>
          </button>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">Adresse Email</label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">Mot de passe</label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="••••••••"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connexion en cours...</span>
            </>
          ) : (
            <>
              <span>Se connecter</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-bold text-amber-400 hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </form>

    </div>
  );
}
