import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { VILLES_AFRIQUE } from '@/lib/geo';
import { estEmailValide, verifierMotDePasse } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      nom, 
      prenom,
      email, 
      telephone, 
      motDePasse, 
      pays, 
      ville, 
      role, // 'MEMBER' ou 'SUPPLIER'
      // Données de boutique si fournisseur
      nomBoutique,
      descriptionBoutique,
      quartierBoutique,
      telephoneBoutique,
      whatsappBoutique,
      latitude,
      longitude
    } = body;

    if (!nom || !email || !telephone || !motDePasse || !pays || !ville) {
      return NextResponse.json(
        { success: false, message: 'Veuillez remplir tous les champs obligatoires.' },
        { status: 400 }
      );
    }

    if (!estEmailValide(email)) {
      return NextResponse.json(
        { success: false, message: 'Adresse email invalide.' },
        { status: 400 }
      );
    }

    const verif = verifierMotDePasse(motDePasse);
    if (!verif.ok) {
      return NextResponse.json({ success: false, message: verif.message }, { status: 400 });
    }

    const existingUser = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      // Message volontairement neutre : confirmer l'existence d'un compte permettrait
      // d'énumérer les adresses inscrites avant de s'attaquer à leurs mots de passe.
      return NextResponse.json(
        {
          success: false,
          message:
            'Inscription impossible avec ces informations. Si vous avez déjà un compte, connectez-vous.',
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(motDePasse);

    // Déterminer les coordonnées par défaut de la ville si non fournies
    let lat = latitude ? parseFloat(latitude) : 5.359952;
    let lon = longitude ? parseFloat(longitude) : -4.008256;
    const villeInfo = VILLES_AFRIQUE.find(v => v.nom.toLowerCase() === ville.toLowerCase());
    if (villeInfo && (!latitude || !longitude)) {
      lat = villeInfo.latitude;
      lon = villeInfo.longitude;
    }

    const user = await prisma.utilisateur.create({
      data: {
        nom: nom.trim(),
        prenom: typeof prenom === "string" && prenom.trim() ? prenom.trim() : null,
        email: email.toLowerCase().trim(),
        telephone: telephone.trim(),
        motDePasse: hashedPassword,
        pays,
        ville,
        role: role === 'SUPPLIER' ? 'SUPPLIER' : 'MEMBER'
      }
    });

    let boutique = null;
    if (role === 'SUPPLIER') {
      boutique = await prisma.boutique.create({
        data: {
          utilisateurId: user.id,
          nom: nomBoutique ? nomBoutique.trim() : `Boutique de ${nom}`,
          description: descriptionBoutique ? descriptionBoutique.trim() : 'Fournisseur d’ingrédients et équipements pour glaciers.',
          pays,
          ville,
          quartier: quartierBoutique ? quartierBoutique.trim() : 'Centre-ville',
          latitude: lat,
          longitude: lon,
          telephone: telephoneBoutique || telephone,
          whatsapp: whatsappBoutique || telephone,
          statut: 'EN_ATTENTE', // RÈGLE STRICTE DU CAHIER DES CHARGES : TOUJOURS EN ATTENTE
          badgeCertifie: false
        }
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const cookieStore = await cookies();
    cookieStore.set('glace_session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        pays: user.pays,
        ville: user.ville,
        hasActiveMembership: false,
        boutiqueId: boutique?.id
      },
      message: role === 'SUPPLIER' 
        ? 'Inscription réussie ! Votre boutique a été créée et est en attente de validation par un modérateur.'
        : 'Bienvenue sur GLACE OS ! Votre compte membre gratuit est créé.'
    });

  } catch (error: any) {
    console.error('Erreur inscription:', error);
    return NextResponse.json(
      // Pas de error.message : cela exposerait la structure interne (contraintes
      // Prisma, noms de colonnes) a un appelant anonyme.
      { success: false, message: 'Erreur lors de l’inscription.' },
      { status: 500 }
    );
  }
}
