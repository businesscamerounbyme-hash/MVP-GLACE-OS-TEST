import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, comparePassword, hashPassword, generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { requireUser, authErrorResponse } from '@/lib/guard';
import { verifierMotDePasse } from '@/lib/validation';
import { ipDepuisRequete, verifierLimite, enregistrerTentative } from '@/lib/rate-limit';

/**
 * Changement de mot de passe.
 *
 * L'ancien mot de passe est exigé même si la session est valide : sans cela, un cookie
 * volé ou une machine laissée déverrouillée permettrait de changer le mot de passe et
 * d'exclure définitivement le propriétaire de son compte.
 *
 * Les échecs sont comptabilisés comme des tentatives de connexion : ce formulaire est
 * sinon un oracle pour deviner le mot de passe courant sans limite.
 */
export async function POST(request: Request) {
  try {
    const session = requireUser(await getCurrentUser());
    const { ancienMotDePasse, nouveauMotDePasse } = await request.json();

    if (!ancienMotDePasse || !nouveauMotDePasse) {
      return NextResponse.json(
        { success: false, message: 'Ancien et nouveau mot de passe requis.' },
        { status: 400 }
      );
    }

    const ip = ipDepuisRequete(request);
    const limite = await verifierLimite(session.email, ip);
    if (!limite.autorise) {
      return NextResponse.json({ success: false, message: limite.message }, { status: 429 });
    }

    const user = await prisma.utilisateur.findUnique({
      where: { id: session.id },
      select: { id: true, motDePasse: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Compte introuvable.' },
        { status: 404 }
      );
    }

    const ancienValide = await comparePassword(ancienMotDePasse, user.motDePasse);
    if (!ancienValide) {
      await enregistrerTentative(session.email, ip, false);
      return NextResponse.json(
        { success: false, message: 'Ancien mot de passe incorrect.' },
        { status: 401 }
      );
    }

    const verif = verifierMotDePasse(nouveauMotDePasse);
    if (!verif.ok) {
      return NextResponse.json({ success: false, message: verif.message }, { status: 400 });
    }

    if (ancienMotDePasse === nouveauMotDePasse) {
      return NextResponse.json(
        { success: false, message: 'Le nouveau mot de passe doit être différent de l’ancien.' },
        { status: 400 }
      );
    }

    await prisma.utilisateur.update({
      where: { id: user.id },
      data: {
        motDePasse: await hashPassword(nouveauMotDePasse),
        motDePasseModifieLe: new Date(),
      },
    });

    await enregistrerTentative(session.email, ip, true);

    // Le jeton courant a ete emis avant motDePasseModifieLe : il vient donc d etre
    // invalide. On en reemet un pour que l auteur du changement reste connecte, alors
    // que les autres sessions ouvertes, elles, tombent bien.
    const cookieStore = await cookies();
    cookieStore.set(
      'glace_session_token',
      generateToken({ userId: session.id, email: session.email, role: session.role }),
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
      message: 'Mot de passe modifié.',
    });
  } catch (error: unknown) {
    const refus = authErrorResponse(error);
    if (refus) return refus;

    console.error('Erreur changement mot de passe:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du changement de mot de passe.' },
      { status: 500 }
    );
  }
}
