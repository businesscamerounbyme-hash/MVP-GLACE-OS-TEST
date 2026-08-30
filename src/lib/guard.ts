import { prisma } from './prisma';
import { UserSession, Role } from '@/types';

/**
 * Erreur d'autorisation transportant le code HTTP à renvoyer.
 * Permet aux routes de laisser remonter plutôt que d'empiler les `if`.
 */
export class AuthorizationError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/** Exige une session, et optionnellement l'un des rôles fournis. */
export function requireUser(user: UserSession | null, roles?: Role[]): UserSession {
  if (!user) {
    throw new AuthorizationError(401, 'Authentification requise.');
  }
  if (roles && !roles.includes(user.role)) {
    throw new AuthorizationError(403, 'Non autorisé.');
  }
  return user;
}

/**
 * Vérifie que la boutique visée appartient bien à l'utilisateur.
 *
 * Sans ce contrôle, un `boutiqueId` arbitraire dans le corps d'une requête permettait
 * d'agir sur la boutique d'un tiers : activer son abonnement, la republier, lui
 * attribuer un badge.
 */
export async function requireBoutiqueOwnership(user: UserSession, boutiqueId: string) {
  const boutique = await prisma.boutique.findUnique({
    where: { id: boutiqueId },
    select: { id: true, utilisateurId: true, statut: true, dateValidation: true },
  });

  if (!boutique) {
    throw new AuthorizationError(404, 'Boutique introuvable.');
  }

  // Les administrateurs et modérateurs agissent sur n'importe quelle boutique.
  const privilegie = user.role === 'ADMIN' || user.role === 'MODERATOR';
  if (!privilegie && boutique.utilisateurId !== user.id) {
    throw new AuthorizationError(403, 'Cette boutique ne vous appartient pas.');
  }

  return boutique;
}

/** Traduit une AuthorizationError en réponse JSON ; relance toute autre erreur. */
export function authErrorResponse(error: unknown) {
  if (error instanceof AuthorizationError) {
    return Response.json({ success: false, message: error.message }, { status: error.status });
  }
  return null;
}
