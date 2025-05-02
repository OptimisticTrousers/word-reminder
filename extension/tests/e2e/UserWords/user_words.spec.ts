import path from "path";
import { test, expect } from "../fixtures";
import { goto, loginWith, testUser, VITE_API_DOMAIN } from "../helpers";
import { fileURLToPath } from "url";

test.describe("User Words page", () => {
  const word = "word";

  test.beforeEach(async ({ page, context, extensionId, request }) => {
    await context.clearCookies();
    await request.delete(`${VITE_API_DOMAIN}/testing/reset`);
    await request.post(`${VITE_API_DOMAIN}/users`, {
      data: testUser,
    });
    await goto(page, extensionId);
  });

  test("that a user word can be created", async ({ page }) => {
    const response = await loginWith(page, testUser.email, testUser.password);

    const json = await response.json();
    const user = json.user;
    const wordInput = page.getByLabel("Word", { exact: true });
    await wordInput.fill(word);
    const addButton = page.getByRole("button", { name: "Add" });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url() === `${VITE_API_DOMAIN}/users/${user.id}/userWords` &&
        response.request().method() === "POST"
    );
    await addButton.click();
    await responsePromise;

    const userWordWord = page.getByRole("heading", {
      name: word,
    });
    await expect(userWordWord).toBeVisible();
  });

  test("that the user words can be exported", async ({ page }) => {
    const response = await loginWith(page, testUser.email, testUser.password);
    const json = await response.json();
    const user = json.user;
    const wordInput = page.getByLabel("Word", { exact: true });
    await wordInput.fill(word);
    const addButton = page.getByRole("button", { name: "Add" });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url() === `${VITE_API_DOMAIN}/users/${user.id}/userWords` &&
        response.request().method() === "POST"
    );
    await addButton.click();
    await responsePromise;
    const userWordsLink = page.getByRole("link", { name: "User Words" });
    await userWordsLink.click();

    // Start waiting for download before clicking. Note no await
    const downloadPromise = page.waitForEvent("download");
    const exportWordsButton = page.getByLabel("Export Words");
    await exportWordsButton.click();
    const download = await downloadPromise;
    const readable = await download.createReadStream();

    const chunks: Buffer[] = [];

    readable.on("readable", () => {
      let chunk: Buffer;
      while (null !== (chunk = readable.read())) {
        chunks.push(chunk);
      }
    });

    readable.on("end", () => {
      const content = chunks.join("");
      expect(content).toBe(word);
    });
  });

  test("that the user words can be imported", async ({ page }) => {
    const response = await loginWith(page, testUser.email, testUser.password);
    const json = await response.json();
    const user = json.user;
    const userWordsLink = page.getByRole("link", { name: "User Words" });
    await userWordsLink.click();

    // Start waiting for file chooser before clicking. Note no await.
    const fileChooserPromise = page.waitForEvent("filechooser");
    const importWordsButton = page.getByRole("button", {
      name: "Import Words",
    });
    await importWordsButton.click();
    const fileChooser = await fileChooserPromise;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    await fileChooser.setFiles(path.join(__dirname, "words.csv"));
    const addButton = page.getByRole("button", { name: "Add" });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url() === `${VITE_API_DOMAIN}/users/${user.id}/userWords` &&
        response.request().method() === "POST"
    );
    await addButton.click();
    await responsePromise;

    const word1 = page.getByText("dispensation");
    const word2 = page.getByText("patronage");
    await expect(word1).toBeVisible();
    await expect(word2).toBeVisible();
  });

  test("that a user word can be a deleted", async ({ page }) => {
    const response = await loginWith(page, testUser.email, testUser.password);
    const json = await response.json();
    const user = json.user;
    const wordInput = page.getByLabel("Word", { exact: true });
    await wordInput.fill(word);
    const addButton = page.getByRole("button", { name: "Add" });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url() === `${VITE_API_DOMAIN}/users/${user.id}/userWords` &&
        response.request().method() === "POST"
    );
    await addButton.click();
    await responsePromise;

    const deleteButton = page.getByRole("button", {
      name: "Open delete user word modal",
      exact: true,
    });
    await deleteButton.click();
    const modalDeleteButton = page
      .getByRole("button", {
        name: "Delete",
        exact: true,
      })
      .last();
    await modalDeleteButton.click();

    const userWordDetails = page.getByText("More Word Reminder Details");
    await expect(userWordDetails).not.toBeVisible();
  });
});
