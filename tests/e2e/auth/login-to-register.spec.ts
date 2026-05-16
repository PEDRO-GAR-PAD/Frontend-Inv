import { expect, test } from "@playwright/test";

test("login bottom text redirects to register", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Ir a crear usuario" }).click();
  await expect(page.getByRole("heading", { name: "Crear Usuario" })).toBeVisible();
});
