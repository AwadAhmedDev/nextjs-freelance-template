import "server-only";
import type { ReactElement } from "react";
import { render, toPlainText } from "react-email";
import { Resend } from "resend";
import { env } from "@/lib/env";

/**
 * Envoi d'emails transactionnels avec Resend.
 * Les emails sont des composants React (dossier src/emails), rendus en HTML + texte.
 *
 * Sans RESEND_API_KEY (développement), l'email est affiché dans la console
 * au lieu d'être envoyé : tu peux tester les parcours sans compte Resend.
 *
 * En production, configure ton domaine chez Resend (SPF, DKIM, DMARC),
 * sinon les emails finissent dans les spams.
 */
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
};

export async function sendEmail({ to, subject, react }: SendEmailInput) {
  const html = await render(react);
  const text = toPlainText(html);

  if (!resend) {
    console.info(
      `\n📧 [email non envoyé : RESEND_API_KEY absente]\nÀ : ${to}\nObjet : ${subject}\n${text}\n`,
    );
    return;
  }

  const { error } = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html, text });
  if (error) {
    // Erreur technique : remontée à la surveillance (Sentry) par l'appelant.
    throw new Error(`Échec de l'envoi de l'email "${subject}" : ${error.message}`);
  }
}
