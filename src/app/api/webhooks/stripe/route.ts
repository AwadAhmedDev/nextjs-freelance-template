import type Stripe from "stripe";
import { handleStripeEvent } from "@/features/payments/service";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

/**
 * ROUTE HANDLER : la porte d'entrée pour l'EXTÉRIEUR.
 * Adresse : POST /api/webhooks/stripe
 *
 * Stripe appelle cette adresse pour prévenir le site (paiement réussi, expiré...).
 * Rôle du Route Handler, et rien de plus :
 *   1. Lire le message brut
 *   2. Vérifier la signature : c'est vraiment Stripe ?
 *   3. Transmettre l'événement au service
 *   4. Répondre "bien reçu" (sinon Stripe renvoie le message plus tard)
 *
 * En local : stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */
export async function POST(request: Request) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Webhook Stripe non configuré", { status: 500 });
  }

  // 1. Le corps BRUT est indispensable : la signature est calculée dessus.
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Signature manquante", { status: 400 });

  // 2. Vérification de la signature
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response("Signature invalide", { status: 400 });
  }

  // 3. Traitement par le service
  try {
    await handleStripeEvent(event);
  } catch (error) {
    console.error("Webhook Stripe : échec du traitement", event.type, event.id, error);
    // 500 : Stripe réessaiera plus tard. Le traitement est idempotent.
    return new Response("Erreur de traitement", { status: 500 });
  }

  // 4. Bien reçu
  return Response.json({ received: true });
}
