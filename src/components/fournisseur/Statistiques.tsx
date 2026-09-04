'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Phone, TrendingUp, Loader2, MessageCircle } from 'lucide-react';

interface Stats {
  vues: { total: number; trenteJours: number; septJours: number };
  contacts: { total: number; trenteJours: number; septJours: number };
  tauxContact: number;
  parCanal: { canal: string; nombre: number }[];
  serie: { jour: string; vues: number }[];
}

/**
 * Audience de la boutique.
 *
 * Ce panneau porte la justification de l'abonnement fournisseur : sans chiffres, un
 * fournisseur qui paie 5 000 FCFA par mois n'a aucun moyen de savoir si ça lui
 * rapporte, et ne renouvelle pas.
 */
export default function Statistiques() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch('/api/fournisseur/statistiques')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.statistiques);
        setChargement(false);
      })
      .catch(() => setChargement(false));
  }, []);

  if (chargement) {
    return (
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" /> Chargement de votre audience...
      </div>
    );
  }

  if (!stats) return null;

  const maxVues = Math.max(...stats.serie.map((j) => j.vues), 1);
  const jamaisVu = stats.vues.total === 0;
  const whatsapp = stats.parCanal.find((c) => c.canal === 'WHATSAPP')?.nombre ?? 0;
  const telephone = stats.parCanal.find((c) => c.canal === 'TELEPHONE')?.nombre ?? 0;

  return (
    <section className="glass-card rounded-3xl p-5 sm:p-6 border border-slate-800 space-y-5">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white">Audience de ma boutique</h2>
          <p className="text-[11px] text-slate-400">
            Visiteurs uniques par jour, et contacts réellement déclenchés
          </p>
        </div>
      </div>

      {jamaisVu ? (
        <p className="text-xs text-slate-400 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 leading-relaxed">
          Aucune consultation pour l’instant. Les chiffres apparaîtront dès qu’un glacier
          ouvrira votre fiche. Ajoutez des offres au comparateur pour y apparaître&nbsp;:
          c’est par là que passent la plupart des visiteurs.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Tuile
              icone={<Eye className="w-3.5 h-3.5" />}
              libelle="Vues (30 j)"
              valeur={stats.vues.trenteJours}
              detail={`${stats.vues.septJours} sur 7 jours`}
              teinte="text-sky-300"
            />
            <Tuile
              icone={<Phone className="w-3.5 h-3.5" />}
              libelle="Contacts (30 j)"
              valeur={stats.contacts.trenteJours}
              detail={`${stats.contacts.septJours} sur 7 jours`}
              teinte="text-emerald-300"
            />
            <Tuile
              libelle="Taux de contact"
              valeur={`${stats.tauxContact} %`}
              detail="des visiteurs vous appellent"
              teinte="text-amber-300"
            />
            <Tuile
              libelle="Depuis l’ouverture"
              valeur={stats.vues.total}
              detail={`${stats.contacts.total} contacts au total`}
              teinte="text-slate-200"
            />
          </div>

          {/* Courbe des 30 derniers jours. Les jours creux sont dessinés à zéro plutôt
              qu'omis : une régularité en dents de scie est une information. */}
          <div>
            <div className="flex items-end gap-[3px] h-20" role="img" aria-label="Vues des 30 derniers jours">
              {stats.serie.map((j) => (
                <div
                  key={j.jour}
                  title={`${j.jour} — ${j.vues} vue${j.vues > 1 ? 's' : ''}`}
                  className="flex-1 rounded-t bg-sky-500/70 hover:bg-sky-400 transition-colors min-h-[2px]"
                  style={{ height: `${Math.max((j.vues / maxVues) * 100, 2)}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
              <span>il y a 30 jours</span>
              <span>aujourd’hui</span>
            </div>
          </div>

          {stats.contacts.trenteJours > 0 && (
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/60 border border-slate-800 text-slate-300">
                <MessageCircle className="w-3 h-3 text-emerald-400" />
                WhatsApp&nbsp;: <strong className="text-white">{whatsapp}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/60 border border-slate-800 text-slate-300">
                <Phone className="w-3 h-3 text-sky-400" />
                Appels&nbsp;: <strong className="text-white">{telephone}</strong>
              </span>
            </div>
          )}
        </>
      )}

      <p className="text-[10px] text-slate-500 leading-relaxed">
        Un visiteur n’est compté qu’une fois par jour, et vos propres visites sont
        exclues — ces chiffres reflètent une audience réelle, pas des rechargements.
      </p>
    </section>
  );
}

function Tuile({
  icone,
  libelle,
  valeur,
  detail,
  teinte,
}: {
  icone?: React.ReactNode;
  libelle: string;
  valeur: number | string;
  detail: string;
  teinte: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-3">
      <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 tracking-wide">
        {icone}
        {libelle}
      </span>
      <span className={`block text-xl font-black mt-1 tabular-nums ${teinte}`}>{valeur}</span>
      <span className="block text-[10px] text-slate-500 mt-0.5 leading-tight">{detail}</span>
    </div>
  );
}
