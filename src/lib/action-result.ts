/**
 * Format de réponse unique pour toutes les Server Actions et tous les services.
 * L'interface sait toujours quoi afficher : un succès, ou un message d'erreur
 * lisible par l'utilisateur (jamais un détail technique).
 */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export function success(): ActionResult<undefined>;
export function success<T>(data: T): ActionResult<T>;
export function success<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function failure(
  error: string,
  fieldErrors?: Record<string, string[] | undefined>,
): { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> } {
  return { ok: false, error, fieldErrors };
}

/**
 * Erreur métier attendue (créneau déjà pris, date passée...).
 * Les services la lancent ; les Server Actions la transforment en message.
 * Toute autre erreur est une erreur technique : on l'envoie à la surveillance
 * et l'utilisateur voit un message générique.
 */
export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessError";
  }
}

export const GENERIC_ERROR = "Une erreur est survenue. Réessaie dans quelques instants.";
