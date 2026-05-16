import { expect, test } from "@playwright/test";

test("menu shows exit button", async ({ page }) => {
  await page.goto("/simulacion/dashboard");
  await expect(page.getByRole("button", { name: "Salir del invernadero" })).toBeVisible();
});
