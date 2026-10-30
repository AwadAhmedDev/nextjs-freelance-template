import { defineConfig, devices } from "@playwright/test";

/**
 * Tests de bout en bout : un vrai navigateur clique dans l'application.
 * En local : `pnpm build && pnpm test:e2e` (base de données lancée et migrée).
 * En CI : voir .github/workflows/ci.yml.
 */
const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    // Optionnel : utiliser un Chromium déjà installé au lieu de `playwright install`.
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // Démarre l'application compilée si aucune URL externe n'est fournie.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "pnpm start",
        url: `${baseURL}/api/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
