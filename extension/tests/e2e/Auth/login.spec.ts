import { test, expect } from "../fixtures";
import { goto, loginWith, testUser } from "../helpers";

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login page", () => {
  test.beforeEach(async ({ page, context, extensionId }) => {
    await context.clearCookies();
    await goto(page, extensionId);
  });

  test("login form is shown", async ({ page }) => {
    const email = page.getByLabel("Email (required)");
    const password = page.getByLabel("Password (required)");
    const loginButton = page.getByRole("button", { name: "Login" });
    const createAccountLink = page.getByRole("link", {
      name: "Create account",
    });
    const forgotPasswordLink = page.getByRole("link", {
      name: "Forgot Password?",
    });

    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await expect(loginButton).toBeVisible();
    await expect(createAccountLink).toBeVisible();
    await expect(forgotPasswordLink).toBeVisible();
  });

  test.describe("logging in", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await loginWith(page, testUser.email, testUser.password);

      const notification = page.getByRole("dialog", {
        name: `You have successfully logged in, ${testUser.email}.`,
      });
      await expect(notification).toBeVisible();
    });

    test("fails with wrong credentials", async ({ page }) => {
      await loginWith(page, "wrong@email.com", testUser.password);

      const notification = page.getByRole("dialog", {
        name: "Your credentials are incorrect. Please log in again.",
      });
      await expect(notification).toBeVisible();
    });
  });
});
