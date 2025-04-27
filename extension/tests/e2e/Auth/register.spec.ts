import { test, expect } from "../fixtures";
import { VITE_API_DOMAIN, goto, registerWith } from "../helpers";

const testUser = {
  email: "testuser@protonmail.com",
  password: "password",
};

test.describe("Register page", () => {
  test.beforeEach(async ({ page, context, extensionId }) => {
    await context.clearCookies();
    await goto(page, extensionId);
    const createAccountLink = page.getByRole("link", {
      name: "Create account",
    });
    await createAccountLink.click();
  });

  test("register form is shown", async ({ page }) => {
    const email = page.getByLabel("Email (required)");
    const password = page.getByLabel("Password (required)");
    const signupButton = page.getByRole("button", { name: "Signup" });
    const loginLink = page.getByRole("link", {
      name: "Login",
    });
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await expect(signupButton).toBeVisible();
    await expect(loginLink).toBeVisible();
  });

  test.describe("registering", () => {
    test.beforeEach(async ({ request }) => {
      await request.delete(`${VITE_API_DOMAIN}/testing/reset`);
    });

    test("succeeds when the user does not already exist", async ({ page }) => {
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url() === `${VITE_API_DOMAIN}/sessions` &&
          response.request().method() === "POST"
      );
      await registerWith(page, testUser.email, testUser.password);
      await responsePromise;

      const notification = page.getByRole("dialog", {
        name: `You have successfully signed in, ${testUser.email}.`,
      });
      await expect(notification).toBeVisible();
    });

    test("fails when the user already exists", async ({ page, request }) => {
      await request.post(`${VITE_API_DOMAIN}/users`, {
        data: testUser,
      });

      const responsePromise = page.waitForResponse(
        (response) =>
          response.url() === `${VITE_API_DOMAIN}/users` &&
          response.request().method() === "POST"
      );
      await registerWith(page, testUser.email, testUser.password);
      await responsePromise;

      const notification = page.getByRole("dialog", {
        name: `Errors: E-mail already in use.`,
      });
      await expect(notification).toBeVisible();
    });
  });
});
