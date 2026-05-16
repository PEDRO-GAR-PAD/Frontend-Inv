import { expect, test } from "@playwright/test";

test("creates greenhouse with valid checklist", async ({ page }) => {
  await page.goto("/invernadero");

  await page.getByLabel("Nombre").fill("Invernadero Norte");
  await page.getByLabel("Ubicacion").fill("Valle 2");
  await page.getByLabel("Humedad").check();
  await page.getByLabel("Riego").check();
  await page.getByRole("button", { name: "Crear invernadero" }).click();

  await expect(page.getByText("Invernadero creado correctamente.")).toBeVisible();
});
