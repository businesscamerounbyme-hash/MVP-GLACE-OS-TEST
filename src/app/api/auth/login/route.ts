import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { ipDepuisRequete, verifierLimite, enregistrerTentative } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const { email, motDePasse } = await request.json();

    if (!email || !motDePasse) {
      return NextResponse.json(
        { success: false, message: 'Email et mot de passe requis.' },
        { status: 400 }
      );
    }

    const emailNormalise = String(email).toLowerCase().trim();
    const ip = ipDepuisRequete(request);

    const limite = await verifierLimite(emailNormalise, ip);
    if (!limite.autorise) {
      return NextResponse.json({ success: false, message: limite.message }, { status: 429 });
    }

    const user = await prisma.utilisateur.findUnique({
      where: { email: emailNormalise },
      include: {
        boutiques: { take: 1 },
        abonnementsMembre: {
          where: {
            statut: 'ACTIF',
            dateFin: { gte: new Date() }
          },
          take: 1
        }
      }
    });

    if (!user) {
      await enregistrerTentative(emailNormalise, ip, false);
      return NextResponse.json(
        { success: false, message: 'Identifiants incorrects.' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(motDePasse, user.motDePasse);
    if (!isValid) {
      await enregistrerTentative(emailNormalise, ip, false);
      return NextResponse.json(
        { success: false, message: 'Identifiants incorrects.' },
        { status: 401 }
      );
    }

    await enregistrerTentative(emailNormalise, ip, true);

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
      maxAge: 30 * 24 * 60 * 60 // 30 jours
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
        hasActiveMembership: user.role === 'ADMIN' || user.role === 'MODERATOR' || (user.abonnementsMembre && user.abonnementsMembre.length > 0),
        boutiqueId: user.boutiques?.[0]?.id
      }
    });
  } catch (error: any) {
    console.error('Erreur API Login:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur.' },
      { status: 500 }
    );
  }
}
