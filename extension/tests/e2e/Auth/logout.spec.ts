import { test, expect } from "../fixtures";
import { VITE_API_DOMAIN, goto, loginWith, testUser } from "../helpers";

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Logout", () => {
  test.beforeEach(async ({ page, context, extensionId }) => {
    await context.clearCookies();
    await goto(page, extensionId);
  });

  test("user logout", async ({ page }) => {
    await loginWith(page, testUser.email, testUser.password);

    const logoutButton = page.getByRole("button", { name: "Log Out" });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url() === `${VITE_API_DOMAIN}/sessions` &&
        response.request().method() === "DELETE"
    );
    await logoutButton.click();
    await responsePromise;

    const loginButton = page.getByRole("button", { name: "Login" });
    await expect(loginButton).toBeVisible();
  });
});
