import { test, expect } from "../fixtures";
import { goto, loginWith, testUser, VITE_API_DOMAIN } from "../helpers";

test.describe("Settings page", () => {
  let user;
  test.beforeEach(async ({ page, request, extensionId }) => {
    await request.delete(`${VITE_API_DOMAIN}/testing/reset`);
    const response = await request.post(`${VITE_API_DOMAIN}/users`, {
      data: testUser,
    });
    const json = await response.json();
    user = json.user;
    await goto(page, extensionId);
    await loginWith(page, testUser.email, testUser.password);
    const settingsLink = page.getByRole("link", { name: "Settings" });
    await settingsLink.click();
  });

  test("submitting request to change email ", async ({ page }) => {
    const changeEmailButton = page.getByRole("button", {
      name: "Change Email",
    });
    await changeEmailButton.click();

    const notification = page.getByRole("dialog", {
      name: "A confirmation email was sent to your email to update your email.",
    });
    await expect(notification).toBeVisible();
  });

  test("submitting request to change password", async ({ page }) => {
    const changePasswordButton = page.getByRole("button", {
      name: "Change Password",
    });
    await changePasswordButton.click();

    const notification = page.getByRole("dialog", {
      name: "A confirmation email was sent to your email to update your password.",
    });
    await expect(notification).toBeVisible();
  });

  test("submitting request to delete user", async ({ page }) => {
    const deleteUserButton = page.getByRole("button", {
      name: "Delete User",
      exact: true,
    });
    await deleteUserButton.click();

    const deleteUserModalButton = page.getByRole("button", {
      name: "Delete",
      exact: true,
    });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url() === `${VITE_API_DOMAIN}/users/${user.id}` &&
        response.request().method() === "DELETE"
    );
    await deleteUserModalButton.click();
    await responsePromise;

    const loginButton = page.getByRole("button", { name: "Login" });
    await expect(loginButton).toBeVisible();
  });
});
