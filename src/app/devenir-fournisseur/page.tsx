'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import ChampTelephone from '@/components/forms/ChampTelephone';
import { useSuggestionsVilles } from '@/lib/villes-client';
import { suggestionsVilles } from '@/lib/villes';

export default function DevenirFournisseurPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [chargement, setChargement] = useState(true);
  const [paysOuverts, setPaysOuverts] = useState<any[]>([]);

  const [nomBoutique, setNomBoutique] = useState('');
  const [description, setDescription] = useState('');
  const [pays, setPays] = useState('');
  const [ville, setVille] = useState('');
  const [quartier, setQuartier] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [reussi, setReussi] = useState(false);

  const villesSuggerees = useSuggestionsVilles(pays);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/pays').then((r) => r.json()),
    ])
      .then(([session, listePays]) => {
        if (!session.user) {
          router.push('/login?suite=/devenir-fournisseur');
          return;
        }
        setUser(session.user);
        setWhatsapp(session.user.telephone || '');

        const ouverts = (listePays.pays || []).filter((p: any) => p.ouvertAuxBoutiques);
        setPaysOuverts(ouverts);

        // Préselection du pays de l'utilisateur s'il est ouvert, sinon le premier
        // marché disponible : proposer un pays fermé mènerait à un refus du serveur.
        const sien = ouverts.find((p: any) => p.nom === session.user.pays);
        const choisi = sien ?? ouverts[0];
        if (choisi) {
          setPays(choisi.nom);
          setVille(sien ? session.user.ville || '' : suggestionsVilles(choisi.nom)[0] ?? '');
        }
        setChargement(false);
      })
      .catch(() => router.push('/login?suite=/devenir-fournisseur'));
  }, [router]);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      const res = await fetch('/api/devenir-fournisseur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomBoutique,
          description,
          pays,
          ville,
          quartier,
          whatsapp,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErreur(data.message || 'Erreur lors de la création.');
        setEnvoi(false);
        return;
      }
      setReussi(true);
      // Navigation complète : le rôle vient de changer, toute l'interface doit être
      // reconstruite avec la nouvelle session.
      setTimeout(() => window.location.assign('/fournisseur'), 1800);
    } catch {
      setErreur('Impossible de joindre le serveur.');
      setEnvoi(false);
    }
  };

  if (chargement) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        <p className="text-xs text-slate-400">Chargement...</p>
      </div>
    );
  }

  if (user?.role === 'SUPPLIER') {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Store className="w-12 h-12 text-emerald-400 mx-auto" />
        <h1 className="text-xl font-black text-white">Vous êtes déjà fournisseur</h1>
        <Link
          href="/fournisseur"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-black text-xs"
        >
          Aller à mon espace fournisseur <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (reussi) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
        <h1 className="text-xl font-black text-white">Boutique créée</h1>
        <p className="text-xs text-slate-300">
          Elle attend la validation d’un modérateur avant d’être visible. Vous pouvez déjà
          préparer vos offres.
        </p>
        <p className="text-[11px] text-slate-500">Redirection vers votre espace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 space-y-6 pb-16">
      <Link
        href="/espace"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à mon espace
      </Link>

      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-300 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <span className="text-2xl">🏪</span>
        </div>
        <h1 className="text-2xl font-black text-white">Devenir fournisseur</h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Publiez votre boutique et vos offres d’ingrédients, d’emballages ou
          d’équipements auprès des glaciers de votre ville.
        </p>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <span>
          Votre compte reste le même — seul un espace fournisseur s’ajoute. Votre boutique
          sera vérifiée par un modérateur avant d’apparaître publiquement.
        </span>
      </div>

      {paysOuverts.length === 0 ? (
        <div className="glass-card rounded-3xl p-6 border border-amber-500/30 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm font-bold text-white">Aucun marché ouvert pour l’instant</p>
          <p className="text-xs text-slate-400">
            Les inscriptions fournisseurs ne sont pas encore ouvertes. Revenez bientôt.
          </p>
        </div>
      ) : (
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
              Nom commercial de la boutique <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: AfriGlaces Distribution"
              value={nomBoutique}
              onChange={(e) => setNomBoutique(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
            <p className="text-[10px] text-slate-500 mt-1.5">
              C’est l’enseigne sous laquelle vos clients vous trouveront, pas votre nom.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Pays <span className="text-emerald-400">*</span>
              </label>
              <select
                value={pays}
                onChange={(e) => {
                  setPays(e.target.value);
                  setVille(suggestionsVilles(e.target.value)[0] ?? '');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                {paysOuverts.map((p) => (
                  <option key={p.code} value={p.nom}>
                    {p.drapeau} {p.nom}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Seuls les pays déjà ouverts aux fournisseurs apparaissent.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Ville <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                list="villes-fournisseur"
                placeholder="Votre ville"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
              <datalist id="villes-fournisseur">
                {villesSuggerees.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Quartier / Zone
              </label>
              <input
                type="text"
                placeholder="Ex: Treichville Zone 3"
                value={quartier}
                onChange={(e) => setQuartier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <ChampTelephone
              valeur={whatsapp}
              onChange={setWhatsapp}
              paysParDefaut={pays}
              label="Numéro WhatsApp direct"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Vos spécialités
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Stabilisants, arômes italiens, pots kraft, turbines d’occasion..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <button
            type="submit"
            disabled={envoi}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {envoi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Création en cours...
              </>
            ) : (
              <>
                Créer ma boutique <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
