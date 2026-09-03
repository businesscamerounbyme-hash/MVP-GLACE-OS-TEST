'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Store, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Phone, 
  MessageCircle, 
  Lock, 
  Unlock, 
  Tag, 
  ArrowLeft, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Calendar,
  Send,
  User,
  Pencil,
  ShieldAlert
} from 'lucide-react';
import Adresse from '@/components/marketplace/Adresse';
import BadgeVerification from '@/components/marketplace/BadgeVerification';
import OfferCard from '@/components/marketplace/OfferCard';
import MobileMoneyModal from '@/components/payment/MobileMoneyModal';
import { UserSession } from '@/types';

export default function BoutiqueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boutiqueId = params?.id as string;

  const [boutique, setBoutique] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoMoModalOpen, setIsMoMoModalOpen] = useState(false);

  // Formulaire d'avis
  const [noteAvis, setNoteAvis] = useState(5);
  const [commentaireAvis, setCommentaireAvis] = useState('');
  const [isSubmittingAvis, setIsSubmittingAvis] = useState(false);
  const [avisMessage, setAvisMessage] = useState<string | null>(null);
  const [avisError, setAvisError] = useState<string | null>(null);

  const fetchBoutique = async () => {
    try {
      const res = await fetch(`/api/boutiques/${boutiqueId}`);
      const data = await res.json();
      if (data.success) {
        setBoutique(data.boutique);
      }
    } catch (err) {
      console.error('Erreur chargement boutique:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Session
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    if (boutiqueId) {
      fetchBoutique();
    }
  }, [boutiqueId]);

  const handleSubmitAvis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (!commentaireAvis.trim()) {
      setAvisError('Veuillez écrire un commentaire.');
      return;
    }

    setIsSubmittingAvis(true);
    setAvisError(null);
    setAvisMessage(null);

    try {
      const res = await fetch(`/api/boutiques/${boutiqueId}/avis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: noteAvis,
          commentaire: commentaireAvis
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAvisError(data.message || 'Erreur lors de l’envoi de votre avis.');
        setIsSubmittingAvis(false);
        return;
      }

      setAvisMessage(data.message);
      setCommentaireAvis('');
      setIsSubmittingAvis(false);
    } catch (err: any) {
      setAvisError('Erreur réseau.');
      setIsSubmittingAvis(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Chargement de la fiche boutique...</p>
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-sm font-bold text-slate-200">Boutique introuvable ou en cours de modération.</p>
        <Link href="/boutiques" className="text-xs text-amber-400 underline font-bold">
          Retour à la liste des boutiques
        </Link>
      </div>
    );
  }

  const isOwner = Boolean(
    currentUser &&
      boutique &&
      (currentUser.id === boutique.utilisateurId || currentUser.id === boutique.utilisateur?.id)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/boutiques"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux boutiques</span>
        </Link>

        {isOwner && (
          <Link
            href="/fournisseur"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 transition"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Modifier ma boutique</span>
          </Link>
        )}
      </div>

      {/* Avertissement de non-verification. Visible du proprietaire comme du visiteur,
          mais avec un message different : l un doit agir, l autre doit se mefier. */}
      {!boutique.badgeCertifie &&
        (isOwner ? (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-extrabold text-white">
                Votre boutique n’est pas encore vérifiée
              </p>
              <p className="text-xs text-amber-200/90 mt-0.5">
                Les visiteurs voient un avertissement sur votre fiche. Le badge certifié
                le remplace par un gage de confiance et vous distingue des autres
                fournisseurs de votre ville.
              </p>
            </div>
            <Link
              href="/fournisseur"
              className="shrink-0 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs whitespace-nowrap hover:scale-[1.02] transition"
            >
              Faire vérifier ma boutique
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3.5 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-200">
              <strong className="text-rose-100">Boutique non vérifiée.</strong> Ce
              fournisseur n’a pas fourni ses justificatifs à GLACE OS. Vérifiez son
              identité avant tout paiement, et privilégiez un règlement à la livraison.
            </p>
          </div>
        ))}

      {/* BOUTIQUE HEADER HERO */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <Adresse
                ville={boutique.ville}
                pays={boutique.pays}
                quartier={boutique.quartier}
                distanceKm={boutique.distanceKm}
                cliquable
              />

              <BadgeVerification certifie={boutique.badgeCertifie} />
            </div>

            {/* Shop Name */}
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {boutique.nom}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {boutique.description}
            </p>

            {/* Rating and metrics */}
            <div className="flex items-center gap-4 pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="font-extrabold text-white text-sm">
                  {boutique.noteMoyenne > 0 ? boutique.noteMoyenne.toFixed(1) : '5.0'}
                </span>
                <span className="text-slate-500">({boutique.avis?.length || 0} avis vérifiés)</span>
              </div>

              <span className="text-slate-600">•</span>

              <div className="text-emerald-400 font-bold">
                {boutique.offres?.length || 0} produits en stock
              </div>
            </div>

          </div>

          {/* CONTACT BOX / PAYWALL SECTION */}
          <div className="w-full md:w-80 rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-3.5 shrink-0">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Coordonnées Fournisseur</span>
              {boutique.isUnlocked ? (
                <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-bold">
                  <Unlock className="w-3.5 h-3.5" /> Débloqué
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 text-[11px] font-bold">
                  <Lock className="w-3.5 h-3.5" /> Réservé Membres
                </span>
              )}
            </h3>

            {boutique.isUnlocked ? (
              <div className="space-y-2.5">
                {/* WhatsApp button */}
                <a
                  href={`https://wa.me/${boutique.whatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${boutique.nom}, je vous contacte via la marketplace GLACE OS au sujet de vos produits de glacerie.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contacter sur WhatsApp ({boutique.whatsapp})</span>
                </a>

                {/* Direct Call */}
                <a
                  href={`tel:${boutique.telephone}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Appeler ({boutique.telephone})</span>
                </a>

                <p className="text-[10px] text-slate-400 text-center">
                  ✅ Coordonnées vérifiées par GLACE OS
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Masked preview */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Téléphone :</span>
                    <span className="font-mono font-bold text-slate-300">{boutique.telephone}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>WhatsApp :</span>
                    <span className="font-mono font-bold text-slate-300">{boutique.whatsapp}</span>
                  </div>
                </div>

                {/* Unlock CTA */}
                <button
                  onClick={() => setIsMoMoModalOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Débloquer le contact (2 000 FCFA/mois)</span>
                </button>

                <p className="text-[10px] text-slate-500 text-center leading-tight">
                  Paiement instantané Orange Money, MTN MoMo ou Wave
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* OFFRES PROPOSÉES PAR CE FOURNISSEUR */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-white">
              Catalogue & Prix de cette boutique ({boutique.offres?.length || 0})
            </h2>
          </div>
        </div>

        {boutique.offres?.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center">
            <p className="text-xs text-slate-400">Ce fournisseur n'a pas encore publié d'offres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boutique.offres?.map((offre: any) => (
              <OfferCard
                key={offre.id}
                id={offre.id}
                prix={offre.prix}
                devise={offre.devise}
                unite={offre.unite}
                quantiteDisponible={offre.quantiteDisponible}
                description={offre.description}
                produit={offre.produitReference}
                boutique={{
                  id: boutique.id,
                  nom: boutique.nom,
                  pays: boutique.pays,
                  ville: boutique.ville,
                  badgeCertifie: boutique.badgeCertifie
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* AVIS & ÉVALUATIONS CLIENTS */}
      <section className="space-y-5 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-lg font-black text-white">
              Avis des Glaciers Membres ({boutique.avis?.length || 0})
            </h2>
          </div>
        </div>

        {/* Formulaire de dépôt d'avis */}
        <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Laisser un avis sur ce fournisseur
          </h3>

          {avisMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{avisMessage}</span>
            </div>
          )}

          {avisError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{avisError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitAvis} className="space-y-3">
            {/* Note Selector (1 à 5 étoiles) */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Votre note :</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNoteAvis(star)}
                    className="p-1 text-slate-600 hover:text-amber-400 transition"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= noteAvis
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-400 ml-2">{noteAvis}/5 étoiles</span>
            </div>

            <textarea
              rows={2}
              required
              placeholder="Partagez votre expérience avec ce fournisseur (qualité du stabilisant, rapidité de livraison, emballage...)"
              value={commentaireAvis}
              onChange={(e) => setCommentaireAvis(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                🔒 Soumis à modération avant publication
              </span>
              <button
                type="submit"
                disabled={isSubmittingAvis}
                className="py-2 px-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingAvis ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Publier mon avis</span>
              </button>
            </div>
          </form>
        </div>

        {/* Liste des avis publiés */}
        <div className="space-y-3">
          {boutique.avis?.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Aucun avis publié pour l'instant. Soyez le premier à donner votre retour !</p>
          ) : (
            boutique.avis?.map((av: any) => (
              <div key={av.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                      {av.auteur?.nom?.slice(0, 2).toUpperCase() || 'GL'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {av.auteur?.nom}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {av.auteur?.ville || 'Glacier'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-400">
                    {[...Array(av.note)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-9">
                  "{av.commentaire}"
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Modal Mobile Money */}
      <MobileMoneyModal
        isOpen={isMoMoModalOpen}
        onClose={() => setIsMoMoModalOpen(false)}
        onSuccess={() => {
          setIsMoMoModalOpen(false);
          fetchBoutique();
        }}
        type="ABONNEMENT_MEMBRE"
        targetId={currentUser?.id || 'guest'}
        titre="Abonnement Membre Glacier"
        description="Débloquez l'accès direct aux coordonnées WhatsApp et téléphone de tous les fournisseurs de la plateforme pour 30 jours."
        montant={2000}
        devise="FCFA"
      />

    </div>
  );
}
