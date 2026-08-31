'use client';

import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

interface MobileMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reference: string) => void;
  type: 'ABONNEMENT_FOURNISSEUR' | 'ABONNEMENT_MEMBRE' | 'DEMANDE_BADGE';
  targetId: string;
  titre: string;
  description: string;
  montant: number;
  devise?: string;
}

export default function MobileMoneyModal({
  isOpen,
  onClose,
  onSuccess,
  type,
  targetId,
  titre,
  description,
  montant,
  devise = 'FCFA'
}: MobileMoneyModalProps) {
  const [operateur, setOperateur] = useState<'ORANGE_MONEY' | 'MTN_MOMO' | 'WAVE' | 'MOOV_MONEY'>('ORANGE_MONEY');
  const [telephone, setTelephone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ reference: string; message: string } | null>(null);

  if (!isOpen) return null;

  const handlePaiement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telephone.trim() || telephone.length < 8) {
      setError('Veuillez renseigner un numéro de téléphone Mobile Money valide.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const res = await fetch('/api/paiements/momo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Ni le montant ni la cible d'un abonnement membre ne sont transmis : le serveur
        // applique son propre barème et déduit la cible de la session. `boutiqueId` n'est
        // utile que pour les paiements liés à une boutique, et sa propriété est vérifiée.
        body: JSON.stringify({
          type,
          boutiqueId: type === 'ABONNEMENT_MEMBRE' ? undefined : targetId,
          operateur,
          numeroTelephone: telephone
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Erreur lors du traitement du paiement Mobile Money.');
        setIsProcessing(false);
        return;
      }

      setSuccessData({
        reference: data.reference,
        message: data.message
      });
      setIsProcessing(false);

      setTimeout(() => {
        onSuccess(data.reference);
      }, 1500);

    } catch (err: any) {
      setError('Impossible de joindre le serveur de paiement Mobile Money.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {successData ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <Smartphone className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Paiement en attente</h3>
            <p className="text-sm text-slate-300 max-w-xs mx-auto">
              {successData.message}
            </p>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400">
              Réf : {successData.reference}
            </div>
            <p className="text-xs text-slate-400">
              Vos accès seront débloqués dès la confirmation de l’opérateur.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">{titre}</h3>
                <span className="text-xs text-slate-400">Paiement sécurisé Mobile Money</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/70">
              {description}
            </p>

            {/* Price badge */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 mb-5">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Montant à régler</span>
                <span className="text-2xl font-black text-amber-400">
                  {montant.toLocaleString('fr-FR')} <span className="text-sm font-semibold text-slate-300">{devise}</span>
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                30 jours d'accès
              </span>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePaiement} className="space-y-4">
              {/* Operator Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Choisissez votre opérateur :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Orange Money */}
                  <button
                    type="button"
                    onClick={() => setOperateur('ORANGE_MONEY')}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                      operateur === 'ORANGE_MONEY'
                        ? 'border-orange-500 bg-orange-500/20 text-orange-300 shadow-md shadow-orange-500/10'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#FF7900] shrink-0" />
                    <span className="truncate">Orange Money</span>
                  </button>

                  {/* MTN MoMo */}
                  <button
                    type="button"
                    onClick={() => setOperateur('MTN_MOMO')}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                      operateur === 'MTN_MOMO'
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 shadow-md shadow-yellow-400/10'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#FFCC00] shrink-0" />
                    <span className="truncate">MTN MoMo</span>
                  </button>

                  {/* Wave */}
                  <button
                    type="button"
                    onClick={() => setOperateur('WAVE')}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                      operateur === 'WAVE'
                        ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-md shadow-cyan-400/10'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#1DC4F2] shrink-0" />
                    <span className="truncate">Wave</span>
                  </button>

                  {/* Moov Money */}
                  <button
                    type="button"
                    onClick={() => setOperateur('MOOV_MONEY')}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                      operateur === 'MOOV_MONEY'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-md shadow-blue-500/10'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#005CA9] shrink-0" />
                    <span className="truncate">Moov Money</span>
                  </button>
                </div>
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Numéro de téléphone Mobile Money :
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 07 12 34 56 78 ou 77 654 32 10"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <Smartphone className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 Vous recevrez un prompt USSD sur votre téléphone pour valider avec votre code secret.
                </p>
              </div>

              {/* Submit / Test button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validation Mobile Money en cours...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Payer {montant.toLocaleString('fr-FR')} {devise}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
