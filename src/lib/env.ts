import "server-only";
import { z } from "zod";

/**
 * Variables d'environnement CÔTÉ SERVEUR, validées au démarrage.
 * Si une variable obligatoire manque, l'application refuse de démarrer
 * avec un message clair, au lieu de planter devant un client.
 *
 * Pour ajouter une variable : ajoute-la ici, dans .env.example et dans la CI.
 */
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(emptyToUndefined, schema.optional());

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.url(),
  DATABASE_URL: z.string().min(1),

  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET doit faire au moins 32 caractères"),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: optional(z.string()),
  GOOGLE_CLIENT_SECRET: optional(z.string()),

  STRIPE_SECRET_KEY: optional(z.string().startsWith("sk_")),
  STRIPE_WEBHOOK_SECRET: optional(z.string().startsWith("whsec_")),

  RESEND_API_KEY: optional(z.string()),
  EMAIL_FROM: z.preprocess(emptyToUndefined, z.string().default("Mon Site <contact@exemple.fr>")),

  S3_ENDPOINT: optional(z.url()),
  S3_REGION: z.preprocess(emptyToUndefined, z.string().default("auto")),
  S3_BUCKET: optional(z.string()),
  S3_ACCESS_KEY_ID: optional(z.string()),
  S3_SECRET_ACCESS_KEY: optional(z.string()),
  S3_PUBLIC_ORIGIN: optional(z.url()),
});

export type ServerEnv = z.infer<typeof serverSchema>;

function loadEnv(): ServerEnv {
  // Pendant le build Docker, les secrets ne sont pas encore disponibles.
  if (process.env.SKIP_ENV_VALIDATION === "1") {
    return process.env as unknown as ServerEnv;
  }

  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    console.error(
      "❌ Variables d'environnement invalides :",
      z.flattenError(result.error).fieldErrors,
    );
    throw new Error("Variables d'environnement invalides. Vérifie ton fichier .env.");
  }
  return result.data;
}

export const env = loadEnv();
