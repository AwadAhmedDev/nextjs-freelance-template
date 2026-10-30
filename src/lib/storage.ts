import "server-only";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

/**
 * Stockage objet compatible S3 : Amazon S3, Cloudflare R2, Scaleway...
 * Les fichiers ne sont JAMAIS écrits sur le disque du serveur :
 * le navigateur les envoie directement au stockage avec une URL présignée.
 */
let client: S3Client | null = null;

export function isStorageConfigured() {
  return Boolean(
    env.S3_ENDPOINT && env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY,
  );
}

function getClient() {
  if (!isStorageConfigured()) {
    throw new Error("Le stockage n'est pas configuré : renseigne les variables S3_* dans .env.");
  }
  client ??= new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    // Adresse du type https://endpoint/bucket/cle : une seule origine à autoriser dans la CSP.
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID!,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
    },
  });
  return client;
}

/**
 * Crée une autorisation d'envoi temporaire pour UN fichier.
 * Le type et la taille sont signés : le stockage refuse un autre fichier.
 */
export async function createPresignedUpload(params: {
  key: string;
  contentType: string;
  size: number;
  expiresInSeconds?: number;
}) {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: params.key,
    ContentType: params.contentType,
    ContentLength: params.size,
  });
  const url = await getSignedUrl(getClient(), command, {
    expiresIn: params.expiresInSeconds ?? 300,
  });
  return { url, key: params.key };
}

/** Adresse publique d'un fichier (domaine public du bucket ou CDN). */
export function publicFileUrl(key: string) {
  if (!env.S3_PUBLIC_ORIGIN) return null;
  return `${env.S3_PUBLIC_ORIGIN.replace(/\/$/, "")}/${key}`;
}
