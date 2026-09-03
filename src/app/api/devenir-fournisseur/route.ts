import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, generateToken } from '@/lib/auth';
import { requireUser, authErrorResponse } from '@/lib/guard';
import { paysParNom } from '@/lib/pays';

/**
 * Conversion d'un membre en fournisseur.
 *
 * Réservée au rôle MEMBER : convertir un administrateur ou un modérateur lui ferait
 * perdre ses droits sans qu'il l'ait demandé, et un fournisseur a déjà une boutique.
 */
export async function POST(request: Request) {
  try {
    const user = requireUser(await getCurrentUser());

    if (user.role !== 'MEMBER') {
      return NextResponse.json(
        {
          success: false,
          message:
            user.role === 'SUPPLIER'
              ? 'Vous êtes déjà fournisseur.'
              : 'Ce compte ne peut pas être converti en compte fournisseur.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const nomBoutique = String(body.nomBoutique ?? '').trim();
    const pays = String(body.pays ?? '').trim();
    const ville = String(body.ville ?? '').trim();

    if (!nomBoutique || !pays || !ville) {
      return NextResponse.json(
        { success: false, message: 'Nom de la boutique, pays et ville sont obligatoires.' },
        { status: 400 }
      );
    }

    // Même règle qu'à l'inscription : on ne s'installe que sur un marché ouvert. Le
    // contrôle est ici et pas seulement dans le formulaire, qui se contourne.
    const paysCible = paysParNom(pays);
    if (!paysCible) {
      return NextResponse.json({ success: false, message: 'Pays non reconnu.' }, { status: 400 });
    }

    const marche = await prisma.marchePays.findUnique({ where: { code: paysCible.code } });
    if (!marche?.ouvert) {
      return NextResponse.json(
        {
          success: false,
          message:
            'GLACE OS n’est pas encore ouvert aux fournisseurs dans ce pays. ' +
            'Nous vous préviendrons à l’ouverture.',
        },
        { status: 403 }
      );
    }

    const dejaUneBoutique = await prisma.boutique.count({ where: { utilisateurId: user.id } });
    if (dejaUneBoutique > 0) {
      return NextResponse.json(
        { success: false, message: 'Une boutique est déjà associée à votre compte.' },
        { status: 400 }
      );
    }

    const telephone = String(body.whatsapp ?? '').trim() || user.telephone;

    // Le changement de rôle et la création de la boutique vont ensemble : un compte
    // promu fournisseur sans boutique se retrouverait dans un espace vide et inutilisable.
    const boutique = await prisma.$transaction(async (tx) => {
      const creee = await tx.boutique.create({
        data: {
          utilisateurId: user.id,
          nom: nomBoutique,
          description:
            String(body.description ?? '').trim() ||
            'Fournisseur d’ingrédients et équipements pour glaciers.',
          pays,
          ville,
          quartier: String(body.quartier ?? '').trim() || 'Centre-ville',
          latitude: Number(body.latitude) || 0,
          longitude: Number(body.longitude) || 0,
          telephone,
          whatsapp: telephone,
          // Règle inchangée : toute boutique passe par la modération avant publication.
          statut: 'EN_ATTENTE',
          badgeCertifie: false,
        },
      });

      await tx.utilisateur.update({
        where: { id: user.id },
        data: { role: 'SUPPLIER' },
      });

      return creee;
    });

    // Le jeton de session porte l'ancien rôle. Sans réémission, le middleware
    // continuerait de refuser /fournisseur jusqu'à expiration — 30 jours.
    const cookieStore = await cookies();
    cookieStore.set(
      'glace_session_token',
      generateToken({ userId: user.id, email: user.email, role: 'SUPPLIER' }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      }
    );

    return NextResponse.json({
      success: true,
      boutiqueId: boutique.id,
      message:
        'Votre boutique est créée et attend la validation d’un modérateur. ' +
        'Vous pouvez déjà préparer vos offres.',
    });
  } catch (error: unknown) {
    const refus = authErrorResponse(error);
    if (refus) return refus;

    console.error('Erreur conversion en fournisseur:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de votre boutique.' },
      { status: 500 }
    );
  }
}
