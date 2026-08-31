import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const TOKEN_NAME = 'glace_session_token';

/**
 * Espaces protégés et rôles admis. Le middleware s'exécute sur le runtime Edge :
 * `jsonwebtoken` y est inutilisable (dépendances Node natives), d'où `jose`.
 *
 * Ce filtrage est une commodité d'expérience — il évite d'afficher la coquille d'une
 * page réservée avant que le client ne découvre qu'il n'y a pas droit. Le contrôle
 * qui fait autorité reste celui des routes API, qui relisent l'utilisateur en base :
 * un rôle peut avoir changé depuis l'émission du jeton, qui vit 30 jours.
 */
const ESPACES_PROTEGES: { prefixe: string; roles: string[] | null }[] = [
  { prefixe: '/admin', roles: ['ADMIN', 'MODERATOR'] },
  { prefixe: '/fournisseur', roles: ['SUPPLIER', 'ADMIN'] },
  { prefixe: '/membre', roles: null },
  { prefixe: '/espace', roles: null },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const espace = ESPACES_PROTEGES.find(
    (e) => pathname === e.prefixe || pathname.startsWith(e.prefixe + '/')
  );
  if (!espace) return NextResponse.next();

  const token = request.cookies.get(TOKEN_NAME)?.value;
  if (!token) return redirigerVersConnexion(request);

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Pas de secret : on ne peut rien affirmer, donc on refuse. Échouer fermé.
    console.error('JWT_SECRET absent : accès aux espaces protégés refusé.');
    return redirigerVersConnexion(request);
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    if (espace.roles && !espace.roles.includes(String(payload.role))) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch {
    // Jeton expiré, altéré ou signé avec un autre secret.
    return redirigerVersConnexion(request);
  }
}

function redirigerVersConnexion(request: NextRequest) {
  const url = new URL('/login', request.url);
  // Mémorise la destination pour y revenir après connexion.
  url.searchParams.set('suite', request.nextUrl.pathname);
  const reponse = NextResponse.redirect(url);
  reponse.cookies.delete(TOKEN_NAME);
  return reponse;
}

export const config = {
  matcher: ['/admin/:path*', '/fournisseur/:path*', '/membre/:path*', '/espace/:path*'],
};
