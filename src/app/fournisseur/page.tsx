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
  Pencil,
  Sliders,
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2,
  Calendar,
  DollarSign,
  HelpCircle,
  TrendingUp,
  MapPin,
  Phone,
  MessageCircle,
  X
} from 'lucide-react';
import MobileMoneyModal from '@/components/payment/MobileMoneyModal';
import ChampTelephone from '@/components/forms/ChampTelephone';
import Adresse from '@/components/marketplace/Adresse';
import { useSuggestionsVilles } from '@/lib/villes-client';
import { UserSession } from '@/types';

export default function FournisseurDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [boutique, setBoutique] = useState<any>(null);
  const [catalogueRef, setCatalogueRef] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Formulaire Modification Boutique
  const [showEditBoutiqueModal, setShowEditBoutiqueModal] = useState(false);
  const [boutiqueForm, setBoutiqueForm] = useState({
    nom: '',
    description: '',
    quartier: '',
    ville: '',
    telephone: '',
    whatsapp: '',
  });
  const [isSavingBoutique, setIsSavingBoutique] = useState(false);
  const [boutiqueMsg, setBoutiqueMsg] = useState<string | null>(null);
  const [boutiqueError, setBoutiqueError] = useState<string | null>(null);
  const villesSuggerees = useSuggestionsVilles(boutique?.pays || '');

  // Formulaire Nouvelle Offre
  const [selectedProdRefId, setSelectedProdRefId] = useState('');
  const [prixOffre, setPrixOffre] = useState('');
  const [uniteOffre, setUniteOffre] = useState('');
  const [quantiteOffre, setQuantiteOffre] = useState('10');
  const [descOffre, setDescOffre] = useState('');
  const [isSubmittingOffre, setIsSubmittingOffre] = useState(false);
  const [offreMsg, setOffreMsg] = useState<string | null>(null);
  const [offreError, setOffreError] = useState<string | null>(null);

  // Modal Modification d'une Offre
  const [editingOffre, setEditingOffre] = useState<any | null>(null);
  const [editOffreProdRefId, setEditOffreProdRefId] = useState('');
  const [editOffrePrix, setEditOffrePrix] = useState('');
  const [editOffreUnite, setEditOffreUnite] = useState('');
  const [editOffreQuantite, setEditOffreQuantite] = useState('1');
  const [editOffreDesc, setEditOffreDesc] = useState('');
  const [isSubmittingEditOffre, setIsSubmittingEditOffre] = useState(false);
  const [editOffreMsg, setEditOffreMsg] = useState<string | null>(null);
  const [editOffreError, setEditOffreError] = useState<string | null>(null);

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
      const [dataUser, dataCat, dataBoutique] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/produits-reference').then((r) => r.json()),
        fetch('/api/fournisseur/boutique').then((r) => r.json()),
      ]);

      if (!dataUser.user) {
        router.push('/login');
        return;
      }
      setUser(dataUser.user);

      if (dataCat.success) setCatalogueRef(dataCat.produits || []);

      if (dataBoutique.success && dataBoutique.boutique) {
        setBoutique(dataBoutique.boutique);
        setBoutiqueForm({
          nom: dataBoutique.boutique.nom || '',
          description: dataBoutique.boutique.description || '',
          quartier: dataBoutique.boutique.quartier || '',
          ville: dataBoutique.boutique.ville || '',
          telephone: dataBoutique.boutique.telephone || '',
          whatsapp: dataBoutique.boutique.whatsapp || '',
        });
      } else {
        // Fallback si la route dédiée ne renvoie pas encore la boutique
        const dataBoutiques = await fetch('/api/boutiques').then((r) => r.json());
        if (dataBoutiques.success) {
          const found = dataBoutiques.boutiques.find((b: any) => b.utilisateurId === dataUser.user.id);
          if (found) {
            const resDetail = await fetch(`/api/boutiques/${found.id}`);
            const dataDetail = await resDetail.json();
            if (dataDetail.success) {
              setBoutique(dataDetail.boutique);
              setBoutiqueForm({
                nom: dataDetail.boutique.nom || '',
                description: dataDetail.boutique.description || '',
                quartier: dataDetail.boutique.quartier || '',
                ville: dataDetail.boutique.ville || '',
                telephone: dataDetail.boutique.telephone || '',
                whatsapp: dataDetail.boutique.whatsapp || '',
              });
            }
          }
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

  // Enregistrer les modifications de la boutique
  const handleUpdateBoutique = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBoutique(true);
    setBoutiqueError(null);
    setBoutiqueMsg(null);

    try {
      const res = await fetch('/api/fournisseur/boutique', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boutiqueForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setBoutiqueError(data.message || 'Erreur lors de la mise à jour de la boutique.');
        setIsSavingBoutique(false);
        return;
      }

      setBoutique((prev: any) => ({ ...prev, ...data.boutique }));
      setBoutiqueMsg('Informations de la boutique mises à jour avec succès !');
      setIsSavingBoutique(false);
      setTimeout(() => {
        setShowEditBoutiqueModal(false);
        setBoutiqueMsg(null);
      }, 1500);
    } catch {
      setBoutiqueError('Erreur de connexion au serveur.');
      setIsSavingBoutique(false);
    }
  };

  // Créer une nouvelle offre
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

  // Ouvrir la modale d'édition d'une offre existante
  const openEditOffre = (offre: any) => {
    setEditingOffre(offre);
    setEditOffreProdRefId(offre.produitReferenceId || offre.produitReference?.id || '');
    setEditOffrePrix(String(offre.prix));
    setEditOffreUnite(offre.unite || '');
    setEditOffreQuantite(String(offre.quantiteDisponible ?? '1'));
    setEditOffreDesc(offre.description || '');
    setEditOffreMsg(null);
    setEditOffreError(null);
  };

  // Enregistrer les modifications d'une offre
  const handleSaveEditOffre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffre) return;

    setIsSubmittingEditOffre(true);
    setEditOffreError(null);
    setEditOffreMsg(null);

    try {
      const res = await fetch('/api/fournisseur/offre', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingOffre.id,
          produitReferenceId: editOffreProdRefId,
          prix: parseFloat(editOffrePrix),
          unite: editOffreUnite,
          quantiteDisponible: parseFloat(editOffreQuantite) || 0,
          description: editOffreDesc,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setEditOffreError(data.message || 'Erreur lors de la mise à jour de l’offre.');
        setIsSubmittingEditOffre(false);
        return;
      }

      // Mettre à jour l'offre dans l'état local
      setBoutique((prev: any) => ({
        ...prev,
        offres: prev.offres.map((o: any) => (o.id === editingOffre.id ? data.offre : o)),
      }));

      setEditOffreMsg('Offre modifiée avec succès !');
      setIsSubmittingEditOffre(false);
      setTimeout(() => {
        setEditingOffre(null);
        setEditOffreMsg(null);
      }, 1200);
    } catch {
      setEditOffreError('Erreur réseau.');
      setIsSubmittingEditOffre(false);
    }
  };

  // Supprimer une offre
  const handleDeleteOffre = async (offreId: string) => {
    if (!confirm('Voulez-vous supprimer cette offre du comparateur ?')) return;
    try {
      await fetch(`/api/fournisseur/offre?id=${offreId}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  // Proposer un nouveau produit
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
          {boutique ? (
            <div className="mt-1">
              <Adresse ville={boutique.ville} pays={boutique.pays} quartier={boutique.quartier} />
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Gérez vos offres rattachées au catalogue de référence et vos abonnements Mobile Money
            </p>
          )}
        </div>

        {/* Boutons d'action (Modifier Boutique / Badge / Abonnement) */}
        <div className="flex flex-wrap items-center gap-2">
          {boutique && (
            <button
              onClick={() => {
                setBoutiqueForm({
                  nom: boutique.nom || '',
                  description: boutique.description || '',
                  quartier: boutique.quartier || '',
                  ville: boutique.ville || '',
                  telephone: boutique.telephone || '',
                  whatsapp: boutique.whatsapp || '',
                });
                setShowEditBoutiqueModal(true);
              }}
              className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Modifier ma Boutique</span>
            </button>
          )}

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
              <span>Badge Certifié (15 000 FCFA)</span>
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

      {/* FICHE BOUTIQUE SUMMARY */}
      {boutique && (
        <div className="glass-card rounded-3xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400 shrink-0" />
              <h3 className="text-sm font-black text-white">{boutique.nom}</h3>
              {boutique.ville && (
                <span className="text-[11px] font-bold text-slate-400">• {boutique.ville}, {boutique.pays}</span>
              )}
            </div>
            <p className="text-xs text-slate-300 line-clamp-2">
              {boutique.description || 'Aucune description commerciale renseignée.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {boutique.quartier || 'Quartier non renseigné'}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {boutique.telephone}
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                WhatsApp : {boutique.whatsapp}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setBoutiqueForm({
                nom: boutique.nom || '',
                description: boutique.description || '',
                quartier: boutique.quartier || '',
                ville: boutique.ville || '',
                telephone: boutique.telephone || '',
                whatsapp: boutique.whatsapp || '',
              });
              setShowEditBoutiqueModal(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-2 shrink-0 self-start sm:self-center"
          >
            <Pencil className="w-3.5 h-3.5 text-amber-400" />
            <span>Modifier les coordonnées</span>
          </button>
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
              <div key={o.id} className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block truncate">
                    {o.produitReference?.sousCategorie}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">{o.produitReference?.nom}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
                    <span className="font-extrabold text-emerald-400">{o.prix?.toLocaleString('fr-FR')} {o.devise || 'XOF'}</span>
                    <span className="text-slate-400">/ {o.unite}</span>
                    <span className="text-[10px] text-slate-500">({o.quantiteDisponible} en stock)</span>
                  </div>
                  {o.description && (
                    <p className="text-[11px] text-slate-400 mt-1 truncate" title={o.description}>
                      {o.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEditOffre(o)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 transition"
                    title="Modifier l'offre (prix, unité, stock...)"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteOffre(o.id)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition"
                    title="Supprimer l'offre"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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

      {/* MODAL MODIFIER BOUTIQUE */}
      {showEditBoutiqueModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-xl w-full rounded-3xl p-6 border border-slate-700 bg-slate-900 shadow-2xl relative my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowEditBoutiqueModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">
                  Modifier les informations de la boutique
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Mettez à jour votre nom commercial, description et coordonnées pour vos clients.
              </p>
            </div>

            {boutiqueMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{boutiqueMsg}</span>
              </div>
            )}

            {boutiqueError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{boutiqueError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateBoutique} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Nom commercial de la boutique *
                </label>
                <input
                  type="text"
                  required
                  value={boutiqueForm.nom}
                  onChange={(e) => setBoutiqueForm({ ...boutiqueForm, nom: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Ex: Ivoire Ingrédients Glaces"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Description de la boutique *
                </label>
                <textarea
                  required
                  rows={3}
                  value={boutiqueForm.description}
                  onChange={(e) => setBoutiqueForm({ ...boutiqueForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                  placeholder="Présentez vos produits, vos spécialités et vos conditions de livraison..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    list="suggestions-villes-boutique"
                    value={boutiqueForm.ville}
                    onChange={(e) => setBoutiqueForm({ ...boutiqueForm, ville: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="Ex: Abidjan, Douala..."
                  />
                  <datalist id="suggestions-villes-boutique">
                    {villesSuggerees.map((v) => (
                      <option key={v} value={v} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Quartier / Adresse *
                  </label>
                  <input
                    type="text"
                    required
                    value={boutiqueForm.quartier}
                    onChange={(e) => setBoutiqueForm({ ...boutiqueForm, quartier: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="Ex: Zone 4, Rue des Glaciers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ChampTelephone
                  label="Téléphone d'appel commercial"
                  valeur={boutiqueForm.telephone}
                  onChange={(val) => setBoutiqueForm({ ...boutiqueForm, telephone: val })}
                  paysParDefaut={boutique?.pays}
                  requis
                />

                <ChampTelephone
                  label="Numéro WhatsApp commercial"
                  valeur={boutiqueForm.whatsapp}
                  onChange={(val) => setBoutiqueForm({ ...boutiqueForm, whatsapp: val })}
                  paysParDefaut={boutique?.pays}
                  requis
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditBoutiqueModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingBoutique}
                  className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingBoutique ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Enregistrer les coordonnées</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER UNE OFFRE */}
      {editingOffre && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full rounded-3xl p-6 border border-slate-700 bg-slate-900 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingOffre(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">
                  Modifier l'offre
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Modifiez le produit officiel associé, le prix, le format ou la quantité en stock.
              </p>
            </div>

            {editOffreMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{editOffreMsg}</span>
              </div>
            )}

            {editOffreError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editOffreError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditOffre} className="space-y-4">
              {/* Choix du produit de référence officiel */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Produit de Référence officiel *
                </label>
                <select
                  required
                  value={editOffreProdRefId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setEditOffreProdRefId(newId);
                    const prod = catalogueRef.find((p) => p.id === newId);
                    if (prod && prod.unitesAutorisees) {
                      const firstUnit = prod.unitesAutorisees.split(',')[0].trim();
                      if (!editOffreUnite) setEditOffreUnite(firstUnit);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Sélectionnez dans le catalogue officiel --</option>
                  {catalogueRef.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.sousCategorie}] {p.nom}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Vous pouvez réassigner cette offre à un autre produit de référence officiel si nécessaire.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Prix unitaire ({editingOffre.devise || 'FCFA'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editOffrePrix}
                    onChange={(e) => setEditOffrePrix(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Format / Unité vendue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: kg, sac 25kg, litre..."
                    value={editOffreUnite}
                    onChange={(e) => setEditOffreUnite(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Quantité en stock disponible *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editOffreQuantite}
                  onChange={(e) => setEditOffreQuantite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Précision ou conditionnement (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Marque d'origine, livraison gratuite à partir de 5 sacs..."
                  value={editOffreDesc}
                  onChange={(e) => setEditOffreDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOffre(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEditOffre}
                  className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingEditOffre ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Enregistrer les modifications</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
