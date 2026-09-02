'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);
    try {
      const res = await fetch('/api/auth/mot-de-passe-oublie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErreur(data.message || 'Erreur lors de la demande.');
      } else {
        setEnvoye(true);
      }
    } catch {
      setErreur('Impossible de joindre le serveur.');
    }
    setEnCours(false);
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          <span className="text-2xl">🔑</span>
        </div>
        <h1 className="text-2xl font-black text-white">Mot de passe oublié</h1>
        <p className="text-xs text-slate-400">
          Indiquez votre adresse email et nous vous enverrons un lien pour en choisir un
          nouveau.
        </p>
      </div>

      {envoye ? (
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 space-y-4 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-extrabold text-white">Demande enregistrée</h2>
          <p className="text-xs text-slate-300">
            Si un compte existe pour <strong className="text-white">{email}</strong>, un lien
            de réinitialisation vient d’y être envoyé. Il expire dans 1 heure et ne peut
            servir qu’une fois.
          </p>
          <p className="text-[11px] text-slate-500">
            Pensez à regarder dans vos courriers indésirables.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form
          onSubmit={soumettre}
          className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4"
        >
          {erreur && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {erreur}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Adresse email
            </label>
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

          <button
            type="submit"
            disabled={enCours}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {enCours ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...
              </>
            ) : (
              <>
                Envoyer le lien <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-1">
            <Link href="/login" className="text-[11px] text-slate-400 hover:text-amber-400">
              Revenir à la connexion
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
