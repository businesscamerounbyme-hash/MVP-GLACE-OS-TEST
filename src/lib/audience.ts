import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_VISITEUR = 'glace_visiteur';
const UN_AN = 365 * 24 * 60 * 60;

/**
 * Identifiant de visiteur, tiré d'un cookie aléatoire posé à la première visite.
 *
 * Volontairement pas une empreinte d'adresse IP : mesurer une audience ne justifie pas
 * de manipuler une donnée personnelle, et une IP partagée — cybercafé, réseau mobile —
 * confondrait plusieurs visiteurs en un seul.
 *
 * Le cookie ne sert qu'au dédoublonnage. Il ne permet pas d'identifier quelqu'un et
 * n'est jamais rapproché d'un compte.
 */
export async function cleVisiteur(): Promise<string> {
  const magasin = await cookies();
  const existant = magasin.get(COOKIE_VISITEUR)?.value;
  if (existant) return existant;

  const nouvelle = crypto.randomBytes(16).toString('hex');
  magasin.set(COOKIE_VISITEUR, nouvelle, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: UN_AN,
  });
  return nouvelle;
}

/** Jour courant au format AAAA-MM-JJ, clé de dédoublonnage quotidien. */
export function jourCourant(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Bornes des N derniers jours, pour les agrégats affichés au fournisseur. */
export function depuisJours(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
