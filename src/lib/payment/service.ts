import crypto from 'crypto';
import { prisma } from '../prisma';
import { getTarif } from '../tarifs';
import { getPaymentProvider } from './index';
import { TypePaiement, OperateurMobileMoney } from '@/types';

const DUREE_ABONNEMENT_JOURS = 30;

export interface OuverturePaiement {
  utilisateurId: string;
  type: TypePaiement;
  /** Déjà dérivé de la session ou vérifié en propriété par l'appelant. */
  cibleId: string;
  operateur: OperateurMobileMoney;
  numeroTelephone: string;
  userEmail?: string;
}

function nouvelleReference(operateur: string): string {
  const prefixe =
    operateur === 'ORANGE_MONEY' ? 'OM'
    : operateur === 'MTN_MOMO' ? 'MTN'
    : operateur === 'WAVE' ? 'WAVE'
    : 'MOOV';
  return `${prefixe}-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(4)
    .toString('hex')
    .toUpperCase()}`;
}

/**
 * Ouvre une transaction et demande son initiation à l'agrégateur.
 * Ne donne accès à rien : le paiement ressort en EN_ATTENTE.
 */
export async function ouvrirPaiement(demande: OuverturePaiement) {
  const tarif = getTarif(demande.type);
  const referenceInterne = nouvelleReference(demande.operateur);
  const provider = getPaymentProvider();

  const paiement = await prisma.paiement.create({
    data: {
      utilisateurId: demande.utilisateurId,
      type: demande.type,
      cibleId: demande.cibleId,
      montant: tarif.montant,
      devise: tarif.devise,
      operateur: demande.operateur,
      numeroTelephone: demande.numeroTelephone,
      statut: 'INITIE',
      referenceInterne,
    },
  });

  try {
    const resultat = await provider.initier({
      referenceInterne,
      type: demande.type,
      montant: tarif.montant,
      devise: tarif.devise,
      operateur: demande.operateur,
      numeroTelephone: demande.numeroTelephone,
      libelle: tarif.libelle,
      userEmail: demande.userEmail,
    });

    await prisma.paiement.update({
      where: { id: paiement.id },
      data: { statut: 'EN_ATTENTE', referencePSP: resultat.referencePSP ?? null },
    });

    return {
      success: true,
      statut: 'EN_ATTENTE' as const,
      reference: referenceInterne,
      montant: tarif.montant,
      devise: tarif.devise,
      urlPaiement: resultat.urlPaiement,
      message: resultat.message,
    };
  } catch (err) {
    await prisma.paiement.update({
      where: { id: paiement.id },
      data: { statut: 'ECHOUE', motifEchec: "Initiation refusée par l'agrégateur." },
    });
    throw err;
  }
}

/**
 * Applique l'issue d'un webhook déjà authentifié.
 *
 * Idempotence : le passage à REUSSI se fait par un `updateMany` conditionné au statut
 * courant. Si un rejeu a déjà conclu la transaction, `count` vaut 0 et aucun droit
 * n'est accordé une seconde fois. Le contrôle est porté par la base, donc résistant
 * à deux webhooks arrivant en parallèle sur deux instances serverless distinctes.
 */
export async function appliquerIssuePaiement(params: {
  referenceInterne: string;
  referencePSP: string;
  statut: 'REUSSI' | 'ECHOUE';
  motifEchec?: string;
  payloadBrut: string;
}) {
  const paiement = await prisma.paiement.findUnique({
    where: { referenceInterne: params.referenceInterne },
  });

  if (!paiement) {
    return { traite: false, raison: 'Paiement inconnu.' };
  }

  if (paiement.statut === 'REUSSI' || paiement.statut === 'ECHOUE') {
    return { traite: false, raison: 'Transaction déjà conclue (rejeu ignoré).' };
  }

  if (params.statut === 'ECHOUE') {
    await prisma.paiement.updateMany({
      where: { id: paiement.id, statut: { in: ['INITIE', 'EN_ATTENTE'] } },
      data: {
        statut: 'ECHOUE',
        motifEchec: params.motifEchec ?? 'Refusé par l’opérateur.',
        payloadWebhook: params.payloadBrut,
        referencePSP: params.referencePSP,
      },
    });
    return { traite: true, statut: 'ECHOUE' as const };
  }

  return prisma.$transaction(async (tx) => {
    // Compare-and-swap : seule l'instance qui fait passer le statut accorde le droit.
    const verrou = await tx.paiement.updateMany({
      where: { id: paiement.id, statut: { in: ['INITIE', 'EN_ATTENTE'] } },
      data: {
        statut: 'REUSSI',
        dateConfirmation: new Date(),
        payloadWebhook: params.payloadBrut,
        referencePSP: params.referencePSP,
      },
    });

    if (verrou.count === 0) {
      return { traite: false, raison: 'Course perdue : déjà conclue.' };
    }

    const debut = new Date();
    const fin = new Date();
    fin.setDate(fin.getDate() + DUREE_ABONNEMENT_JOURS);

    if (paiement.type === 'ABONNEMENT_MEMBRE') {
      await tx.abonnementMembre.create({
        data: {
          utilisateurId: paiement.cibleId,
          statut: 'ACTIF',
          dateDebut: debut,
          dateFin: fin,
          montant: paiement.montant,
          devise: paiement.devise,
          referenceMobileMoney: paiement.referenceInterne,
          operateur: paiement.operateur,
        },
      });
    } else if (paiement.type === 'ABONNEMENT_FOURNISSEUR') {
      await tx.abonnementFournisseur.create({
        data: {
          boutiqueId: paiement.cibleId,
          statut: 'ACTIF',
          dateDebut: debut,
          dateFin: fin,
          montant: paiement.montant,
          devise: paiement.devise,
          referenceMobileMoney: paiement.referenceInterne,
          operateur: paiement.operateur,
        },
      });

      const boutique = await tx.boutique.findUnique({ where: { id: paiement.cibleId } });
      if (boutique?.statut === 'INACTIVE' && boutique.dateValidation) {
        await tx.boutique.update({
          where: { id: paiement.cibleId },
          data: { statut: 'PUBLIEE' },
        });
      }
    } else if (paiement.type === 'DEMANDE_BADGE') {
      // Payée seulement : le badge reste soumis à la vérification d'un modérateur.
      await tx.demandeBadge.create({
        data: {
          boutiqueId: paiement.cibleId,
          statut: 'PAYEE',
          montant: paiement.montant,
          referencePaiement: paiement.referenceInterne,
          operateur: paiement.operateur,
        },
      });
    }

    return { traite: true, statut: 'REUSSI' as const };
  });
}
