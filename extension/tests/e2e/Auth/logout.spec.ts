import { test, expect } from "../fixtures";
import { VITE_API_DOMAIN, goto, loginWith, testUser } from "../helpers";

test.describe("Logout", () => {
  test.beforeEach(async ({ page, context, request, extensionId }) => {
    await context.clearCookies();
    await request.delete(`${VITE_API_DOMAIN}/testing/reset`);
    await request.post(`${VITE_API_DOMAIN}/users`, {
      data: testUser,
    });
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
