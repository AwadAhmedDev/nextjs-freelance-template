"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { bookSlotAction } from "../actions";

/**
 * Bouton "Réserver" : appelle la Server Action.
 * - Pendant l'envoi, le bouton est désactivé (pas de double clic)
 * - En cas d'erreur, le message s'affiche sous le bouton
 * - En cas de succès, la Server Action redirige vers la page de paiement Stripe
 */
export function BookSlotButton({ slotId }: { slotId: string }) {
  const [state, formAction, pending] = useActionState(bookSlotAction, null);

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="slotId" value={slotId} />
      <Button type="submit" disabled={pending}>
        {pending ? "Réservation…" : "Réserver"}
      </Button>
      {state && !state.ok && <FormMessage>{state.error}</FormMessage>}
    </form>
  );
}
