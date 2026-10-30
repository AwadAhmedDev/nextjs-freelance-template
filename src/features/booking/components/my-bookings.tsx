import Link from "next/link";
import type { BookingStatus } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/session";
import { formatCents, formatDateTime } from "@/lib/utils";
import { listUserBookings } from "../queries";

const statusLabels: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "En attente de paiement",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
};

/** Lit la session : doit rester dans un <Suspense>. */
export async function MyBookings() {
  const user = await requireUser();
  const bookings = await listUserBookings(user.id);

  return (
    <div className="grid gap-4">
      <p>Bonjour {user.name}.</p>
      {bookings.length === 0 ? (
        <p className="text-muted-foreground">
          Aucune réservation pour le moment.{" "}
          <Link href="/reservation" className="underline">
            Réserver un créneau
          </Link>
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {bookings.map((booking) => (
            <li key={booking.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <span className="first-letter:uppercase">
                {formatDateTime(booking.slot.startsAt)}
              </span>
              <span className="text-muted-foreground text-sm">
                Acompte {formatCents(booking.depositCents)} · {statusLabels[booking.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
