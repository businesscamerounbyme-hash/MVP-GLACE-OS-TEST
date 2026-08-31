import { Role } from '@/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export const ROLES_VALIDES: Role[] = ['ADMIN', 'MODERATOR', 'SUPPLIER', 'MEMBER'];

export function estEmailValide(email: unknown): boolean {
  return typeof email === 'string' && email.length <= 254 && EMAIL_RE.test(email.trim());
}

export function estRoleValide(role: unknown): role is Role {
  return typeof role === 'string' && (ROLES_VALIDES as string[]).includes(role);
}

/**
 * Politique de mot de passe.
 *
 * Volontairement modeste : le public visé se connecte souvent depuis un téléphone,
 * et une exigence trop lourde pousse à noter le mot de passe ou à abandonner
 * l'inscription. La longueur minimale fait le gros du travail, la limitation des
 * tentatives couvre le reste.
 */
export function verifierMotDePasse(motDePasse: unknown): { ok: true } | { ok: false; message: string } {
  if (typeof motDePasse !== 'string' || motDePasse.length < 8) {
    return { ok: false, message: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }
  if (motDePasse.length > 200) {
    return { ok: false, message: 'Mot de passe trop long (200 caractères maximum).' };
  }
  if (!/[a-zA-Z]/.test(motDePasse) || !/[0-9]/.test(motDePasse)) {
    return {
      ok: false,
      message: 'Le mot de passe doit contenir au moins une lettre et un chiffre.',
    };
  }
  return { ok: true };
}
