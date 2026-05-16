import { expect, test } from "@playwright/test";

test("navigates with persistent topbar and menu", async ({ page }) => {
  await page.goto("/inicio");

  await expect(page.getByLabel("Barra principal de gestion")).toBeVisible();
  await expect(page.getByText("usuario@invernadero.local")).toBeVisible();

  await page.getByRole("button", { name: "Abrir menu principal" }).click();
  await page.getByRole("button", { name: "Invernadero" }).click();
  await expect(page.getByRole("heading", { name: "Invernadero" })).toBeVisible();

  await page.getByRole("button", { name: "Abrir menu principal" }).click();
  await page.getByRole("button", { name: "Cosecha" }).click();
  await expect(page.getByRole("heading", { name: "Cosecha" })).toBeVisible();
});
