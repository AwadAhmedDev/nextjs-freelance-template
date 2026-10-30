import "server-only";
import { BookingConfirmedEmail } from "@/emails/booking-confirmed-email";
import { BusinessError } from "@/lib/action-result";
import { isUniqueConstraintError } from "@/lib/db-errors";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import {
  PAYMENT_WINDOW_MINUTES,
  computeDepositCents,
  eurosToCents,
  isPendingBookingExpired,
  isSlotBookable,
} from "./rules";
import type { CreateSlotInput } from "./schema";

/**
 * SERVICE "réservation" : les règles du métier, écrites une seule fois.
 * Appelé par les Server Actions (actions.ts), par le webhook Stripe
 * (src/features/payments) et, demain, par un agent IA ou une tâche planifiée.
 *
 * Le service ne connaît ni les formulaires ni HTTP. Il reçoit des données
 * déjà validées et un utilisateur déjà authentifié.
 * Erreur attendue → BusinessError (message pour l'utilisateur).
 * Erreur inattendue → laissée remonter (surveillance, message générique).
 */

/**
 * 1er appel : enregistre la réservation "en attente de paiement",
 * puis demande à Stripe une page de paiement pour l'acompte.
 * Renvoie l'adresse de cette page.
 */
export async function bookSlot(userId: string, slotId: string): Promise<{ checkoutUrl: string }> {
  const slot = await prisma.slot.findUnique({
    where: { id: slotId },
    include: { booking: true },
  });

  // Avant toute écriture : sans clé Stripe, la réservation ne peut pas aboutir.
  if (!isStripeConfigured())
    throw new BusinessError("Le paiement en ligne n'est pas encore activé.");
  if (!slot) throw new BusinessError("Ce créneau n'existe pas.");
  if (!isSlotBookable(slot.startsAt)) throw new BusinessError("Ce créneau n'est plus réservable.");

  // Une réservation abandonnée (paiement jamais finalisé) libère le créneau.
  if (
    slot.booking?.status === "PENDING_PAYMENT" &&
    isPendingBookingExpired(slot.booking.createdAt)
  ) {
    await prisma.booking.deleteMany({ where: { id: slot.booking.id, status: "PENDING_PAYMENT" } });
  } else if (slot.booking) {
    throw new BusinessError("Ce créneau vient d'être réservé.");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true },
  });

  // Le montant est TOUJOURS calculé ici, jamais envoyé par le navigateur.
  const depositCents = computeDepositCents(slot.priceCents);

  let bookingId: string;
  try {
    const booking = await prisma.booking.create({
      data: { userId, slotId, depositCents, status: "PENDING_PAYMENT" },
      select: { id: true },
    });
    bookingId = booking.id;
  } catch (error) {
    // Contrainte d'unicité sur slotId : quelqu'un a réservé à la même seconde.
    if (isUniqueConstraintError(error)) throw new BusinessError("Ce créneau vient d'être réservé.");
    throw error;
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: depositCents,
            product_data: { name: "Acompte de réservation" },
          },
        },
      ],
      // L'étiquette qui reviendra dans le webhook pour retrouver la réservation.
      metadata: { bookingId },
      client_reference_id: bookingId,
      expires_at: Math.floor(Date.now() / 1000) + PAYMENT_WINDOW_MINUTES * 60,
      success_url: `${env.NEXT_PUBLIC_APP_URL}/reservation/merci`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/reservation`,
    });

    if (!session.url) throw new Error("Stripe n'a pas renvoyé d'adresse de paiement.");

    await prisma.booking.update({
      where: { id: bookingId },
      data: { stripeSessionId: session.id },
    });

    return { checkoutUrl: session.url };
  } catch (error) {
    // Paiement impossible à préparer : on libère le créneau immédiatement.
    await prisma.booking.delete({ where: { id: bookingId } });
    throw error;
  }
}

/**
 * 2e appel, plus tard : le webhook Stripe annonce que l'acompte est payé.
 * Idempotent : Stripe peut envoyer le même événement plusieurs fois,
 * l'email ne part qu'une seule fois.
 */
export async function confirmBooking(bookingId: string) {
  // Mise à jour conditionnelle : ne passe en CONFIRMED que si c'était en attente.
  const { count } = await prisma.booking.updateMany({
    where: { id: bookingId, status: "PENDING_PAYMENT" },
    data: { status: "CONFIRMED" },
  });
  if (count === 0) return; // déjà confirmée, annulée ou inconnue : rien à faire

  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { slot: true, user: { select: { name: true, email: true } } },
  });

  await sendEmail({
    to: booking.user.email,
    subject: "Votre réservation est confirmée",
    react: BookingConfirmedEmail({
      name: booking.user.name,
      startsAt: booking.slot.startsAt,
      depositCents: booking.depositCents,
    }),
  });
}

/** Le client n'a pas payé à temps : Stripe annonce l'expiration, on libère le créneau. */
export async function releaseUnpaidBooking(bookingId: string) {
  await prisma.booking.deleteMany({ where: { id: bookingId, status: "PENDING_PAYMENT" } });
}

/** Administration : ajouter un créneau. */
export async function createSlot(input: CreateSlotInput) {
  const startsAt = new Date(input.startsAt);
  if (startsAt <= new Date()) throw new BusinessError("Le créneau doit être dans le futur.");

  return prisma.slot.create({
    data: {
      startsAt,
      durationMinutes: input.durationMinutes,
      priceCents: eurosToCents(input.priceEuros),
    },
    select: { id: true },
  });
}
