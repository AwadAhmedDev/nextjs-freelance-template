import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { ResetPasswordEmail } from "@/emails/reset-password-email";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

/**
 * Configuration de l'authentification (Better Auth).
 * - Sessions stockées en base, cookie HttpOnly côté navigateur
 * - Email + mot de passe, et Google si les clés sont renseignées
 * - Un champ "role" ("user" ou "admin") que l'utilisateur ne peut pas modifier lui-même
 *
 * Les routes HTTP de Better Auth sont exposées par src/app/api/auth/[...all]/route.ts.
 * Pour lire la session dans le code, utilise src/lib/session.ts (jamais auth directement).
 */
const google =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
    : {};

export const auth = betterAuth({
  appName: "Mon Site",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe",
        react: ResetPasswordEmail({ name: user.name, url }),
      });
    },
  },

  socialProviders: google,

  user: {
    additionalFields: {
      // input: false → impossible de choisir son rôle à l'inscription.
      role: { type: "string", defaultValue: "user", input: false },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // la session est prolongée une fois par jour d'activité
  },

  // Limitation de débit sur les routes d'authentification (actif en production).
  // Stockage en mémoire : suffisant pour un seul serveur. Avec plusieurs serveurs,
  // passe à "database" ou à un stockage partagé (Redis).
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 300, max: 3 },
    },
  },

  // Doit rester le dernier plugin : permet aux Server Actions de poser les cookies.
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
