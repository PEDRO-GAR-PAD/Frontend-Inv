import { expect, test } from "@playwright/test";

test("register valid redirects to inicio", async ({ page }) => {
  await page.goto("/crear-usuario");
  await page.getByLabel("Correo:").fill("new@example.com");
  await page.getByLabel("Contrasena:").fill("Clave2026!");
  await page.getByRole("button", { name: "Crear usuario" }).click();
  await expect(page.getByRole("heading", { name: "Inicio" })).toBeVisible();
});
