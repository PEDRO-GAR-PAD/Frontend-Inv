import { expect, test } from "@playwright/test";

test("validates crop ranges and then saves", async ({ page }) => {
  await page.goto("/cosecha");

  await page.getByLabel("Nombre de cosecha").fill("Tomate");
  await page.locator("#temperature-min").fill("30");
  await page.locator("#temperature-max").fill("20");
  await page.locator("#humidity-min").fill("40");
  await page.locator("#humidity-max").fill("70");
  await page.locator("#light-min").fill("1000");
  await page.locator("#light-max").fill("1800");
  await page.getByRole("button", { name: "Guardar cosecha" }).click();

  await expect(page.getByText("Temperatura: el minimo debe ser menor al maximo")).toBeVisible();

  await page.locator("#temperature-min").fill("16");
  await page.locator("#temperature-max").fill("24");
  await page.getByRole("button", { name: "Guardar cosecha" }).click();

  await expect(page.getByText("Cosecha configurada correctamente.")).toBeVisible();
});
