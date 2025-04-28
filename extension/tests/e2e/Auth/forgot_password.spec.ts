import { test, expect } from "../fixtures";
import { goto, testUser } from "../helpers";

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Forgot password page", () => {
  test.beforeEach(async ({ page, extensionId }) => {
    await goto(page, extensionId);
    const forgotPasswordLink = page.getByRole("link", {
      name: "Forgot Password?",
    });
    await forgotPasswordLink.click();
  });

  test("forgot password form is shown", async ({ page }) => {
    const email = page.getByLabel("Email");
    const sendVerificationButton = page.getByRole("button", {
      name: "Send verification email",
    });
    const loginLink = page.getByRole("link", { name: "Go back to login" });

    await expect(email).toBeVisible();
    await expect(sendVerificationButton).toBeVisible();
    await expect(loginLink).toBeVisible();
  });

  test("submitting request to reset password", async ({ page }) => {
    const email = page.getByLabel("Email");
    await email.fill(testUser.email);
    const sendVerificationEmailButton = page.getByRole("button", {
      name: "Send verification email",
    });
    await sendVerificationEmailButton.click();

    const notification = page.getByRole("dialog", {
      name: `A confirmation email was sent to your email to reset your password.`,
    });
    await expect(notification).toBeVisible();
  });
});
