"use client";

import { useState } from "react";
import { FormMessage } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUploadUrlAction } from "../actions";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "../schema";

/**
 * Envoi d'une image en 2 temps :
 *   1. Server Action : vérifie les droits, le type et la taille, renvoie une URL présignée
 *   2. Le navigateur envoie le fichier DIRECTEMENT au stockage (il ne passe pas par le serveur)
 * `onUploaded` reçoit la clé du fichier : enregistre-la en base dans ton action métier.
 *
 * Optimisation des images : affiche-les avec le composant <Image> de Next.js,
 * qui les redimensionne et les compresse automatiquement (avec sharp).
 */
export function ImageUpload({
  onUploaded,
}: {
  onUploaded?: (file: { key: string; publicUrl: string | null }) => void;
}) {
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string }>();
  const [uploading, setUploading] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus(undefined);

    if (file.size > MAX_UPLOAD_BYTES) {
      setStatus({ type: "error", text: "Fichier trop lourd (5 Mo maximum)." });
      return;
    }

    setUploading(true);
    try {
      // 1. Demander l'autorisation au serveur
      const result = await createUploadUrlAction({ contentType: file.type, size: file.size });
      if (!result.ok) {
        setStatus({ type: "error", text: result.error });
        return;
      }

      // 2. Envoyer le fichier directement au stockage
      const response = await fetch(result.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) {
        setStatus({ type: "error", text: "L'envoi a échoué. Réessayez." });
        return;
      }

      setStatus({ type: "success", text: "Image envoyée." });
      onUploaded?.({ key: result.data.key, publicUrl: result.data.publicUrl });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="image-upload">Image (JPEG, PNG ou WebP, 5 Mo max.)</Label>
      <Input
        id="image-upload"
        type="file"
        accept={Object.keys(ALLOWED_UPLOAD_TYPES).join(",")}
        disabled={uploading}
        onChange={handleChange}
      />
      <FormMessage type={status?.type}>{uploading ? undefined : status?.text}</FormMessage>
    </div>
  );
}
