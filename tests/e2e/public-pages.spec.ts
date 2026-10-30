import { expect, test } from "@playwright/test";

test("la page d'accueil s'affiche avec un titre principal", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("les pages légales sont accessibles", async ({ page }) => {
  for (const path of ["/mentions-legales", "/confidentialite"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
  }
});

test("une page inconnue renvoie 404", async ({ page }) => {
  const response = await page.goto("/cette-page-n-existe-pas");
  expect(response?.status()).toBe(404);
});

test("l'espace client redirige vers la connexion", async ({ page }) => {
  await page.goto("/espace");
  await expect(page).toHaveURL(/\/connexion/);
});

test("les en-têtes de sécurité sont présents", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-powered-by"]).toBeUndefined();
});
