"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  type ActionResult,
  BusinessError,
  GENERIC_ERROR,
  failure,
  success,
} from "@/lib/action-result";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { isStripeConfigured } from "@/lib/stripe";
import { bookSlotSchema, createSlotSchema } from "./schema";
import { bookSlot, createSlot } from "./service";

/**
 * SERVER ACTIONS du module réservation : la porte d'entrée depuis le site.
 * Toujours le même ordre :
 *   1. Session : qui es-tu ?
 *   2. Rôle : as-tu le droit ?
 *   3. Limitation de débit
 *   4. Zod : les données sont-elles valides ?
 *   5. Service : les règles métier
 *   6. Résultat typé, ou redirection
 */

export async function bookSlotAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  // 1. Session
  const user = await getCurrentUser();
  if (!user) return failure("Connectez-vous pour réserver.");

  // 2. Rôle : tout utilisateur connecté peut réserver.

  // 3. Limitation de débit
  if (!(await rateLimit("book-slot", { limit: 5, windowSeconds: 60 }, user.id))) {
    return failure("Trop de tentatives. Réessayez dans une minute.");
  }

  // 4. Validation
  const parsed = bookSlotSchema.safeParse({ slotId: formData.get("slotId") });
  if (!parsed.success) return failure("Créneau invalide.");

  if (!isStripeConfigured()) return failure("Le paiement en ligne n'est pas encore activé.");

  // 5. Service
  let checkoutUrl: string;
  try {
    ({ checkoutUrl } = await bookSlot(user.id, parsed.data.slotId));
  } catch (error) {
    if (error instanceof BusinessError) return failure(error.message);
    console.error("bookSlotAction", error);
    return failure(GENERIC_ERROR);
  }

  // 6. Le créneau n'apparaît plus libre, puis direction la page de paiement Stripe.
  // redirect() lance une exception contrôlée : il reste hors du try/catch.
  revalidatePath("/reservation");
  redirect(checkoutUrl);
}

export async function createSlotAction(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return failure("Session expirée. Reconnectez-vous.");
  if (user.role !== "admin") return failure("Action réservée aux administrateurs.");

  const parsed = createSlotSchema.safeParse(input);
  if (!parsed.success) {
    return failure("Vérifiez le formulaire.", z.flattenError(parsed.error).fieldErrors);
  }

  try {
    await createSlot(parsed.data);
  } catch (error) {
    if (error instanceof BusinessError) return failure(error.message);
    console.error("createSlotAction", error);
    return failure(GENERIC_ERROR);
  }

  revalidatePath("/admin");
  revalidatePath("/reservation");
  return success();
}
