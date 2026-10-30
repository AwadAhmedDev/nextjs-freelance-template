import { expect, type Page, test } from "@playwright/test";

/** Attend que React soit chargé : sinon le clic part avant que le formulaire soit interactif. */
async function gotoReady(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

test("un visiteur crée un compte, arrive dans son espace puis se déconnecte", async ({ page }) => {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@exemple.fr`;

  await gotoReady(page, "/inscription");
  await page.getByLabel("Nom").fill("Client Test");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill("motdepasse-solide-123");
  await page.getByRole("button", { name: /créer/i }).click();

  await expect(page).toHaveURL(/\/espace/);
  await expect(page.getByRole("heading", { name: "Mon espace" })).toBeVisible();

  await page.getByRole("button", { name: /déconnexion/i }).click();
  await expect(page).toHaveURL(/\/$|\/connexion/);
});

test("une connexion avec un mauvais mot de passe affiche une erreur", async ({ page }) => {
  await gotoReady(page, "/connexion");
  await page.getByLabel("Email").fill("inconnu@exemple.fr");
  await page.getByLabel("Mot de passe").fill("mauvais-mot-de-passe");
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page.getByRole("alert")).toBeVisible();
});
