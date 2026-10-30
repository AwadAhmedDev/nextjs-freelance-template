import { z } from "zod";

/** Types de fichiers acceptés et extension associée. Ajoute ici les types utiles au projet. */
export const ALLOWED_UPLOAD_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 Mo

export const uploadRequestSchema = z.object({
  contentType: z.enum(Object.keys(ALLOWED_UPLOAD_TYPES) as [keyof typeof ALLOWED_UPLOAD_TYPES], {
    message: "Format non accepté (JPEG, PNG ou WebP).",
  }),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES, "Fichier trop lourd (5 Mo maximum)."),
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;
