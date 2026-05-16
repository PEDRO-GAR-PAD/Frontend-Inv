import { expect, test } from "@playwright/test";

test("navigates simulation start for available greenhouse", async ({ page }) => {
  await page.goto("/simulacion/inicio");
  await expect(page.getByRole("heading", { name: "Iniciar simulacion" })).toBeVisible();
});
