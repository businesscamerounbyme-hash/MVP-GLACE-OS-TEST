import crypto from 'crypto';
import {
  PaymentProvider,
  DemandeInitiation,
  ResultatInitiation,
  IssueWebhook,
} from './provider';

/**
 * Agrégateur de développement.
 *
 * Il n'encaisse rien, mais il emprunte exactement le même chemin que la production :
 * la transaction est ouverte en EN_ATTENTE, et le droit n'est accordé que lorsqu'un
 * webhook signé la confirme. Le jour où CinetPay remplace cette classe, aucune ligne
 * de logique métier ne change.
 *
 * La signature utilise le même secret et le même algorithme (HMAC-SHA256) que les
 * agrégateurs réels, pour que le chemin de vérification soit lui aussi exercé.
 */
export class SimulationProvider implements PaymentProvider {
  readonly nom = 'simulation';
  readonly confirmationImmediate = false;

  private get secret(): string {
    const s = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!s) {
      throw new Error(
        "PAYMENT_WEBHOOK_SECRET est absent : impossible de signer ou vérifier un webhook."
      );
    }
    return s;
  }

  static signer(corps: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(corps).digest('hex');
  }

  async initier(demande: DemandeInitiation): Promise<ResultatInitiation> {
    return {
      referencePSP: `SIM-${demande.referenceInterne}`,
      message:
        'Paiement initié en mode simulation. Il restera en attente jusqu’à confirmation du webhook.',
    };
  }

  async interpreterWebhook(corpsBrut: string, entetes: Headers): Promise<IssueWebhook> {
    const signature = entetes.get('x-glace-signature');
    if (!signature) {
      return { valide: false, raison: 'Signature absente.' };
    }

    const attendue = SimulationProvider.signer(corpsBrut, this.secret);

    // Comparaison à temps constant : une comparaison naïve laisse fuiter la signature
    // attendue, octet par octet, par mesure du temps de réponse.
    const a = Buffer.from(signature);
    const b = Buffer.from(attendue);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { valide: false, raison: 'Signature invalide.' };
    }

    let charge: any;
    try {
      charge = JSON.parse(corpsBrut);
    } catch {
      return { valide: false, raison: 'Charge utile illisible.' };
    }

    if (!charge.referenceInterne || !charge.statut) {
      return { valide: false, raison: 'Champs obligatoires manquants.' };
    }

    if (charge.statut !== 'REUSSI' && charge.statut !== 'ECHOUE') {
      return { valide: false, raison: `Statut non reconnu : ${charge.statut}` };
    }

    return {
      valide: true,
      referenceInterne: String(charge.referenceInterne),
      referencePSP: String(charge.referencePSP || `SIM-${charge.referenceInterne}`),
      statut: charge.statut,
      motifEchec: charge.motifEchec ? String(charge.motifEchec) : undefined,
    };
  }
}
