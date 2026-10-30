import { z } from "zod";

/**
 * Schémas Zod du module "réservation".
 * Le MÊME schéma sert au formulaire (navigateur) et à la Server Action (serveur) :
 * la règle est écrite une seule fois.
 */

export const bookSlotSchema = z.object({
  slotId: z.string().min(1, "Créneau manquant").max(64),
});

export const createSlotSchema = z.object({
  // Envoyé au format ISO par le formulaire (déjà converti depuis l'heure locale du navigateur).
  startsAt: z.iso.datetime({ message: "Date invalide" }),
  durationMinutes: z.coerce
    .number({ message: "Durée invalide" })
    .int()
    .min(15, "15 minutes minimum")
    .max(480, "8 heures maximum"),
  priceEuros: z.coerce
    .number({ message: "Prix invalide" })
    .positive("Le prix doit être positif")
    .max(10_000, "Prix trop élevé"),
});

export type BookSlotInput = z.infer<typeof bookSlotSchema>;
export type CreateSlotInput = z.infer<typeof createSlotSchema>;
