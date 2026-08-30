import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { UserSession } from '@/types';

const TOKEN_NAME = 'glace_session_token';

/**
 * Aucun secret de repli : une valeur codée en dur dans le dépôt permettrait à
 * quiconque le lit de forger un jeton de session administrateur.
 * La lecture est différée (et non faite au chargement du module) pour qu'un build
 * sans variables d'environnement n'échoue pas ; l'exécution, elle, refuse de signer.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET est absent de l'environnement : impossible de signer ou vérifier une session."
    );
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '30d' });
}

export function verifyToken(token: string): any {
  // Hors du try : un secret manquant est une erreur de configuration, pas un jeton
  // invalide, et doit remonter au lieu d'être confondue avec une session anonyme.
  const secret = getJwtSecret();
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;

    const user = await prisma.utilisateur.findUnique({
      where: { id: decoded.userId },
      include: {
        boutiques: {
          select: { id: true, statut: true, badgeCertifie: true },
          take: 1
        },
        abonnementsMembre: {
          where: {
            statut: 'ACTIF',
            dateFin: { gte: new Date() }
          },
          take: 1
        }
      }
    });

    if (!user) return null;

    const hasActiveMembership = user.role === 'ADMIN' || user.role === 'MODERATOR' || (user.abonnementsMembre && user.abonnementsMembre.length > 0);

    return {
      id: user.id,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone,
      pays: user.pays,
      ville: user.ville,
      role: user.role as any,
      hasActiveMembership,
      boutiqueId: user.boutiques?.[0]?.id,
      boutiqueStatut: user.boutiques?.[0]?.statut
    };
  } catch (err) {
    console.error('Error in getCurrentUser:', err);
    return null;
  }
}
