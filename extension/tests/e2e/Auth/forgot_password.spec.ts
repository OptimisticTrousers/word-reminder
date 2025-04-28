import { test, expect } from "../fixtures";
import { goto, testUser, VITE_API_DOMAIN } from "../helpers";

test.describe("Forgot password page", () => {
  test.beforeEach(async ({ page, context, request, extensionId }) => {
    await context.clearCookies();
    await request.delete(`${VITE_API_DOMAIN}/testing/reset`);
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

  test("submitting request to reset password when user exists", async ({ page, request }) => {
    await request.post(`${VITE_API_DOMAIN}/users`, {
      data: testUser,
    });

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

  test("submitting request to reset password even when user does not exist", async ({
    page,
  }) => {
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
