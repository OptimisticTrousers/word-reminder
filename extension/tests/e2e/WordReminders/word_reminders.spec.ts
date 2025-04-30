import { test, expect } from "../fixtures";
import { goto, loginWith, testUser, VITE_API_DOMAIN } from "../helpers";

test.describe("Word Reminder page", () => {
  const word = "word";

  test.beforeEach(async ({ page, context, extensionId, request }) => {
    await context.clearCookies();
    await request.delete(`${VITE_API_DOMAIN}/testing/reset`);
    await request.post(`${VITE_API_DOMAIN}/users`, {
      data: testUser,
    });
    await goto(page, extensionId);
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
    const wordRemindersLink = page.getByRole("link", {
      name: "Word Reminders",
    });
    await wordRemindersLink.click();
  });

  test.describe("Auto Word Reminders", () => {
    test("that a word reminder is created when user chooses to create a word reminder immediately which is the default option", async ({
      page,
      extensionId,
    }) => {
      const createAutoWordReminderButton = page.getByRole("button", {
        name: "Create Auto Word Reminder",
        exact: true,
      });
      await createAutoWordReminderButton.click();
      const reminder = page.getByLabel("Reminder", { exact: true });
      await reminder.fill("* * * * *"); // every minute
      const weeks = page.getByLabel("Weeks");
      await weeks.fill("1");
      const wordCount = page.getByLabel("Word Count");
      await wordCount.fill("7");
      const createButton = page.getByRole("button", {
        name: "Create",
        exact: true,
      });
      await createButton.click();

      await goto(page, extensionId);
      const wordRemindersLink = page.getByRole("link", {
        name: "Word Reminders",
      });
      await wordRemindersLink.click();

      const wordReminderDetails = page.getByText("More Word Reminder Details");
      await expect(wordReminderDetails).toBeVisible();
    });

    test("that a word reminder is created based on the duration (every 1 minute) when the user chooses not to create a word reminder immediately", async ({
      page,
      extensionId,
    }) => {
      const createAutoWordReminderButton = page.getByRole("button", {
        name: "Create Auto Word Reminder",
        exact: true,
      });
      await createAutoWordReminderButton.click();
      const reminder = page.getByLabel("Reminder", { exact: true });
      await reminder.fill("* * * * *"); // every minute
      const weeks = page.getByLabel("Minutes");
      await weeks.fill("1");
      const wordCount = page.getByLabel("Word Count");
      await wordCount.fill("7");
      const createNow = page.getByLabel("Create Now");
      await createNow.click();
      const createButton = page.getByRole("button", {
        name: "Create",
        exact: true,
      });
      await createButton.click();

      await page.waitForTimeout(61000); // wait 61 seconds to prevent flakiness and race conditions
      await goto(page, extensionId);
      const wordRemindersLink = page.getByRole("link", {
        name: "Word Reminders",
      });
      await wordRemindersLink.click();

      const wordReminderDetails = page.getByText("More Word Reminder Details");
      await expect(wordReminderDetails).toBeVisible();
    });
  });

  test.describe("Word Reminders", () => {
    test("that a word reminder is created when the user creates one", async ({
      page,
    }) => {
      const createWordReminderButton = page.getByRole("button", {
        name: "Create Word Reminder",
      });
      await createWordReminderButton.click();

      const reminder = page.getByLabel("Reminder", { exact: true });
      await reminder.fill("* * * * *"); // every minute
      const finish = page.getByLabel("Finish");
      const numWeeks = 1;
      const date = new Date();
      date.setDate(date.getDate() + numWeeks * 7);
      await finish.fill(date.toISOString().split("T")[0]);
      const userWords = page.getByLabel("User Words");
      await userWords.fill(word);
      const createButton = page.getByRole("button", {
        name: "Create",
        exact: true,
      });
      await createButton.click();

      const wordReminderDetails = page.getByText("More Word Reminder Details");
      await expect(wordReminderDetails).toBeVisible();
    });
  });
});
