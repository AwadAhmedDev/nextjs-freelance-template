import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";

/**
 * Client Stripe unique, créé avec la clé SECRÈTE (côté serveur uniquement).
 * Utilise des clés de test (sk_test_...) en développement.
 */
let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe n'est pas configuré : renseigne STRIPE_SECRET_KEY dans .env.");
  }
  stripe ??= new Stripe(env.STRIPE_SECRET_KEY);
  return stripe;
}

export function isStripeConfigured() {
  return Boolean(env.STRIPE_SECRET_KEY);
}
