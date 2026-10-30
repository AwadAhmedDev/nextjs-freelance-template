import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
// HTTPS seulement si l'URL publique est en https (évite de casser un test local en http).
const isHttps = (process.env.NEXT_PUBLIC_APP_URL ?? "").startsWith("https://");

/**
 * Origines externes autorisées par la Content Security Policy.
 * - Le stockage objet (upload direct depuis le navigateur avec une URL présignée)
 * - Stripe Checkout (redirection après une Server Action)
 * Ajoute ici les domaines d'un nouveau service externe, jamais "*".
 *
 * Attention : ces en-têtes sont calculés au moment du BUILD.
 * En Docker, S3_ENDPOINT et S3_PUBLIC_ORIGIN doivent donc être passés en arguments de build.
 */
function originOf(url: string | undefined) {
  if (!url) return "";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

// Envoi des fichiers : le navigateur appelle directement le stockage (S3_ENDPOINT).
const uploadOrigin = originOf(process.env.S3_ENDPOINT);
// Affichage des fichiers : domaine public du bucket ou CDN.
const publicFilesOrigin = originOf(process.env.S3_PUBLIC_ORIGIN);

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${publicFilesOrigin}`.trim(),
  "font-src 'self'",
  `connect-src 'self' ${uploadOrigin}`.trim(),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  ...(isHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // HSTS : Caddy sert déjà le site en HTTPS. N'active une durée plus longue
  // (et "preload") qu'une fois le domaine définitif en place.
  ...(isHttps
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
    : []),
];

const nextConfig: NextConfig = {
  // Image Docker légère : seuls les fichiers nécessaires sont copiés.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
