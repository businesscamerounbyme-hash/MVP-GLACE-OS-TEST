'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useSuggestionsVilles } from '@/lib/villes-client';
import { PAYS_TRIES, drapeau } from '@/lib/pays';
import ChampTelephone from '@/components/forms/ChampTelephone';
import { initiales } from '@/lib/nom';

type Message = { ton: 'ok' | 'erreur'; texte: string } | null;

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [chargement, setChargement] = useState(true);

  const [infos, setInfos] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    pays: '',
    ville: '',
  });
  const villesSuggerees = useSuggestionsVilles(infos.pays);
  const [enregistrement, setEnregistrement] = useState(false);
  const [msgInfos, setMsgInfos] = useState<Message>(null);

  const [mdp, setMdp] = useState({ ancien: '', nouveau: '', confirmation: '' });
  const [changementMdp, setChangementMdp] = useState(false);
  const [msgMdp, setMsgMdp] = useState<Message>(null);

  const [envoiPhoto, setEnvoiPhoto] = useState(false);
  const [msgPhoto, setMsgPhoto] = useState<Message>(null);
  const inputPhoto = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        // /api/auth/me renvoie { user } sans enveloppe `success` : tester un champ
        // absent renvoyait systématiquement vers la connexion, y compris authentifié.
        if (!d.user) {
          router.push('/login?suite=/profil');
          return;
        }
        setUser(d.user);
        setInfos({
          prenom: d.user.prenom || '',
          nom: d.user.nom || '',
          telephone: d.user.telephone || '',
          pays: d.user.pays || '',
          ville: d.user.ville || '',
        });
        setChargement(false);
      })
      .catch(() => router.push('/login?suite=/profil'));
  }, [router]);

  const enregistrerInfos = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgInfos(null);
    setEnregistrement(true);
    try {
      const res = await fetch('/api/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(infos),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsgInfos({ ton: 'erreur', texte: data.message || 'Erreur.' });
      } else {
        setUser((u: any) => ({ ...u, ...data.user }));
        setMsgInfos({ ton: 'ok', texte: 'Informations enregistrées.' });
        router.refresh();
      }
    } catch {
      setMsgInfos({ ton: 'erreur', texte: 'Impossible de joindre le serveur.' });
    }
    setEnregistrement(false);
  };

  const changerMotDePasse = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgMdp(null);

    if (mdp.nouveau !== mdp.confirmation) {
      setMsgMdp({ ton: 'erreur', texte: 'La confirmation ne correspond pas.' });
      return;
    }

    setChangementMdp(true);
    try {
      const res = await fetch('/api/profil/mot-de-passe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ancienMotDePasse: mdp.ancien,
          nouveauMotDePasse: mdp.nouveau,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsgMdp({ ton: 'erreur', texte: data.message || 'Erreur.' });
      } else {
        setMsgMdp({ ton: 'ok', texte: 'Mot de passe modifié.' });
        setMdp({ ancien: '', nouveau: '', confirmation: '' });
      }
    } catch {
      setMsgMdp({ ton: 'erreur', texte: 'Impossible de joindre le serveur.' });
    }
    setChangementMdp(false);
  };

  const envoyerPhoto = async (fichier: File) => {
    setMsgPhoto(null);
    setEnvoiPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', fichier);
      const res = await fetch('/api/profil/photo', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMsgPhoto({ ton: 'erreur', texte: data.message || 'Erreur.' });
      } else {
        setUser((u: any) => ({ ...u, photoUrl: data.photoUrl }));
        setMsgPhoto({ ton: 'ok', texte: 'Photo mise à jour.' });
      }
    } catch {
      setMsgPhoto({ ton: 'erreur', texte: 'Impossible d’envoyer l’image.' });
    }
    setEnvoiPhoto(false);
  };

  const supprimerPhoto = async () => {
    setMsgPhoto(null);
    setEnvoiPhoto(true);
    try {
      const res = await fetch('/api/profil/photo', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUser((u: any) => ({ ...u, photoUrl: null }));
        setMsgPhoto({ ton: 'ok', texte: 'Photo supprimée.' });
      } else {
        setMsgPhoto({ ton: 'erreur', texte: data.message || 'Erreur.' });
      }
    } catch {
      setMsgPhoto({ ton: 'erreur', texte: 'Impossible de joindre le serveur.' });
    }
    setEnvoiPhoto(false);
  };

  if (chargement) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        <p className="text-xs text-slate-400">Chargement de votre profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6 pb-16">
      <Link
        href="/espace"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à mon espace
      </Link>

      {/* Photo de profil */}
      <section className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-sm font-black text-white uppercase tracking-wider">Photo de profil</h2>

        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {user.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoUrl}
                alt="Photo de profil"
                className="w-20 h-20 rounded-2xl object-cover border border-slate-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center font-black text-2xl text-white">
                {initiales(user)}
              </div>
            )}
            {envoiPhoto && (
              <div className="absolute inset-0 rounded-2xl bg-slate-950/70 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <input
              ref={inputPhoto}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) envoyerPhoto(f);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={envoiPhoto}
              onClick={() => inputPhoto.current?.click()}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              {user.photoUrl ? 'Changer la photo' : 'Ajouter une photo'}
            </button>

            {user.photoUrl && (
              <button
                type="button"
                disabled={envoiPhoto}
                onClick={supprimerPhoto}
                className="w-full py-2 px-4 rounded-2xl border border-slate-800 text-slate-400 hover:text-rose-300 hover:border-rose-500/40 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            )}

            <p className="text-[10px] text-slate-500">JPEG, PNG ou WebP — 2 Mo maximum.</p>
          </div>
        </div>

        <Retour message={msgPhoto} />
      </section>

      {/* Informations personnelles */}
      <section className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            Mes informations
          </h2>
        </div>

        <form onSubmit={enregistrerInfos} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Champ
              label="Prénom"
              value={infos.prenom}
              onChange={(v) => setInfos({ ...infos, prenom: v })}
              placeholder="Fatou"
              requis
            />
            <Champ
              label="Nom"
              value={infos.nom}
              onChange={(v) => setInfos({ ...infos, nom: v })}
              placeholder="Ndiaye"
              requis
            />
          </div>

          <ChampTelephone
            valeur={infos.telephone}
            onChange={(v) => setInfos({ ...infos, telephone: v })}
            paysParDefaut={infos.pays}
            label="Téléphone"
            requis
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Pays <span className="text-amber-400">*</span>
              </label>
              <select
                value={infos.pays}
                onChange={(e) => {
                  // Changer de pays reinitialise la ville sur la premiere du pays :
                  // conserver l ancienne donnerait des couples incoherents (Dakar/Mali).
                  // La ville est vidée : conserver celle du pays precedent produirait
                  // des couples incoherents comme Dakar/Kenya.
                  setInfos({ ...infos, pays: e.target.value, ville: '' });
                }}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {PAYS_TRIES.map((p) => (
                  <option key={p.code} value={p.nom}>
                    {drapeau(p.code)} {p.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Ville <span className="text-amber-400">*</span>
              </label>
              {/* Saisie libre, comme a l inscription : les villes connues ne couvrent
                  qu une poignee de pays et servent ici de simples suggestions. */}
              <input
                type="text"
                required
                list="villes-profil"
                placeholder="Votre ville"
                value={infos.ville}
                onChange={(e) => setInfos({ ...infos, ville: e.target.value })}
                className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
              <datalist id="villes-profil">
                {villesSuggerees.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="pt-1">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Adresse email
            </label>
            <div className="px-3 py-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
              {user.email}
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              L’email identifie votre compte et ne peut pas être modifié ici. Contactez le
              support si nécessaire.
            </p>
          </div>

          <Retour message={msgInfos} />

          <button
            type="submit"
            disabled={enregistrement}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] transition"
          >
            {enregistrement ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...
              </>
            ) : (
              'Enregistrer mes informations'
            )}
          </button>
        </form>
      </section>

      {/* Mot de passe */}
      <section className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            Mot de passe
          </h2>
        </div>

        <form onSubmit={changerMotDePasse} className="space-y-3">
          <Champ
            label="Mot de passe actuel"
            type="password"
            value={mdp.ancien}
            onChange={(v) => setMdp({ ...mdp, ancien: v })}
            requis
          />
          <Champ
            label="Nouveau mot de passe"
            type="password"
            value={mdp.nouveau}
            onChange={(v) => setMdp({ ...mdp, nouveau: v })}
            requis
          />
          <Champ
            label="Confirmer le nouveau mot de passe"
            type="password"
            value={mdp.confirmation}
            onChange={(v) => setMdp({ ...mdp, confirmation: v })}
            requis
          />

          <p className="text-[10px] text-slate-500">
            Au moins 8 caractères, avec une lettre et un chiffre.
          </p>

          <Retour message={msgMdp} />

          <button
            type="submit"
            disabled={changementMdp}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition"
          >
            {changementMdp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Modification...
              </>
            ) : (
              'Changer mon mot de passe'
            )}
          </button>
        </form>
      </section>
    </div>
  );
}

function Champ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  requis = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  requis?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
        {label} {requis && <span className="text-amber-400">*</span>}
      </label>
      <input
        type={type}
        required={requis}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
      />
    </div>
  );
}

function Retour({ message }: { message: Message }) {
  if (!message) return null;
  const ok = message.ton === 'ok';
  return (
    <div
      className={`flex items-start gap-2 p-3 rounded-xl text-xs border ${
        ok
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
      }`}
    >
      {ok ? (
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      )}
      <span>{message.texte}</span>
    </div>
  );
}
