import { connection } from "next/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeDepositCents } from "@/features/booking/rules";
import { formatCents, formatDateTime } from "@/lib/utils";
import { listAvailableSlots } from "../queries";
import { BookSlotButton } from "./book-slot-button";

/**
 * Liste des créneaux libres, lue à chaque requête.
 * `connection()` indique à Next.js que ces données ne doivent pas être figées au build.
 * Ce composant doit être placé dans un <Suspense>.
 */
export async function AvailableSlots() {
  await connection();
  const slots = await listAvailableSlots();

  if (slots.length === 0) {
    return <p className="text-muted-foreground">Aucun créneau disponible pour le moment.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {slots.map((slot) => (
        <li key={slot.id}>
          <Card>
            <CardHeader>
              <CardTitle className="first-letter:uppercase">
                {formatDateTime(slot.startsAt)}
              </CardTitle>
              <CardDescription>
                {slot.durationMinutes} min · {formatCents(slot.priceCents)} · acompte{" "}
                {formatCents(computeDepositCents(slot.priceCents))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookSlotButton slotId={slot.id} />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
