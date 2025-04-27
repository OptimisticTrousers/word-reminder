import { type Page } from "@playwright/test";

export async function loginWith(page: Page, email: string, password: string) {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url() === `${VITE_API_DOMAIN}/sessions` &&
      response.request().method() === "POST"
  );
  await page.getByLabel("Email (required)").fill(email);
  await page.getByLabel("Password (required)").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  const response = await responsePromise;
  return response;
}

export async function registerWith(
  page: Page,
  email: string,
  password: string
) {
  await page.getByLabel("Email (required)").fill(email);
  await page.getByLabel("Password (required)").fill(password);
  await page.getByRole("button", { name: "Signup" }).click();
}

export async function goto(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/index.html?popup=false`);
}

export const VITE_API_DOMAIN = "http://localhost:5000/api";
