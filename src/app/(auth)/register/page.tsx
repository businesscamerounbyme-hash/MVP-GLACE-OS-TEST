'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, User, Store, Mail, Phone, Lock, MapPin, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { VILLES_AFRIQUE } from '@/lib/geo';

export default function RegisterPage() {
  const [role, setRole] = useState<'MEMBER' | 'SUPPLIER'>('MEMBER');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [pays, setPays] = useState("Côte d'Ivoire");
  const [ville, setVille] = useState('Abidjan');
  
  // Champs spécifiques fournisseur
  const [nomBoutique, setNomBoutique] = useState('');
  const [descriptionBoutique, setDescriptionBoutique] = useState('');
  const [quartierBoutique, setQuartierBoutique] = useState('');
  const [whatsappBoutique, setWhatsappBoutique] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCountryChange = (selectedCountry: string) => {
    setPays(selectedCountry);
    const firstCity = VILLES_AFRIQUE.find(v => v.pays === selectedCountry);
    if (firstCity) setVille(firstCity.nom);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom,
          email,
          telephone,
          motDePasse,
          pays,
          ville,
          role,
          nomBoutique,
          descriptionBoutique,
          quartierBoutique,
          whatsappBoutique
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Erreur lors de l’inscription.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(data.message);
      setIsLoading(false);

      setTimeout(() => {
        // Navigation complète et non `router.push` : la barre de navigation est un
        // composant client du layout, qui ne lit la session qu'à son montage. Une
        // navigation interne ne la remonte pas, et `router.refresh()` ne rejoue que
        // les composants serveur — l'utilisateur restait donc affiché comme déconnecté
        // jusqu'à ce qu'il recharge la page à la main.
        window.location.assign(role === 'SUPPLIER' ? '/fournisseur' : '/');
      }, 1500);

    } catch (err: any) {
      setError('Erreur technique lors de l’inscription.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Rejoindre GLACE OS</h1>
        <p className="text-xs text-slate-400">
          Choisissez votre profil pour démarrer sur la marketplace
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole('MEMBER')}
          className={`p-4 rounded-3xl border text-left transition flex flex-col justify-between ${
            role === 'MEMBER'
              ? 'border-amber-500 bg-amber-500/10 text-white shadow-xl shadow-amber-500/10'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🍦</span>
            {role === 'MEMBER' && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
          </div>
          <div>
            <span className="font-extrabold text-sm block text-white">Artisan Glacier</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Compte gratuit pour chercher stabilisants, arômes et machines.
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('SUPPLIER')}
          className={`p-4 rounded-3xl border text-left transition flex flex-col justify-between ${
            role === 'SUPPLIER'
              ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-xl shadow-emerald-500/10'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🏪</span>
            {role === 'SUPPLIER' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          </div>
          <div>
            <span className="font-extrabold text-sm block text-white">Fournisseur Local</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Publiez votre boutique et vos offres d'ingrédients ou matériel.
            </span>
          </div>
        </button>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Nom complet ou Entreprise</label>
            <input
              type="text"
              required
              placeholder="Ex: Aïcha Diallo"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              required
              placeholder="contact@glacier.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Téléphone / WhatsApp</label>
            <input
              type="tel"
              required
              placeholder="+225 07 12 34 56 78"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Mot de passe</label>
            <input
              type="password"
              required
              placeholder="Minimum 6 caractères"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Localisation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Pays</label>
            <select
              value={pays}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Côte d'Ivoire">Côte d'Ivoire</option>
              <option value="Sénégal">Sénégal</option>
              <option value="Cameroun">Cameroun</option>
              <option value="Bénin">Bénin</option>
              <option value="Togo">Togo</option>
              <option value="Burkina Faso">Burkina Faso</option>
              <option value="Mali">Mali</option>
              <option value="Guinée">Guinée</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Ville</label>
            <input
              type="text"
              required
              placeholder="Ex: Abidjan, Dakar..."
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Champs spécifiques Fournisseur */}
        {role === 'SUPPLIER' && (
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                Informations de votre Boutique Fournisseur
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Nom commercial de la boutique</label>
              <input
                type="text"
                required={role === 'SUPPLIER'}
                placeholder="Ex: AfriGlaces Distribution"
                value={nomBoutique}
                onChange={(e) => setNomBoutique(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Quartier / Zone</label>
                <input
                  type="text"
                  placeholder="Ex: Treichville Zone 3, Almadies..."
                  value={quartierBoutique}
                  onChange={(e) => setQuartierBoutique(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Numéro WhatsApp direct</label>
                <input
                  type="tel"
                  placeholder="+2250712345678"
                  value={whatsappBoutique}
                  onChange={(e) => setWhatsappBoutique(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Description de vos spécialités</label>
              <textarea
                rows={2}
                placeholder="Ex: Distributeur officiel de stabilisants Cremodan, arômes vanille et machines professionnelles."
                value={descriptionBoutique}
                onChange={(e) => setDescriptionBoutique(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <p className="text-[11px] text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              ℹ️ Conformément aux règles de sécurité GLACE OS, votre boutique sera soumise à validation par un modérateur avant publication sur la marketplace.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Création du compte en cours...</span>
            </>
          ) : (
            <>
              <span>Finaliser l'inscription</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Déjà inscrit ?{' '}
            <Link href="/login" className="font-bold text-amber-400 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </form>

    </div>
  );
}
