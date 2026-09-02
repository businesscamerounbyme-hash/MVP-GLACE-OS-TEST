export interface Courriel {
  destinataire: string;
  sujet: string;
  texte: string;
  html: string;
}

/**
 * Envoi d'email.
 *
 * Deux implémentations, choisies par la présence de RESEND_API_KEY :
 * - Resend en production ;
 * - sinon, écriture dans la console du serveur, pour développer sans compte
 *   d'expédition. Le lien reste ainsi récupérable en local, mais n'est jamais
 *   renvoyé dans la réponse HTTP — cela permettrait à n'importe qui de demander
 *   une réinitialisation pour l'adresse d'autrui et d'en lire le lien.
 */
export async function envoyerCourriel(courriel: Courriel): Promise<void> {
  const cle = process.env.RESEND_API_KEY;
  const expediteur = process.env.EMAIL_EXPEDITEUR || 'GLACE OS <onboarding@resend.dev>';

  if (!cle) {
    console.warn(
      '\n─── EMAIL NON ENVOYÉ (RESEND_API_KEY absente) ───\n' +
        `À      : ${courriel.destinataire}\n` +
        `Sujet  : ${courriel.sujet}\n` +
        `${courriel.texte}\n` +
        '─────────────────────────────────────────────────\n'
    );
    return;
  }

  const reponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cle}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: expediteur,
      to: [courriel.destinataire],
      subject: courriel.sujet,
      text: courriel.texte,
      html: courriel.html,
    }),
  });

  if (!reponse.ok) {
    const detail = await reponse.text().catch(() => '');
    throw new Error(`Envoi d'email refusé (${reponse.status}) : ${detail}`);
  }
}

export function courrielReinitialisation(lien: string, nom: string): Courriel {
  return {
    destinataire: '',
    sujet: 'Réinitialisation de votre mot de passe GLACE OS',
    texte:
      `Bonjour ${nom},\n\n` +
      `Vous avez demandé à réinitialiser votre mot de passe GLACE OS.\n\n` +
      `Ouvrez ce lien pour en choisir un nouveau :\n${lien}\n\n` +
      `Ce lien expire dans 1 heure et ne peut servir qu'une fois.\n\n` +
      `Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : ` +
      `votre mot de passe actuel reste valable.`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#0f172a">Réinitialisation de mot de passe</h2>
        <p>Bonjour ${nom},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe GLACE OS.</p>
        <p style="margin:28px 0">
          <a href="${lien}" style="background:#f59e0b;color:#0f172a;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold">
            Choisir un nouveau mot de passe
          </a>
        </p>
        <p style="color:#64748b;font-size:13px">
          Ce lien expire dans 1 heure et ne peut servir qu'une fois.<br>
          Si vous n'êtes pas à l'origine de cette demande, ignorez ce message :
          votre mot de passe actuel reste valable.
        </p>
      </div>`,
  };
}
