import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { UserSession } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'glace-os-secret-mvp-african-ice-cream-2026';
const TOKEN_NAME = 'glace_session_token';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
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
