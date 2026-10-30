import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combine des classes Tailwind sans conflit (utilisé par les composants shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const euroFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/** 1050 → "10,50 €". Les montants sont toujours stockés en centimes. */
export function formatCents(cents: number) {
  return euroFormatter.format(cents / 100);
}

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

/** Date lisible en français, toujours à l'heure de Paris (le serveur peut être en UTC). */
export function formatDateTime(date: Date) {
  return dateTimeFormatter.format(date);
}
