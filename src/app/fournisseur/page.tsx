'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Store, 
  Plus, 
  Tag, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2,
  Calendar,
  DollarSign,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import MobileMoneyModal from '@/components/payment/MobileMoneyModal';
import { UserSession } from '@/types';

export default function FournisseurDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [boutique, setBoutique] = useState<any>(null);
  const [catalogueRef, setCatalogueRef] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Formulaire Nouvelle Offre
  const [selectedProdRefId, setSelectedProdRefId] = useState('');
  const [prixOffre, setPrixOffre] = useState('');
  const [uniteOffre, setUniteOffre] = useState('');
  const [quantiteOffre, setQuantiteOffre] = useState('10');
  const [descOffre, setDescOffre] = useState('');
  const [isSubmittingOffre, setIsSubmittingOffre] = useState(false);
  const [offreMsg, setOffreMsg] = useState<string | null>(null);
  const [offreError, setOffreError] = useState<string | null>(null);

  // Formulaire Proposition Nouveau Produit
  const [nomProp, setNomProp] = useState('');
  const [catProp, setCatProp] = useState('INGREDIENT');
  const [sousCatProp, setSousCatProp] = useState('');
  const [descProp, setDescProp] = useState('');
  const [isSubmittingProp, setIsSubmittingProp] = useState(false);
  const [propMsg, setPropMsg] = useState<string | null>(null);
  const [propError, setPropError] = useState<string | null>(null);

  // Modal Mobile Money
  const [momoModal, setMomoModal] = useState<{
    isOpen: boolean;
    type: 'ABONNEMENT_FOURNISSEUR' | 'DEMANDE_BADGE';
    titre: string;
    description: string;
    montant: number;
  }>({
    isOpen: false,
    type: 'ABONNEMENT_FOURNISSEUR',
    titre: '',
    description: '',
    montant: 10000
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Session, catalogue et boutiques ne dépendent pas les uns des autres : les
      // enchaîner en série faisait attendre la somme des trois latences. Seul le
      // détail de la boutique, plus bas, a besoin d'un résultat précédent.
      const [dataUser, dataCat, dataBoutiques] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/produits-reference').then((r) => r.json()),
        fetch('/api/boutiques').then((r) => r.json()),
      ]);

      if (!dataUser.user) {
        router.push('/login');
        return;
      }
      setUser(dataUser.user);

      if (dataCat.success) setCatalogueRef(dataCat.produits || []);

      if (dataBoutiques.success) {
        const found = dataBoutiques.boutiques.find((b: any) => b.utilisateurId === dataUser.user.id);
        if (found) {
          // Recharger les détails complets
          const resDetail = await fetch(`/api/boutiques/${found.id}`);
          const dataDetail = await resDetail.json();
          if (dataDetail.success) setBoutique(dataDetail.boutique);
        }
      }
    } catch (err) {
      console.error('Erreur fournisseur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Mettre à jour l'unité suggérée quand on choisit un produit de référence
  const handleProductSelect = (prodId: string) => {
    setSelectedProdRefId(prodId);
    const prod = catalogueRef.find(p => p.id === prodId);
    if (prod && prod.unitesAutorisees) {
      const firstUnit = prod.unitesAutorisees.split(',')[0].trim();
      setUniteOffre(firstUnit);
    }
  };

  const handleCreateOffre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdRefId || !prixOffre || !uniteOffre) {
      setOffreError('Veuillez sélectionner un produit de référence, un prix et une unité.');
      return;
    }

    setIsSubmittingOffre(true);
    setOffreError(null);
    setOffreMsg(null);

    try {
      const res = await fetch('/api/fournisseur/offre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produitReferenceId: selectedProdRefId,
          prix: parseFloat(prixOffre),
          unite: uniteOffre,
          quantiteDisponible: parseFloat(quantiteOffre) || 1,
          description: descOffre
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOffreError(data.message || 'Erreur lors de la création de l’offre.');
        setIsSubmittingOffre(false);
        return;
      }

      setOffreMsg('Offre ajoutée avec succès et visible sur le comparateur de prix !');
      setPrixOffre('');
      setDescOffre('');
      setIsSubmittingOffre(false);
      loadData();
    } catch (err: any) {
      setOffreError('Erreur réseau.');
      setIsSubmittingOffre(false);
    }
  };

  const handleDeleteOffre = async (offreId: string) => {
    if (!confirm('Voulez-vous supprimer cette offre du comparateur ?')) return;
    try {
      await fetch(`/api/fournisseur/offre?id=${offreId}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  const handleProposeProduit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomProp || !catProp || !sousCatProp) {
      setPropError('Veuillez remplir le nom, la catégorie et la sous-catégorie.');
      return;
    }

    setIsSubmittingProp(true);
    setPropError(null);
    setPropMsg(null);

    try {
      const res = await fetch('/api/fournisseur/proposition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nomProp,
          categorie: catProp,
          sousCategorie: sousCatProp,
          description: descProp
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPropError(data.message || 'Erreur lors de la proposition.');
        setIsSubmittingProp(false);
        return;
      }

      setPropMsg('Proposition envoyée aux modérateurs avec succès !');
      setNomProp('');
      setSousCatProp('');
      setDescProp('');
      setIsSubmittingProp(false);
    } catch (err: any) {
      setPropError('Erreur réseau.');
      setIsSubmittingProp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Chargement de votre espace fournisseur...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* HEADER FOURNISSEUR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Espace Fournisseur B2B
            </span>
            {boutique?.badgeCertifie && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <ShieldCheck className="w-4 h-4" /> Certifié
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {boutique?.nom || 'Ma Boutique Fournisseur'}
          </h1>
          <p className="text-xs text-slate-400">
            Gérez vos offres rattachées au catalogue de référence et vos abonnements Mobile Money
          </p>
        </div>

        {/* Action buttons (Badge / Abonnement) */}
        <div className="flex flex-wrap items-center gap-2">
          {!boutique?.badgeCertifie && (
            <button
              onClick={() => setMomoModal({
                isOpen: true,
                type: 'DEMANDE_BADGE',
                titre: 'Demande de Badge Certifié GLACE OS',
                description: 'Obtenez le badge certifié officiel, inspirez une confiance maximale et apparaissez en tête des recherches.',
                montant: 15000
              })}
              className="py-2 px-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Demander le Badge Certifié (15 000 FCFA)</span>
            </button>
          )}

          <button
            onClick={() => setMomoModal({
              isOpen: true,
              type: 'ABONNEMENT_FOURNISSEUR',
              titre: 'Renouvellement Abonnement Fournisseur',
              description: 'Conservez la visibilité prioritaire de votre boutique et de toutes vos offres pour 30 jours supplémentaires.',
              montant: 10000
            })}
            className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>Abonnement (10 000 FCFA/mois)</span>
          </button>
        </div>
      </div>

      {/* BOUTIQUE STATUS ALERT */}
      {boutique && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
          boutique.statut === 'PUBLIEE'
            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
            : boutique.statut === 'EN_ATTENTE'
            ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
            : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
        }`}>
          {boutique.statut === 'PUBLIEE' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <Clock className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-sm">
              Statut de la boutique : {boutique.statut === 'PUBLIEE' ? '✅ En ligne & Publiée' : boutique.statut === 'EN_ATTENTE' ? '⏳ En cours de validation par un modérateur' : '🚫 Inactive / Rejetée'}
            </p>
            <p className="text-slate-300">
              {boutique.statut === 'PUBLIEE' 
                ? 'Votre boutique est visible sur la carte, la recherche et le comparateur de prix.'
                : 'Conformément au cahier des charges GLACE OS, un modérateur vérifie vos informations sous 24h.'}
            </p>
          </div>
        </div>
      )}

      {/* AJOUTER UNE OFFRE RATTACHÉE AU CATALOGUE DE RÉFÉRENCE */}
      <section className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              Publier une Offre sur le Comparateur de Prix
            </h2>
            <p className="text-xs text-slate-400">
              Règle stricte : Votre offre est automatiquement rattachée à un produit officiel du catalogue.
            </p>
          </div>
        </div>

        {offreMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{offreMsg}</span>
          </div>
        )}

        {offreError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{offreError}</span>
          </div>
        )}

        <form onSubmit={handleCreateOffre} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Produit de référence */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Produit de Référence officiel *
              </label>
              <select
                required
                value={selectedProdRefId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">-- Sélectionnez dans le catalogue --</option>
                {catalogueRef.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.sousCategorie}] {p.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Prix unitaire (FCFA / XOF / XAF) *
              </label>
              <input
                type="number"
                required
                min="100"
                placeholder="Ex: 18500"
                value={prixOffre}
                onChange={(e) => setPrixOffre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Unité */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Format / Unité vendue *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: kg, sac 25kg, boîte 1kg, litre..."
                value={uniteOffre}
                onChange={(e) => setUniteOffre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Quantité dispo */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Quantité en stock
              </label>
              <input
                type="number"
                min="1"
                placeholder="Ex: 25"
                value={quantiteOffre}
                onChange={(e) => setQuantiteOffre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Précision ou conditionnement (optionnel)
            </label>
            <input
              type="text"
              placeholder="Ex: Marque Cremodan SE 30 scellée d’origine, livraison gratuite à partir de 5 unités."
              value={descOffre}
              onChange={(e) => setDescOffre(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingOffre}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmittingOffre ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Ajouter au comparateur</span>
          </button>
        </form>
      </section>

      {/* LISTE DES OFFRES ACTIVES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-black text-white">
              Vos Offres Actives ({boutique?.offres?.length || 0})
            </h2>
          </div>
        </div>

        {boutique?.offres?.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center">
            <p className="text-xs text-slate-400">Vous n'avez pas encore publié d'offres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {boutique?.offres?.map((o: any) => (
              <div key={o.id} className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">
                    {o.produitReference?.sousCategorie}
                  </span>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{o.produitReference?.nom}</h4>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="font-extrabold text-emerald-400">{o.prix.toLocaleString('fr-FR')} {o.devise}</span>
                    <span className="text-slate-400">/ {o.unite}</span>
                    <span className="text-[10px] text-slate-500">({o.quantiteDisponible} en stock)</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteOffre(o.id)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition"
                  title="Supprimer l'offre"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PROPOSER UN NOUVEAU PRODUIT AU CATALOGUE */}
      <section className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              Votre produit n'existe pas dans le catalogue officiel ?
            </h2>
            <p className="text-xs text-slate-400">
              Soumettez une proposition pour qu'un modérateur l'ajoute au catalogue de référence.
            </p>
          </div>
        </div>

        {propMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{propMsg}</span>
          </div>
        )}

        {propError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{propError}</span>
          </div>
        )}

        <form onSubmit={handleProposeProduit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Nom du nouveau produit *</label>
              <input
                type="text"
                required
                placeholder="Ex: Poudre de Baobab Bio pour Sorbets"
                value={nomProp}
                onChange={(e) => setNomProp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Catégorie *</label>
              <select
                value={catProp}
                onChange={(e) => setCatProp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="INGREDIENT">🧪 Ingrédients</option>
                <option value="EMBALLAGE">📦 Emballages</option>
                <option value="EQUIPEMENT">⚙️ Équipements</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Sous-catégorie *</label>
              <input
                type="text"
                required
                placeholder="Ex: Ingrédients Locaux, Arômes..."
                value={sousCatProp}
                onChange={(e) => setSousCatProp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description / Usage</label>
              <input
                type="text"
                placeholder="Ex: Utilisé pour texture et parfum acidulé des sorbets."
                value={descProp}
                onChange={(e) => setDescProp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmittingProp}
            className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmittingProp ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Layers className="w-3.5 h-3.5" />
            )}
            <span>Soumettre la proposition</span>
          </button>
        </form>
      </section>

      {/* Modal Mobile Money */}
      <MobileMoneyModal
        isOpen={momoModal.isOpen}
        onClose={() => setMomoModal({ ...momoModal, isOpen: false })}
        onSuccess={() => {
          setMomoModal({ ...momoModal, isOpen: false });
          loadData();
        }}
        type={momoModal.type}
        targetId={boutique?.id || user?.id || 'target'}
        titre={momoModal.titre}
        description={momoModal.description}
        montant={momoModal.montant}
        devise="FCFA"
      />

    </div>
  );
}
