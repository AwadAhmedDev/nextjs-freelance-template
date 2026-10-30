import { requireAdmin } from "@/lib/session";
import { formatCents, formatDateTime } from "@/lib/utils";
import { listUpcomingSlotsForAdmin } from "../queries";

/** Lit la session (admin uniquement) : doit rester dans un <Suspense>. */
export async function AdminSlots() {
  await requireAdmin();
  const slots = await listUpcomingSlotsForAdmin();

  if (slots.length === 0) return <p className="text-muted-foreground">Aucun créneau à venir.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left">
          <tr>
            <th className="p-3 font-medium">Créneau</th>
            <th className="p-3 font-medium">Prix</th>
            <th className="p-3 font-medium">Réservation</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {slots.map((slot) => (
            <tr key={slot.id}>
              <td className="p-3 first-letter:uppercase">
                {formatDateTime(slot.startsAt)} · {slot.durationMinutes} min
              </td>
              <td className="p-3 tabular-nums">{formatCents(slot.priceCents)}</td>
              <td className="p-3">
                {slot.booking
                  ? `${slot.booking.user.name} (${slot.booking.user.email}) · ${
                      slot.booking.status === "CONFIRMED" ? "confirmée" : "en attente"
                    }`
                  : "Libre"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
