import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { requireUser, authErrorResponse } from '@/lib/guard';

const MAX = 120;

function texte(valeur: unknown, max = MAX): string | null {
  if (typeof valeur !== 'string') return null;
  const v = valeur.trim();
  if (!v || v.length > max) return null;
  return v;
}

/**
 * Modification des informations personnelles.
 *
 * Champs volontairement exclus :
 * - `email`, parce qu'il identifie le compte : le changer demande une vérification
 *   de la nouvelle adresse, sans quoi une faute de frappe rend le compte inaccessible.
 * - `role`, qui ne se modifie que depuis l'espace d'administration.
 * - `motDePasse`, traité à part car il exige l'ancien mot de passe.
 */
export async function PATCH(request: Request) {
  try {
    const user = requireUser(await getCurrentUser());
    const body = await request.json();

    const nom = texte(body.nom);
    if (!nom) {
      return NextResponse.json(
        { success: false, message: 'Le nom est obligatoire.' },
        { status: 400 }
      );
    }

    const telephone = texte(body.telephone, 30);
    if (!telephone || !/^[+0-9\s-]{8,30}$/.test(telephone)) {
      return NextResponse.json(
        { success: false, message: 'Numéro de téléphone invalide.' },
        { status: 400 }
      );
    }

    const pays = texte(body.pays);
    const ville = texte(body.ville);
    if (!pays || !ville) {
      return NextResponse.json(
        { success: false, message: 'Le pays et la ville sont obligatoires.' },
        { status: 400 }
      );
    }

    // Le prénom reste facultatif : les comptes antérieurs n'en ont pas.
    const prenom = body.prenom === '' || body.prenom == null ? null : texte(body.prenom);
    if (body.prenom && !prenom) {
      return NextResponse.json(
        { success: false, message: 'Prénom invalide.' },
        { status: 400 }
      );
    }

    const maj = await prisma.utilisateur.update({
      where: { id: user.id },
      data: { nom, prenom, telephone, pays, ville },
      select: {
        id: true,
        nom: true,
        prenom: true,
        photoUrl: true,
        email: true,
        telephone: true,
        pays: true,
        ville: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, user: maj, message: 'Profil mis à jour.' });
  } catch (error: unknown) {
    const refus = authErrorResponse(error);
    if (refus) return refus;

    console.error('Erreur mise à jour profil:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour du profil.' },
      { status: 500 }
    );
  }
}
