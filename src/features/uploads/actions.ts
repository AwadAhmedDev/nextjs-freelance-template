"use server";

import { type ActionResult, GENERIC_ERROR, failure, success } from "@/lib/action-result";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { createPresignedUpload, isStorageConfigured, publicFileUrl } from "@/lib/storage";
import { ALLOWED_UPLOAD_TYPES, uploadRequestSchema } from "./schema";

/**
 * Étape 1 de l'envoi d'un fichier : le navigateur demande une autorisation.
 * Le serveur vérifie tout, puis renvoie une URL présignée valable 5 minutes.
 * Étape 2 (navigateur) : envoi direct du fichier au stockage avec cette URL.
 * Étape 3 : enregistre la clé du fichier en base, dans l'action métier concernée.
 *
 * Ici, réservé aux administrateurs. Adapte la règle selon le projet.
 */
export async function createUploadUrlAction(
  input: unknown,
): Promise<ActionResult<{ uploadUrl: string; key: string; publicUrl: string | null }>> {
  const user = await getCurrentUser();
  if (!user) return failure("Session expirée. Reconnectez-vous.");
  if (user.role !== "admin") return failure("Action réservée aux administrateurs.");

  if (!(await rateLimit("upload", { limit: 20, windowSeconds: 60 }, user.id))) {
    return failure("Trop d'envois. Réessayez dans une minute.");
  }

  const parsed = uploadRequestSchema.safeParse(input);
  if (!parsed.success) return failure(parsed.error.issues[0]?.message ?? "Fichier invalide.");

  if (!isStorageConfigured()) return failure("Le stockage de fichiers n'est pas encore activé.");

  // Nom généré par le serveur : jamais le nom fourni par l'utilisateur.
  const extension = ALLOWED_UPLOAD_TYPES[parsed.data.contentType];
  const key = `uploads/${crypto.randomUUID()}.${extension}`;

  try {
    const { url } = await createPresignedUpload({
      key,
      contentType: parsed.data.contentType,
      size: parsed.data.size,
    });
    return success({ uploadUrl: url, key, publicUrl: publicFileUrl(key) });
  } catch (error) {
    console.error("createUploadUrlAction", error);
    return failure(GENERIC_ERROR);
  }
}
