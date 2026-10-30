/**
 * Règles métier PURES du module réservation : aucun accès à la base,
 * aucun service externe. Faciles à tester avec Vitest (voir rules.test.ts).
 * Change ici les règles de ton client : taux d'acompte, délais...
 */

/** Part du prix demandée en acompte à la réservation. */
export const DEPOSIT_RATE = 0.3;

/** Durée laissée au client pour payer avant que le créneau soit libéré. */
export const PAYMENT_WINDOW_MINUTES = 30;

/** Délai minimum entre maintenant et le début d'un créneau réservable. */
export const MIN_BOOKING_NOTICE_MINUTES = 60;

/** Acompte en centimes, arrondi au centime. 3500 (35 €) → 1050 (10,50 €). */
export function computeDepositCents(priceCents: number) {
  if (!Number.isInteger(priceCents) || priceCents <= 0) {
    throw new RangeError("Le prix doit être un entier positif en centimes.");
  }
  return Math.round(priceCents * DEPOSIT_RATE);
}

/** Un créneau est réservable s'il commence assez loin dans le futur. */
export function isSlotBookable(startsAt: Date, now = new Date()) {
  return startsAt.getTime() - now.getTime() >= MIN_BOOKING_NOTICE_MINUTES * 60_000;
}

/** Une réservation en attente de paiement depuis trop longtemps peut être libérée. */
export function isPendingBookingExpired(createdAt: Date, now = new Date()) {
  // Petite marge au-delà de la fenêtre de paiement Stripe.
  return now.getTime() - createdAt.getTime() > (PAYMENT_WINDOW_MINUTES + 5) * 60_000;
}

/** 49,90 (euros saisis par l'admin) → 4990 centimes. */
export function eurosToCents(euros: number) {
  return Math.round(euros * 100);
}
