import { expect, test } from "@playwright/test";

test("shows actuators simulation screen", async ({ page }) => {
  await page.goto("/simulacion/actuadores");
  await expect(page.getByRole("heading", { name: "Simulacion - Actuadores" })).toBeVisible();
});
