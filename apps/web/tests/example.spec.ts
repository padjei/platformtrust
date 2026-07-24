import { test, expect } from "@playwright/test";

test.skip("home page renders the AI PlatformTrust heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "AI PlatformTrust" })).toBeVisible();
});
