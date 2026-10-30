import "server-only";
import { headers } from "next/headers";

/**
 * Limitation de débit simple, en mémoire, pour les Server Actions sensibles
 * (formulaire de contact, réservation, upload...).
 *
 * Limite : la mémoire n'est pas partagée entre plusieurs serveurs et se vide
 * au redémarrage. Suffisant pour un seul VPS. Au-delà, remplace par Redis
 * ou un service dédié, sans changer l'appel `rateLimit(...)`.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  /** Nombre maximal d'appels autorisés dans la fenêtre */
  limit: number;
  /** Durée de la fenêtre en secondes */
  windowSeconds: number;
};

/** Renvoie true si l'appel est autorisé, false s'il faut le refuser. */
export function checkRateLimit(
  key: string,
  { limit, windowSeconds }: RateLimitOptions,
  now = Date.now(),
) {
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    cleanup(now);
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Identifie l'appelant : l'utilisateur s'il est connecté, sinon son adresse IP. */
export async function rateLimit(action: string, options: RateLimitOptions, userId?: string) {
  const identity = userId ?? (await clientIp());
  return checkRateLimit(`${action}:${identity}`, options);
}

async function clientIp() {
  const h = await headers();
  // Caddy transmet l'adresse réelle du visiteur dans X-Forwarded-For.
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "inconnu";
}

function cleanup(now: number) {
  if (buckets.size < 10_000) return;
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}

/** Uniquement pour les tests. */
export function resetRateLimits() {
  buckets.clear();
}
