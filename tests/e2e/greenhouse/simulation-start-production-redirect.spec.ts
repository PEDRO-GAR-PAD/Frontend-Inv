import { expect, test } from "@playwright/test";

test("production greenhouse entry redirects to actuators screen", async ({ page }) => {
  await page.goto("/simulacion/actuadores");
  await expect(page.getByRole("heading", { name: "Simulacion - Actuadores" })).toBeVisible();
});
