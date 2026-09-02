'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import { PAYS_AFRIQUE, PaysAfrique } from '@/lib/geo';

interface Props {
  /** Numéro complet, indicatif compris — c'est ce qui est stocké. */
  valeur: string;
  onChange: (numeroComplet: string) => void;
  /** Pays du formulaire : préselectionne l'indicatif sans le verrouiller. */
  paysParDefaut?: string;
  label?: string;
  requis?: boolean;
}

/**
 * Saisie d'un numéro avec sélection du pays.
 *
 * L'indicatif est choisi séparément et le champ ne reçoit que le numéro local, ce qui
 * évite les saisies hétérogènes (« 07 12 34 56 78 », « +225 07... », « 00225 07... »)
 * pour un même numéro. La valeur remontée est toujours normalisée en indicatif + chiffres.
 *
 * L'indicatif reste modifiable indépendamment du pays de résidence : un fournisseur
 * installé à Abidjan peut garder une ligne camerounaise.
 */
export default function ChampTelephone({
  valeur,
  onChange,
  paysParDefaut,
  label = 'Téléphone / WhatsApp',
  requis = false,
}: Props) {
  const paysInitial =
    PAYS_AFRIQUE.find((p) => valeur && valeur.startsWith(p.indicatif)) ??
    PAYS_AFRIQUE.find((p) => p.nom === paysParDefaut) ??
    PAYS_AFRIQUE[0];

  const [pays, setPays] = useState<PaysAfrique>(paysInitial);
  const [ouvert, setOuvert] = useState(false);
  const conteneur = useRef<HTMLDivElement>(null);

  const numeroLocal = valeur.startsWith(pays.indicatif)
    ? valeur.slice(pays.indicatif.length).trim()
    : valeur.replace(/^\+\d+/, '').trim();

  // Suit le pays du formulaire tant que l'utilisateur n'a pas saisi de numéro :
  // changer de pays doit mettre à jour l'indicatif, sans écraser une saisie en cours.
  useEffect(() => {
    if (numeroLocal) return;
    const correspondant = PAYS_AFRIQUE.find((p) => p.nom === paysParDefaut);
    if (correspondant && correspondant.code !== pays.code) {
      setPays(correspondant);
      onChange('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paysParDefaut]);

  useEffect(() => {
    if (!ouvert) return;
    const auClic = (e: MouseEvent) => {
      if (conteneur.current && !conteneur.current.contains(e.target as Node)) setOuvert(false);
    };
    const auClavier = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(false);
    document.addEventListener('mousedown', auClic);
    document.addEventListener('keydown', auClavier);
    return () => {
      document.removeEventListener('mousedown', auClic);
      document.removeEventListener('keydown', auClavier);
    };
  }, [ouvert]);

  const composer = (indicatif: string, local: string) => {
    const chiffres = local.replace(/[^\d\s-]/g, '').trim();
    return chiffres ? `${indicatif} ${chiffres}` : '';
  };

  const changerPays = (p: PaysAfrique) => {
    setPays(p);
    setOuvert(false);
    onChange(composer(p.indicatif, numeroLocal));
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-300 mb-1.5">
        {label} {requis && <span className="text-amber-400">*</span>}
      </label>

      <div className="flex gap-2" ref={conteneur}>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOuvert(!ouvert)}
            className="h-full flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white hover:border-amber-400/60 transition"
            aria-label="Choisir l’indicatif du pays"
          >
            <span className="text-base leading-none">{pays.drapeau}</span>
            <span className="font-semibold">{pays.indicatif}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {ouvert && (
            <div className="absolute left-0 top-full mt-1 w-56 max-h-64 overflow-y-auto rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50">
              {PAYS_AFRIQUE.map((p) => (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => changerPays(p)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition ${
                    p.code === pays.code
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base leading-none">{p.drapeau}</span>
                  <span className="flex-1 truncate">{p.nom}</span>
                  <span className="text-slate-500 font-mono">{p.indicatif}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex-1">
          <input
            type="tel"
            required={requis}
            inputMode="numeric"
            placeholder="07 12 34 56 78"
            value={numeroLocal}
            onChange={(e) => onChange(composer(pays.indicatif, e.target.value))}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>
      </div>

      {valeur && (
        <p className="text-[10px] text-slate-500 mt-1.5">
          Enregistré : <span className="font-mono text-slate-400">{valeur}</span>
        </p>
      )}
    </div>
  );
}
