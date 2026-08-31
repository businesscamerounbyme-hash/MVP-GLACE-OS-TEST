import { PaymentProvider } from './provider';
import { SimulationProvider } from './simulation';

let instance: PaymentProvider | null = null;

/**
 * Sélectionne l'agrégateur actif. Basculer en production se fera en changeant
 * PAYMENT_PROVIDER, sans toucher au code appelant.
 */
export function getPaymentProvider(): PaymentProvider {
  if (instance) return instance;

  const choix = (process.env.PAYMENT_PROVIDER || 'simulation').toLowerCase();

  switch (choix) {
    case 'simulation':
      instance = new SimulationProvider();
      break;
    default:
      throw new Error(
        `PAYMENT_PROVIDER inconnu : « ${choix} ». Valeurs acceptées : simulation.`
      );
  }

  return instance;
}

export * from './provider';
export { SimulationProvider } from './simulation';
