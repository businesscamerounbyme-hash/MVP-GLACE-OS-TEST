import { prisma } from './prisma';

const FENETRE_MINUTES = 15;
const MAX_PAR_EMAIL = 5;
const MAX_PAR_IP = 20;

/**
 * Extrait l'IP cliente. Derrière le proxy Vercel, `x-forwarded-for` contient la chaîne
 * des relais : la première entrée est le client réel.
 */
export function ipDepuisRequete(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'inconnue';
}

/**
 * Vérifie si l'on peut encore tenter une connexion.
 *
 * Deux compteurs volontairement distincts : par email pour protéger un compte précis
 * du bourrage de mots de passe, par IP pour freiner le balayage de nombreux comptes
 * depuis une même source. Un seul des deux laisserait passer l'autre attaque.
 */
export async function verifierLimite(email: string, ip: string) {
  const depuis = new Date(Date.now() - FENETRE_MINUTES * 60 * 1000);

  const [essaisEmail, essaisIp] = await Promise.all([
    prisma.tentativeConnexion.count({
      where: { cle: `email:${email}`, reussie: false, dateEssai: { gte: depuis } },
    }),
    prisma.tentativeConnexion.count({
      where: { cle: `ip:${ip}`, reussie: false, dateEssai: { gte: depuis } },
    }),
  ]);

  if (essaisEmail >= MAX_PAR_EMAIL || essaisIp >= MAX_PAR_IP) {
    return {
      autorise: false as const,
      message: `Trop de tentatives échouées. Réessayez dans ${FENETRE_MINUTES} minutes.`,
    };
  }

  return { autorise: true as const };
}

export async function enregistrerTentative(email: string, ip: string, reussie: boolean) {
  await prisma.tentativeConnexion.createMany({
    data: [
      { cle: `email:${email}`, reussie },
      { cle: `ip:${ip}`, reussie },
    ],
  });

  // Purge opportuniste : sans elle la table croît indéfiniment. Déclenchée une fois
  // sur vingt pour ne pas payer la suppression à chaque connexion.
  if (Math.random() < 0.05) {
    const limite = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.tentativeConnexion
      .deleteMany({ where: { dateEssai: { lt: limite } } })
      .catch(() => undefined);
  }
}
