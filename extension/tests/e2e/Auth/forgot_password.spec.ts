import { test, expect } from "../fixtures";
import { VITE_API_DOMAIN, goto } from "../helpers";

const testUser = {
  email: "testuser@protonmail.com",
  password: "password",
};

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

  test("submitting request to reset password", async ({ page, request }) => {
    await request.post(`${VITE_API_DOMAIN}/users`, {
      data: testUser,
    });

    const email = page.getByLabel("Email");
    await email.fill("testuser@protonmail.com");
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
