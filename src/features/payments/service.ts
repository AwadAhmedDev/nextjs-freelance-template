import "server-only";
import type Stripe from "stripe";
import { confirmBooking, releaseUnpaidBooking } from "@/features/booking/service";
import { isUniqueConstraintError } from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";

/**
 * SERVICE "paiements" : traite les événements envoyés par Stripe (webhooks).
 * Appelé uniquement par src/app/api/webhooks/stripe/route.ts, APRÈS
 * vérification de la signature.
 *
 * Stripe peut envoyer le même événement plusieurs fois : on garde la trace
 * des événements traités, et chaque traitement est lui-même idempotent.
 */
export async function handleStripeEvent(event: Stripe.Event) {
  const alreadyProcessed = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
  if (alreadyProcessed) return;

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      // "paid" : l'argent est encaissé. Un prélèvement bancaire peut arriver plus tard
      // (événement async_payment_succeeded).
      if (bookingId && session.payment_status === "paid") await confirmBooking(bookingId);
      break;
    }

    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const bookingId = event.data.object.metadata?.bookingId;
      if (bookingId) await releaseUnpaidBooking(bookingId);
      break;
    }

    default:
      // Événement non utilisé : on ne fait rien, mais on répond quand même "reçu".
      break;
  }

  try {
    await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } });
  } catch (error) {
    // Deux envois simultanés du même événement : le second est simplement ignoré.
    if (!isUniqueConstraintError(error)) throw error;
  }
}
