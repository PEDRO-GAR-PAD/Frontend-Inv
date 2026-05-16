import { expect, test } from "@playwright/test";

test("shows climate events simulation screen", async ({ page }) => {
  await page.goto("/simulacion/eventos");
  await expect(page.getByRole("heading", { name: "Simulacion - Eventos climaticos" })).toBeVisible();
});
