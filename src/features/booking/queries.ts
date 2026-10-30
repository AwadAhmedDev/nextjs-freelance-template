import "server-only";
import { prisma } from "@/lib/prisma";
import { MIN_BOOKING_NOTICE_MINUTES, isPendingBookingExpired } from "./rules";

/**
 * LECTURES pour l'affichage des pages. Pas de règle métier ici :
 * on lit directement avec Prisma et on ne sélectionne que les champs affichés.
 */

/** Créneaux à venir, libres (ou dont le paiement a été abandonné). */
export async function listAvailableSlots() {
  const from = new Date(Date.now() + MIN_BOOKING_NOTICE_MINUTES * 60_000);
  const slots = await prisma.slot.findMany({
    where: {
      startsAt: { gte: from },
      OR: [{ booking: null }, { booking: { status: "PENDING_PAYMENT" } }],
    },
    orderBy: { startsAt: "asc" },
    take: 50,
    select: {
      id: true,
      startsAt: true,
      durationMinutes: true,
      priceCents: true,
      booking: { select: { createdAt: true } },
    },
  });

  return slots
    .filter((slot) => !slot.booking || isPendingBookingExpired(slot.booking.createdAt))
    .map(({ booking: _booking, ...slot }) => slot);
}

/** Réservations de l'utilisateur connecté. Toujours filtrées par userId. */
export async function listUserBookings(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    orderBy: { slot: { startsAt: "desc" } },
    select: {
      id: true,
      status: true,
      depositCents: true,
      slot: { select: { startsAt: true, durationMinutes: true } },
    },
  });
}

/** Administration : tous les créneaux à venir avec leur réservation éventuelle. */
export async function listUpcomingSlotsForAdmin() {
  return prisma.slot.findMany({
    where: { startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      startsAt: true,
      durationMinutes: true,
      priceCents: true,
      booking: { select: { status: true, user: { select: { name: true, email: true } } } },
    },
  });
}
