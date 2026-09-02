const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Nettoyage de la base de données ---');
  await prisma.journalModeration.deleteMany();
  await prisma.demandeBadge.deleteMany();
  await prisma.abonnementMembre.deleteMany();
  await prisma.abonnementFournisseur.deleteMany();
  await prisma.avis.deleteMany();
  await prisma.offre.deleteMany();
  await prisma.propositionProduit.deleteMany();
  await prisma.produitReference.deleteMany();
  await prisma.boutique.deleteMany();
  await prisma.utilisateur.deleteMany();

  console.log('--- Création des utilisateurs de référence ---');
  // Mot de passe admin fourni par l'environnement : le compte est exposé publiquement
  // une fois le site déployé, donc aucune valeur par défaut n'est codée ici.
  if (!process.env.SEED_ADMIN_PASSWORD) {
    throw new Error('SEED_ADMIN_PASSWORD est requis pour créer le compte administrateur.');
  }
  const hashedAdminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
  // Meme raison que pour l admin : ces comptes existent sur un site public, et des
  // mots de passe ecrits ici seraient lisibles par quiconque ouvre le depot.
  if (!process.env.SEED_DEMO_PASSWORD) {
    throw new Error('SEED_DEMO_PASSWORD est requis pour creer les comptes de demonstration.');
  }
  const hashedDemo = await bcrypt.hash(process.env.SEED_DEMO_PASSWORD, 10);
  const hashedModoPassword = hashedDemo;
  const hashedSupplierPassword = hashedDemo;
  const hashedMemberPassword = hashedDemo;

  // 1. Super Admin
  const admin = await prisma.utilisateur.create({
    data: {
      nom: 'Alexandre (Admin GLACE OS)',
      email: 'admin@glace-os.com',
      telephone: '+225 07 00 00 00 01',
      motDePasse: hashedAdminPassword,
      pays: "Côte d'Ivoire",
      ville: 'Abidjan',
      role: 'ADMIN',
    },
  });

  // 2. Modérateur
  const moderateur = await prisma.utilisateur.create({
    data: {
      nom: 'Moussa Diop (Modérateur Sénégal)',
      email: 'moderateur@glace-os.com',
      telephone: '+221 77 000 00 02',
      motDePasse: hashedModoPassword,
      pays: 'Sénégal',
      ville: 'Dakar',
      role: 'MODERATOR',
    },
  });

  // 3. Fournisseur 1 - Abidjan (Vérifié & Actif)
  const supplierAbidjan = await prisma.utilisateur.create({
    data: {
      nom: 'Kouassi Yao (AfriGlaces)',
      email: 'fournisseur.abidjan@cremodan-africa.com',
      telephone: '+225 07 12 34 56 78',
      motDePasse: hashedSupplierPassword,
      pays: "Côte d'Ivoire",
      ville: 'Abidjan',
      role: 'SUPPLIER',
    },
  });

  // 4. Fournisseur 2 - Dakar (Vérifié & Actif)
  const supplierDakar = await prisma.utilisateur.create({
    data: {
      nom: 'Fatou Ndiaye (Dakar Ingrédients)',
      email: 'fournisseur.dakar@sn-emballages.com',
      telephone: '+221 77 654 32 10',
      motDePasse: hashedSupplierPassword,
      pays: 'Sénégal',
      ville: 'Dakar',
      role: 'SUPPLIER',
    },
  });

  // 5. Fournisseur 3 - Douala (Vérifié & Actif)
  const supplierDouala = await prisma.utilisateur.create({
    data: {
      nom: 'Samuel Eto (Douala Glace Équip)',
      email: 'fournisseur.douala@glace-equip.cm',
      telephone: '+237 699 88 77 66',
      motDePasse: hashedSupplierPassword,
      pays: 'Cameroun',
      ville: 'Douala',
      role: 'SUPPLIER',
    },
  });

  // 6. Fournisseur 4 - Cotonou (En attente de validation)
  const supplierCotonou = await prisma.utilisateur.create({
    data: {
      nom: 'Jean-Baptiste Dossou',
      email: 'fournisseur.attente@glacier-benin.com',
      telephone: '+229 97 11 22 33',
      motDePasse: hashedSupplierPassword,
      pays: 'Bénin',
      ville: 'Cotonou',
      role: 'SUPPLIER',
    },
  });

  // 7. Membre Glacier Payant (Abonné actif)
  const membreActif = await prisma.utilisateur.create({
    data: {
      nom: 'Aïcha Diallo (Glacier Le Délice Dakar)',
      email: 'membre.actif@glacier-dakar.com',
      telephone: '+221 78 111 22 33',
      motDePasse: hashedMemberPassword,
      pays: 'Sénégal',
      ville: 'Dakar',
      role: 'MEMBER',
    },
  });

  // 8. Membre Glacier Gratuit (Non abonné)
  const membreGratuit = await prisma.utilisateur.create({
    data: {
      nom: 'Didier Bamba (Glacier Ivoirien)',
      email: 'membre.gratuit@glacier-abidjan.com',
      telephone: '+225 05 99 88 77 66',
      motDePasse: hashedMemberPassword,
      pays: "Côte d'Ivoire",
      ville: 'Abidjan',
      role: 'MEMBER',
    },
  });

  console.log('--- Création des Boutiques ---');
  // Boutique 1 : Abidjan
  const boutiqueAbidjan = await prisma.boutique.create({
    data: {
      utilisateurId: supplierAbidjan.id,
      nom: 'AfriGlaces Distribution Abidjan',
      description: 'Leader en Côte d’Ivoire dans la distribution directe de stabilisants Cremodan, arômes naturels et matières premières pour artisans glaciers.',
      pays: "Côte d'Ivoire",
      ville: 'Abidjan',
      quartier: 'Treichville Zone 3',
      latitude: 5.3095,
      longitude: -4.0042,
      telephone: '+225 07 12 34 56 78',
      whatsapp: '+2250712345678',
      statut: 'PUBLIEE',
      badgeCertifie: true,
      noteMoyenne: 4.8,
      dateValidation: new Date(),
    },
  });

  // Boutique 2 : Dakar
  const boutiqueDakar = await prisma.boutique.create({
    data: {
      utilisateurId: supplierDakar.id,
      nom: 'Dakar Ingrédients & Packs Pro',
      description: 'Fournisseur agréé d’ingrédients de glacerie italienne et française au Sénégal. Emballages biodégradables et cuillères écologiques.',
      pays: 'Sénégal',
      ville: 'Dakar',
      quartier: 'Almadies',
      latitude: 14.7431,
      longitude: -17.5189,
      telephone: '+221 77 654 32 10',
      whatsapp: '+221776543210',
      statut: 'PUBLIEE',
      badgeCertifie: true,
      noteMoyenne: 4.9,
      dateValidation: new Date(),
    },
  });

  // Boutique 3 : Douala
  const boutiqueDouala = await prisma.boutique.create({
    data: {
      utilisateurId: supplierDouala.id,
      nom: 'Douala Glace & Équipements',
      description: 'Matériel professionnel de glacerie au Cameroun : turbines, pasteurisateurs, bacs inox et stabilisants haut de gamme.',
      pays: 'Cameroun',
      ville: 'Douala',
      quartier: 'Akwa',
      latitude: 4.0532,
      longitude: 9.7012,
      telephone: '+237 699 88 77 66',
      whatsapp: '+237699887766',
      statut: 'PUBLIEE',
      badgeCertifie: true,
      noteMoyenne: 4.7,
      dateValidation: new Date(),
    },
  });

  // Boutique 4 : Cotonou (En Attente)
  const boutiqueCotonou = await prisma.boutique.create({
    data: {
      utilisateurId: supplierCotonou.id,
      nom: 'Bénin Glaces & Arômes Gourmands',
      description: 'Nouvelle boutique spécialisée dans la vanille de Madagascar et les purées de fruits locaux pour glaces.',
      pays: 'Bénin',
      ville: 'Cotonou',
      quartier: 'Haie Vive',
      latitude: 6.3582,
      longitude: 2.3983,
      telephone: '+229 97 11 22 33',
      whatsapp: '+22997112233',
      statut: 'EN_ATTENTE',
      badgeCertifie: false,
      noteMoyenne: 0.0,
    },
  });

  console.log('--- Création des Abonnements et Badges ---');
  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);

  // Abonnements Fournisseurs
  await prisma.abonnementFournisseur.create({
    data: {
      boutiqueId: boutiqueAbidjan.id,
      statut: 'ACTIF',
      dateDebut: now,
      dateFin: nextMonth,
      montant: 10000,
      devise: 'XOF',
      referenceMobileMoney: 'OM-2026-ABJ-001',
      operateur: 'ORANGE_MONEY',
    },
  });

  await prisma.abonnementFournisseur.create({
    data: {
      boutiqueId: boutiqueDakar.id,
      statut: 'ACTIF',
      dateDebut: now,
      dateFin: nextMonth,
      montant: 10000,
      devise: 'XOF',
      referenceMobileMoney: 'WAVE-2026-DKR-002',
      operateur: 'WAVE',
    },
  });

  await prisma.abonnementFournisseur.create({
    data: {
      boutiqueId: boutiqueDouala.id,
      statut: 'ACTIF',
      dateDebut: now,
      dateFin: nextMonth,
      montant: 10000,
      devise: 'XAF',
      referenceMobileMoney: 'MTN-2026-DLA-003',
      operateur: 'MTN_MOMO',
    },
  });

  // Abonnement Membre Actif
  await prisma.abonnementMembre.create({
    data: {
      utilisateurId: membreActif.id,
      statut: 'ACTIF',
      dateDebut: now,
      dateFin: nextMonth,
      montant: 2000,
      devise: 'XOF',
      referenceMobileMoney: 'OM-2026-MEM-001',
      operateur: 'ORANGE_MONEY',
    },
  });

  console.log('--- Création du Catalogue de Produits de Référence ---');
  // INGREDIENTS
  const p1 = await prisma.produitReference.create({
    data: {
      nom: 'Stabilisant Glaces & Crèmes Glacées (SE 30 / Cremodan)',
      categorie: 'INGREDIENT',
      sousCategorie: 'Stabilisants',
      unitesAutorisees: 'kg, sac 25kg, boîte 1kg',
      description: 'Stabilisant haut de gamme pour crèmes glacées. Améliore l’onctuosité, retarde la fonte et empêche la formation de cristaux de glace.',
      image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&q=80',
      creePar: admin.id,
    },
  });

  const p2 = await prisma.produitReference.create({
    data: {
      nom: 'Stabilisant Sorbets & Glaces aux Fruits (Cremodan Sorbex)',
      categorie: 'INGREDIENT',
      sousCategorie: 'Stabilisants',
      unitesAutorisees: 'kg, pot 1kg, sac 25kg',
      description: 'Formulé spécifiquement pour les sorbets aux fruits tropicaux et glaces à l’eau. Assure une texture lisse et soyeuse sans altérer le goût.',
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
      creePar: admin.id,
    },
  });

  const p3 = await prisma.produitReference.create({
    data: {
      nom: 'Émulsifiant Alimentaire Glacerie E471 Pro',
      categorie: 'INGREDIENT',
      sousCategorie: 'Émulsifiants',
      unitesAutorisees: 'kg, boîte 1kg, sac 20kg',
      description: 'Mono et diglycérides d’acides gras pour foisonnement optimal et stabilité thermique de vos mix à glace.',
      image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&q=80',
      creePar: admin.id,
    },
  });

  const p4 = await prisma.produitReference.create({
    data: {
      nom: 'Extrait Pur Vanille Bourbon de Madagascar',
      categorie: 'INGREDIENT',
      sousCategorie: 'Arômes & Extraits',
      unitesAutorisees: 'litre, bouteille 1L, bidon 5L',
      description: 'Extrait concentré de vanille bourbon 300g/litre avec grains naturels. Parfum puissant et rond en bouche.',
      image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400&q=80',
      creePar: admin.id,
    },
  });

  const p5 = await prisma.produitReference.create({
    data: {
      nom: 'Pâte de Pistache Pure 100% sans colorant',
      categorie: 'INGREDIENT',
      sousCategorie: 'Pâtes Aromatisantes',
      unitesAutorisees: 'kg, pot 1kg, seau 5kg',
      description: 'Pâte de pistache premium finement broyée, idéale pour confectionner la glace pistache signature.',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
      creePar: admin.id,
    },
  });

  const p6 = await prisma.produitReference.create({
    data: {
      nom: 'Lait Écrémé en Poudre 0% MG Qualité Glacerie',
      categorie: 'INGREDIENT',
      sousCategorie: 'Poudres de Lait',
      unitesAutorisees: 'kg, sac 25kg',
      description: 'Poudre de lait spray d’excellence pour équilibrer l’extrait sec dégraissé (ESDG) de vos mix.',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
      creePar: admin.id,
    },
  });

  const p7 = await prisma.produitReference.create({
    data: {
      nom: 'Dextrose Monohydraté Glacerie (PAC élevé)',
      categorie: 'INGREDIENT',
      sousCategorie: 'Sucres & Texturants',
      unitesAutorisees: 'kg, sac 25kg',
      description: 'Sucre simple à fort pouvoir anti-congélateur (PAC 190) pour abaisser le point de congélation et éviter une glace trop dure.',
      image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&q=80',
      creePar: admin.id,
    },
  });

  // EMBALLAGES
  const p8 = await prisma.produitReference.create({
    data: {
      nom: 'Pots à Glace Kraft Isothermes 100ml',
      categorie: 'EMBALLAGE',
      sousCategorie: 'Pots & Bacs',
      unitesAutorisees: 'carton 500pcs, carton 1000pcs, paquet 50pcs',
      description: 'Pots en carton recyclable avec barrière anti-humidité renforcée, idéal pour la vente à emporter.',
      image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80',
      creePar: admin.id,
    },
  });

  const p9 = await prisma.produitReference.create({
    data: {
      nom: 'Pots à Glace Carton 250ml Personnalisables',
      categorie: 'EMBALLAGE',
      sousCategorie: 'Pots & Bacs',
      unitesAutorisees: 'carton 500pcs, carton 1000pcs',
      description: 'Pots 250ml format double boule avec couvercle dôme transparent disponible.',
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&q=80',
      creePar: admin.id,
    },
  });

  const p10 = await prisma.produitReference.create({
    data: {
      nom: 'Cuillères à Glace Écologiques en Bois 95mm',
      categorie: 'EMBALLAGE',
      sousCategorie: 'Cuillères & Accessoires',
      unitesAutorisees: 'carton 1000pcs, sachet 100pcs',
      description: 'Cuillères jetables biodégradables 100% bouleau poli, zéro goût résiduel.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
      creePar: admin.id,
    },
  });

  // EQUIPEMENTS
  const p11 = await prisma.produitReference.create({
    data: {
      nom: 'Turbine à Glace Professionnelle de Table 4L/h',
      categorie: 'EQUIPEMENT',
      sousCategorie: 'Turbines & Sorbetières',
      unitesAutorisees: 'pièce',
      description: 'Turbine automatique avec groupe frigorifique autonome. Idéale pour laboratoires artisanaux et petites productions.',
      image: 'https://images.unsplash.com/photo-1520690214107-7377bddc7cac?w=400&q=80',
      creePar: admin.id,
    },
  });

  const p12 = await prisma.produitReference.create({
    data: {
      nom: 'Réfractomètre Numérique Sucres 0-85% Brix',
      categorie: 'EQUIPEMENT',
      sousCategorie: 'Instruments de Mesure',
      unitesAutorisees: 'pièce',
      description: 'Mesure précise du taux de sucre de vos mix à glace et sirops pour un équilibrage parfait de recette.',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80',
      creePar: admin.id,
    },
  });

  console.log('--- Création des Offres pour le Comparateur de Prix ---');
  // Offres pour Stabilisant SE 30 (Comparaison de prix entre Abidjan, Dakar et Douala)
  await prisma.offre.create({
    data: {
      boutiqueId: boutiqueAbidjan.id,
      produitReferenceId: p1.id,
      prix: 18500,
      devise: 'XOF',
      unite: 'kg',
      quantiteDisponible: 45,
      description: 'Stabilisant Cremodan SE 30 en boîte de 1kg scellée d’origine.',
    },
  });

  await prisma.offre.create({
    data: {
      boutiqueId: boutiqueDakar.id,
      produitReferenceId: p1.id,
      prix: 17500,
      devise: 'XOF',
      unite: 'kg',
      quantiteDisponible: 80,
      description: 'Super Neutrose / Cremodan import direct UE. Frais et garanti.',
    },
  });

  await prisma.offre.create({
    data: {
      boutiqueId: boutiqueDouala.id,
      produitReferenceId: p1.id,
      prix: 19000,
      devise: 'XAF',
      unite: 'kg',
      quantiteDisponible: 30,
      description: 'Stabilisant disponible en stock à Douala Akwa.',
    },
  });

  await prisma.offre.create({
    data: {
      boutiqueId: boutiqueAbidjan.id,
      produitReferenceId: p1.id,
      prix: 390000,
      devise: 'XOF',
      unite: 'sac 25kg',
      quantiteDisponible: 10,
      description: 'Sac pro 25kg économique pour gros volumes de production.',
    },
  });

  // Offres pour Vanille Bourbon
  await prisma.offre.create({
    data: {
      boutiqueId: boutiqueAbidjan.id,
      produitReferenceId: p4.id,
      prix: 32000,
      devise: 'XOF',
      unite: 'litre',
      quantiteDisponible: 25,
      description: 'Bouteille 1L extrait pur vanille Bourbon Madagascar.',
    },
  });

  await prisma.offre.create({
    data: {
      boutiqueId: boutiqueDakar.id,
      produitReferenceId: p4.id,
      prix: 29500,
      devise: 'XOF',
      unite: 'litre',
      quantiteDisponible: 15,
      description: 'Extrait concentré avec grains de vanille visibles.',
    },
  });

  // Offres pour Pâte de Pistache
  await prisma.offre.create({
    data: {
      boutiqueId: boutiqueAbidjan.id,
      produitReferenceId: p5.id,
      prix: 24000,
      devise: 'XOF',
      unite: 'kg',
      quantiteDisponible: 20,
      description: 'Pâte de pistache 100% pure grillée.',
    },
  });

  // Offres pour Pots 100ml
  await prisma.offre.create({
    data: {
      boutiqueId: boutiqueDakar.id,
      produitReferenceId: p8.id,
      prix: 28000,
      devise: 'XOF',
      unite: 'carton 1000pcs',
      quantiteDisponible: 50,
      description: 'Carton complet de 1000 pots kraft 100ml.',
    },
  });

  await prisma.offre.create({
    data: {
      boutiqueId: boutiqueAbidjan.id,
      produitReferenceId: p8.id,
      prix: 29500,
      devise: 'XOF',
      unite: 'carton 1000pcs',
      quantiteDisponible: 40,
      description: 'Pots kraft haute résistance.',
    },
  });

  // Offre Turbine
  await prisma.offre.create({
    data: {
      boutiqueId: boutiqueDouala.id,
      produitReferenceId: p11.id,
      prix: 1450000,
      devise: 'XAF',
      unite: 'pièce',
      quantiteDisponible: 2,
      description: 'Turbine 4L/h neuve sous garantie 1 an avec formation offerte.',
    },
  });

  console.log('--- Création des Avis Clients & Propositions de Produits ---');
  // Avis validé 1
  await prisma.avis.create({
    data: {
      boutiqueId: boutiqueAbidjan.id,
      utilisateurId: membreActif.id,
      note: 5,
      commentaire: 'Excellente qualité de stabilisant SE 30 ! Livraison rapide à Treichville, mes crèmes glacées ont une texture parfaite sans cristaux.',
      statut: 'PUBLIE',
    },
  });

  // Avis validé 2
  await prisma.avis.create({
    data: {
      boutiqueId: boutiqueDakar.id,
      utilisateurId: membreActif.id,
      note: 5,
      commentaire: 'Très sérieux et réactif sur WhatsApp. La vanille bourbon est incroyable ! Je recommande aux glaciers de Dakar.',
      statut: 'PUBLIE',
    },
  });

  // Avis en attente de modération (pour tester le dashboard modérateur)
  await prisma.avis.create({
    data: {
      boutiqueId: boutiqueDouala.id,
      utilisateurId: membreGratuit.id,
      note: 4,
      commentaire: 'Bonne machine, bien reçue à Douala.',
      statut: 'EN_ATTENTE',
    },
  });

  // Proposition de nouveau produit par un fournisseur (en attente de modération)
  await prisma.propositionProduit.create({
    data: {
      boutiqueId: boutiqueAbidjan.id,
      nom: 'Poudre de Baobab Bio (Pain de Singe) pour Sorbets',
      categorie: 'INGREDIENT',
      sousCategorie: 'Ingrédients Locaux',
      description: 'Poudre de pulpe de baobab 100% naturelle très demandée pour les sorbets artisanaux africains.',
      statut: 'EN_ATTENTE',
    },
  });

  // Journal de modération initial
  await prisma.journalModeration.create({
    data: {
      cibleId: boutiqueAbidjan.id,
      typeCible: 'BOUTIQUE',
      moderateurId: admin.id,
      action: 'APPROUVER',
      motif: 'Boutique vérifiée avec registre de commerce et coordonnées validées.',
    },
  });

  console.log('--- SEED GLACE OS TERMINÉ AVEC SUCCÈS ! ---');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
