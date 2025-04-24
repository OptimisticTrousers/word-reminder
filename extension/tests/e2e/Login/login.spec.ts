import { test, expect } from "@playwright/test";

import { createBrowserContext } from "../helpers";

test.describe("Login page", () => {
  let browser;

  test.beforeEach(async () => {
    browser = await createBrowserContext();
  });

  test.afterEach(async () => {
    await browser.close();
    browser = undefined;
  });

  test("form is shown", async () => {
    const page = await browser.newPage();
    await page.goto(
      "chrome-extension://okplhmjkgoekmcnjbjjglmnpanfkgdfa/index.html?popup=false"
    );

    const email = await page.getByLabel("Email (required)");
    const password = await page.getByLabel("Password (required)");
    const loginButton = await page.getByRole("button", { name: "Login" });
    const createAccountLink = await page.getByRole("link", {
      name: "Create account",
    });
    const forgotPasswordLink = await page.getByRole("link", {
      name: "Forgot Password?",
    });

    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await expect(loginButton).toBeVisible();
    await expect(createAccountLink).toBeVisible();
    await expect(forgotPasswordLink).toBeVisible();
  });
});
