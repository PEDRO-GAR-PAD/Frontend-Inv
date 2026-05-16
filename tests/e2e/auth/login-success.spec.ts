import { expect, test } from "@playwright/test";

test("login valid redirects to inicio", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Correo:").fill("user@example.com");
  await page.getByLabel("Contrasena:").fill("Clave2026!");
  await page.getByRole("button", { name: "Iniciar Sesion" }).click();
  await expect(page.getByRole("heading", { name: "Inicio" })).toBeVisible();
});
