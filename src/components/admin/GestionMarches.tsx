'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Loader2, CheckCircle2, AlertCircle, Search } from 'lucide-react';

interface PaysMarche {
  code: string;
  nom: string;
  indicatif: string;
  drapeau: string;
  ouvertAuxBoutiques: boolean;
}

/**
 * Ouverture progressive des marchés.
 *
 * Tous les pays africains sont visibles sur le site, mais seuls ceux ouverts ici
 * acceptent la création d'une boutique — de quoi éviter d'exposer une carte vide dans
 * un pays où aucun approvisionnement n'existe encore.
 */
export default function GestionMarches() {
  const [pays, setPays] = useState<PaysMarche[]>([]);
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ton: 'ok' | 'erreur'; texte: string } | null>(null);
  const [recherche, setRecherche] = useState('');

  const charger = () =>
    fetch('/api/pays')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPays(d.pays);
        setChargement(false);
      })
      .catch(() => setChargement(false));

  useEffect(() => {
    charger();
  }, []);

  const basculer = async (p: PaysMarche) => {
    setEnCours(p.code);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/pays', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: p.code, ouvert: !p.ouvertAuxBoutiques }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ ton: 'erreur', texte: data.message || 'Erreur.' });
      } else {
        setMessage({ ton: 'ok', texte: `${p.drapeau} ${p.nom} — ${data.message}` });
        await charger();
      }
    } catch {
      setMessage({ ton: 'erreur', texte: 'Impossible de joindre le serveur.' });
    }
    setEnCours(null);
  };

  const filtres = pays.filter((p) =>
    p.nom.toLowerCase().includes(recherche.trim().toLowerCase())
  );
  const nbOuverts = pays.filter((p) => p.ouvertAuxBoutiques).length;

  if (chargement) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 py-6">
        <Loader2 className="w-4 h-4 animate-spin" /> Chargement des marchés...
      </div>
    );
  }

  return (
    <section className="glass-card rounded-3xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Ouverture des marchés</h2>
            <p className="text-[11px] text-slate-400">
              Pays où un fournisseur peut créer une boutique
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {nbOuverts} / {pays.length} ouverts
        </span>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un pays..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
      </div>

      {message && (
        <div
          className={`flex items-start gap-2 p-3 rounded-xl text-xs border ${
            message.ton === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {message.ton === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{message.texte}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
        {filtres.map((p) => (
          <button
            key={p.code}
            type="button"
            disabled={enCours === p.code}
            onClick={() => basculer(p)}
            className={`flex items-center justify-between gap-2 p-2.5 rounded-2xl border text-left transition disabled:opacity-50 ${
              p.ouvertAuxBoutiques
                ? 'border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-400'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-base leading-none">{p.drapeau}</span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-white truncate">{p.nom}</span>
                <span className="text-[10px] text-slate-500 font-mono">{p.indicatif}</span>
              </span>
            </span>

            {enCours === p.code ? (
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
            ) : (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  p.ouvertAuxBoutiques
                    ? 'bg-emerald-500/25 text-emerald-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {p.ouvertAuxBoutiques ? 'Ouvert' : 'Fermé'}
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-slate-500">
        Fermer un marché n’affecte pas les boutiques déjà en place : seules les nouvelles
        inscriptions de fournisseurs y sont bloquées.
      </p>
    </section>
  );
}
