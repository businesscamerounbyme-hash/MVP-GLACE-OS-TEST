'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReinitialiserPage() {
  return (
    <Suspense fallback={null}>
      <FormulaireReinitialisation />
    </Suspense>
  );
}

function FormulaireReinitialisation() {
  const searchParams = useSearchParams();
  const jeton = searchParams.get('jeton') || '';

  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [reussi, setReussi] = useState(false);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);

    if (motDePasse !== confirmation) {
      setErreur('La confirmation ne correspond pas.');
      return;
    }

    setEnCours(true);
    try {
      const res = await fetch('/api/auth/reinitialiser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jeton, nouveauMotDePasse: motDePasse }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErreur(data.message || 'Erreur lors de la réinitialisation.');
      } else {
        setReussi(true);
      }
    } catch {
      setErreur('Impossible de joindre le serveur.');
    }
    setEnCours(false);
  };

  if (!jeton) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h1 className="text-xl font-black text-white">Lien incomplet</h1>
        <p className="text-xs text-slate-400">
          Ce lien de réinitialisation est incomplet. Utilisez celui reçu par email, ou
          demandez-en un nouveau.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="inline-block text-xs font-bold text-amber-400 hover:text-amber-300"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (reussi) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h1 className="text-xl font-black text-white">Mot de passe réinitialisé</h1>
        <p className="text-xs text-slate-400">
          Vous pouvez maintenant vous connecter avec votre nouveau mot de passe. Les
          sessions ouvertes ailleurs ont été déconnectées.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs"
        >
          Se connecter <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          <span className="text-2xl">🔑</span>
        </div>
        <h1 className="text-2xl font-black text-white">Nouveau mot de passe</h1>
        <p className="text-xs text-slate-400">
          Choisissez un mot de passe que vous n’utilisez nulle part ailleurs.
        </p>
      </div>

      <form
        onSubmit={soumettre}
        className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4"
      >
        {erreur && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{erreur}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Nouveau mot de passe
          </label>
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

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </div>
        </div>

        <p className="text-[10px] text-slate-500">
          Au moins 8 caractères, avec une lettre et un chiffre.
        </p>

        <button
          type="submit"
          disabled={enCours}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {enCours ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...
            </>
          ) : (
            <>
              Réinitialiser mon mot de passe <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
