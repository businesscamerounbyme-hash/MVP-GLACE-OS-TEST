'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Store, 
  Layers, 
  Star, 
  Users, 
  History, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  Phone, 
  UserCheck, 
  ChevronRight,
  Filter,
  Globe,
} from 'lucide-react';
import { UserSession } from '@/types';
import GestionMarches from '@/components/admin/GestionMarches';
import Adresse from '@/components/marketplace/Adresse';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [data, setData] = useState<{
    boutiquesEnAttente: any[];
    propositionsEnAttente: any[];
    avisEnAttente: any[];
    demandesBadges: any[];
    journalModeration: any[];
    utilisateurs: any[];
  }>({
    boutiquesEnAttente: [],
    propositionsEnAttente: [],
    avisEnAttente: [],
    demandesBadges: [],
    journalModeration: [],
    utilisateurs: []
  });

  const [activeTab, setActiveTab] = useState<'BOUTIQUES' | 'PROPOSITIONS' | 'AVIS' | 'BADGES' | 'MARCHES' | 'UTILISATEURS' | 'JOURNAL'>('BOUTIQUES');
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const resUser = await fetch('/api/auth/me');
      const dataUser = await resUser.json();
      if (!dataUser.user || (dataUser.user.role !== 'ADMIN' && dataUser.user.role !== 'MODERATOR')) {
        router.push('/login');
        return;
      }
      setCurrentUser(dataUser.user);

      const resMod = await fetch('/api/admin/moderation');
      const dataMod = await resMod.json();
      if (dataMod.success) {
        setData(dataMod.data);
      }
    } catch (err) {
      console.error('Erreur modération:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (payload: {
    typeCible: string;
    cibleId: string;
    action: string;
    motif?: string;
    roleNouveau?: string;
    unitesAutorisees?: string;
  }) => {
    setProcessingId(payload.cibleId);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resJson = await res.json();
      if (resJson.success) {
        setActionFeedback(resJson.message);
        loadData();
      } else {
        alert(resJson.message || 'Erreur lors de l’action');
      }
    } catch (err) {
      alert('Erreur technique');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Chargement du centre de modération GLACE OS...</p>
      </div>
    );
  }

  const totalPending = 
    data.boutiquesEnAttente.length + 
    data.propositionsEnAttente.length + 
    data.avisEnAttente.length + 
    data.demandesBadges.length;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {currentUser?.role === 'ADMIN' ? 'Centre Super Administrateur' : 'Centre Modérateur GLACE OS'}
            </span>
            {totalPending > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] animate-pulse">
                {totalPending} en attente
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Modération & Contrôle de la Marketplace
          </h1>
          <p className="text-xs text-slate-400">
            Validez les boutiques, enrichissez le catalogue de référence, modérez les avis et gérez les rôles
          </p>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('BOUTIQUES')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${
            activeTab === 'BOUTIQUES'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Boutiques ({data.boutiquesEnAttente.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROPOSITIONS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${
            activeTab === 'PROPOSITIONS'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Nouveaux Produits ({data.propositionsEnAttente.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('AVIS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${
            activeTab === 'AVIS'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Avis Clients ({data.avisEnAttente.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BADGES')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${
            activeTab === 'BADGES'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Badges Certifiés ({data.demandesBadges.length})</span>
        </button>

        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('MARCHES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${
              activeTab === 'MARCHES'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Marchés</span>
          </button>
        )}

        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('UTILISATEURS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${
              activeTab === 'UTILISATEURS'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Utilisateurs & Rôles ({data.utilisateurs.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('JOURNAL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${
            activeTab === 'JOURNAL'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Journal d'Audit ({data.journalModeration.length})</span>
        </button>
      </div>

      {/* TAB 1: BOUTIQUES EN ATTENTE */}
      {activeTab === 'BOUTIQUES' && (
        <div className="space-y-4">
          {data.boutiquesEnAttente.length === 0 ? (
            <div className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">Toutes les boutiques sont à jour !</p>
              <p className="text-xs text-slate-400">Aucune boutique en attente de validation.</p>
            </div>
          ) : (
            data.boutiquesEnAttente.map((b) => (
              <div key={b.id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Nouvelle Boutique en Attente
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-1">{b.nom}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                      <Adresse ville={b.ville} pays={b.pays} quartier={b.quartier} taille="compact" />
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{b.telephone} / WA: {b.whatsapp}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={processingId === b.id}
                      onClick={() => handleAction({
                        typeCible: 'BOUTIQUE',
                        cibleId: b.id,
                        action: 'APPROUVER',
                        motif: 'Boutique et coordonnées validées par le modérateur'
                      })}
                      className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>Valider & Publier</span>
                    </button>

                    <button
                      disabled={processingId === b.id}
                      onClick={() => {
                        const motif = prompt('Motif du rejet de la boutique :', 'Informations incomplètes ou non joignable');
                        if (motif) {
                          handleAction({
                            typeCible: 'BOUTIQUE',
                            cibleId: b.id,
                            action: 'REJETER',
                            motif
                          });
                        }
                      }}
                      className="py-2 px-4 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Rejeter</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {b.description}
                </p>
                <div className="text-[11px] text-slate-500">
                  Propriétaire : {b.utilisateur?.nom} ({b.utilisateur?.email})
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PROPOSITIONS DE PRODUITS */}
      {activeTab === 'PROPOSITIONS' && (
        <div className="space-y-4">
          {data.propositionsEnAttente.length === 0 ? (
            <div className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">Aucune proposition de nouveau produit en attente.</p>
            </div>
          ) : (
            data.propositionsEnAttente.map((p) => (
              <div key={p.id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {p.categorie} • {p.sousCategorie}
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-1">{p.nom}</h3>
                    <p className="text-xs text-slate-400">Proposé par : {p.boutique?.nom} ({p.boutique?.ville})</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={processingId === p.id}
                      onClick={() => {
                        const unites = prompt('Unités autorisées pour ce produit (séparées par virgules) :', 'kg, sac 25kg, boîte 1kg, litre');
                        handleAction({
                          typeCible: 'PRODUIT_PROPOSE',
                          cibleId: p.id,
                          action: 'APPROUVER',
                          unitesAutorisees: unites || 'kg, sac 25kg, boîte 1kg, litre, pièce',
                          motif: 'Ajouté au catalogue de référence officiel'
                        });
                      }}
                      className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accepter dans le Catalogue</span>
                    </button>

                    <button
                      disabled={processingId === p.id}
                      onClick={() => {
                        const motif = prompt('Motif du rejet (ex: Doublon avec Cremodan SE 30) :', 'Doublon avec référence existante');
                        if (motif) {
                          handleAction({
                            typeCible: 'PRODUIT_PROPOSE',
                            cibleId: p.id,
                            action: 'REJETER',
                            motif
                          });
                        }
                      }}
                      className="py-2 px-4 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Rejeter pour doublon</span>
                    </button>
                  </div>
                </div>

                {p.description && (
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {p.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: AVIS CLIENTS */}
      {activeTab === 'AVIS' && (
        <div className="space-y-4">
          {data.avisEnAttente.length === 0 ? (
            <div className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">Tous les avis clients sont modérés !</p>
            </div>
          ) : (
            data.avisEnAttente.map((av) => (
              <div key={av.id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {av.utilisateur?.nom} sur <strong>{av.boutique?.nom}</strong>
                      </span>
                      <div className="flex items-center text-amber-400">
                        {[...Array(av.note)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={processingId === av.id}
                      onClick={() => handleAction({
                        typeCible: 'AVIS',
                        cibleId: av.id,
                        action: 'APPROUVER',
                        motif: 'Avis conforme et constructif'
                      })}
                      className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Publier</span>
                    </button>

                    <button
                      disabled={processingId === av.id}
                      onClick={() => handleAction({
                        typeCible: 'AVIS',
                        cibleId: av.id,
                        action: 'REJETER',
                        motif: 'Contenu non conforme ou suspect'
                      })}
                      className="py-1.5 px-3.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Rejeter</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  "{av.commentaire}"
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: BADGES CERTIFIÉS */}
      {activeTab === 'BADGES' && (
        <div className="space-y-4">
          {data.demandesBadges.length === 0 ? (
            <div className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">Aucune demande de badge en attente.</p>
            </div>
          ) : (
            data.demandesBadges.map((badge) => (
              <div key={badge.id} className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Frais réglés ({badge.montant} FCFA via {badge.operateur || 'Mobile Money'})
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{badge.boutique?.nom}</h4>
                  <p className="text-xs text-slate-400">{badge.boutique?.ville} ({badge.boutique?.pays})</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={processingId === badge.id}
                    onClick={() => handleAction({
                      typeCible: 'DEMANDE_BADGE',
                      cibleId: badge.id,
                      action: 'APPROUVER',
                      motif: 'Documents vérifiés, badge certifié accordé'
                    })}
                    className="py-2 px-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Accorder le Badge Certifié</span>
                  </button>

                  <button
                    disabled={processingId === badge.id}
                    onClick={() => handleAction({
                      typeCible: 'DEMANDE_BADGE',
                      cibleId: badge.id,
                      action: 'REJETER',
                      motif: 'Documents non fournis'
                    })}
                    className="py-2 px-3 rounded-xl bg-slate-800 text-rose-400 font-bold text-xs"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: GESTION DES UTILISATEURS & RÔLES (ADMIN SEUL) */}
      {activeTab === 'MARCHES' && currentUser?.role === 'ADMIN' && <GestionMarches />}

      {activeTab === 'UTILISATEURS' && currentUser?.role === 'ADMIN' && (
        <div className="space-y-3">
          <div className="glass-card rounded-2xl p-4 border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-500 uppercase">
                <tr>
                  <th className="pb-2">Nom</th>
                  <th className="pb-2">Email / Téléphone</th>
                  <th className="pb-2">Ville</th>
                  <th className="pb-2">Rôle Actuel</th>
                  <th className="pb-2 text-right">Attribuer un Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.utilisateurs.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="py-3 font-bold text-white">{u.nom}</td>
                    <td className="py-3 text-slate-400">{u.email}<br/><span className="text-[10px] text-slate-500">{u.telephone}</span></td>
                    <td className="py-3 text-slate-300">{u.ville} ({u.pays})</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : u.role === 'MODERATOR'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : u.role === 'SUPPLIER'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleAction({
                          typeCible: 'UTILISATEUR',
                          cibleId: u.id,
                          action: 'MODIFIER_ROLE',
                          roleNouveau: e.target.value,
                          motif: `Attribution du rôle ${e.target.value} par l'Administrateur`
                        })}
                        className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="MEMBER">Membre</option>
                        <option value="SUPPLIER">Fournisseur</option>
                        <option value="MODERATOR">Modérateur</option>
                        <option value="ADMIN">Super Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: JOURNAL D'AUDIT DE MODÉRATION */}
      {activeTab === 'JOURNAL' && (
        <div className="space-y-2">
          {data.journalModeration.length === 0 ? (
            <p className="text-xs text-slate-500">Aucune action enregistrée.</p>
          ) : (
            data.journalModeration.map((j) => (
              <div key={j.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      j.action === 'APPROUVER'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : j.action === 'REJETER'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {j.action}
                    </span>
                    <span className="font-bold text-white uppercase text-[11px]">{j.typeCible}</span>
                    <span className="text-slate-400">par {j.moderateur?.nom} ({j.moderateur?.role})</span>
                  </div>
                  {j.motif && <p className="text-slate-400 italic text-[11px]">"{j.motif}"</p>}
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(j.dateAction).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
