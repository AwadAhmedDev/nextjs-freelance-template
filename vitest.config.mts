import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Tests unitaires : règles métier, schémas Zod, utilitaires.
 * Lancement : `pnpm test` (une fois) ou `pnpm test:watch` (en continu).
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Comprend les imports "@/..." définis dans tsconfig.json.
    tsconfigPaths: true,
    alias: {
      // "server-only" bloque l'import hors de Next.js : neutralisé dans les tests.
      "server-only": new URL("./tests/stubs/server-only.ts", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "tests/unit/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    env: { SKIP_ENV_VALIDATION: "1" },
  },
});
