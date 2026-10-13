import { expect, test } from "@playwright/test";

test("shows the ModaStore dashboard foundation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Menu principal" }),
  ).toBeVisible();
});
