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
    test("that a word reminder is created when the user chooses to create a word reminder immediately which is the default option", async ({
      page,
      extensionId,
    }) => {
      const createAutoWordReminderButton = page.getByRole("button", {
        name: "Create Auto Word Reminder",
        exact: true,
      });
      await createAutoWordReminderButton.click();
      const reminder = page.getByLabel("Reminder", { exact: true });
      const weeks = page.getByLabel("Weeks");
      const wordCount = page.getByLabel("Word Count");
      const createButton = page.getByRole("button", {
        name: "Create",
        exact: true,
      });

      await reminder.fill("0 */2 * * *"); // every 2 hours
      await weeks.fill("1");
      await wordCount.fill("7");
      await createButton.click();
      await page.waitForTimeout(10000); // wait 10 seconds to wait for word reminder to be created.
      await goto(page, extensionId);
      const wordRemindersLink = page.getByRole("link", {
        name: "Word Reminders",
      });
      await wordRemindersLink.click();

      const autoWordReminderHeading = page.getByRole("heading", {
        name: "Auto Word Reminder",
        exact: true,
      });
      const wordReminderDetails = page.getByText("Word Reminder Details");
      await expect(autoWordReminderHeading).toBeVisible();
      await expect(wordReminderDetails).toBeVisible();
      await expect(createAutoWordReminderButton).not.toBeVisible();
    });

    test("that a word reminder is created when the user chooses to create a word reminder immediately when updating which is the default option", async ({
      page,
      extensionId,
    }) => {
      const createAutoWordReminderButton = page.getByRole("button", {
        name: "Create Auto Word Reminder",
        exact: true,
      });
      await createAutoWordReminderButton.click();
      const reminder = page.getByLabel("Reminder", { exact: true });
      const weeks = page.getByLabel("Weeks");
      const wordCount = page.getByLabel("Word Count");
      const createButton = page.getByRole("button", {
        name: "Create",
        exact: true,
      });
      await reminder.fill("0 */2 * * *"); // every 2 hours
      await weeks.fill("1");
      await wordCount.fill("7");
      await page.getByLabel("Create Now").click(); // clicking sets create now to false
      await createButton.click();

      const updateButton = page.getByRole("button", {
        name: "Update",
        exact: true,
      });
      await updateButton.click();
      const modalUpdateButton = page
        .getByRole("button", {
          name: "Update",
          exact: true,
        })
        .last();
      await modalUpdateButton.click();
      await page.waitForTimeout(10000); // wait 10 seconds to wait for word reminder to be created.
      await goto(page, extensionId);
      const wordRemindersLink = page.getByRole("link", {
        name: "Word Reminders",
      });
      await wordRemindersLink.click();

      const autoWordReminderHeading = page.getByRole("heading", {
        name: "Auto Word Reminder",
        exact: true,
      });
      const wordReminderDetails = page.getByText("Word Reminder Details");
      await expect(autoWordReminderHeading).toBeVisible();
      await expect(wordReminderDetails).toBeVisible();
      await expect(createAutoWordReminderButton).not.toBeVisible();
    });

    test("that a word reminder is not created when the user does not choose to create a word reminder immediately", async ({
      page,
    }) => {
      const createAutoWordReminderButton = page.getByRole("button", {
        name: "Create Auto Word Reminder",
        exact: true,
      });
      await createAutoWordReminderButton.click();
      const reminder = page.getByLabel("Reminder", { exact: true });
      const weeks = page.getByLabel("Weeks");
      const wordCount = page.getByLabel("Word Count");
      const createNow = page.getByLabel("Create Now");
      const createButton = page.getByRole("button", {
        name: "Create",
        exact: true,
      });

      await reminder.fill("* * * * *"); // every minute
      await weeks.fill("1");
      await wordCount.fill("7");
      await createNow.click(); // clicking sets create now to false
      await createButton.click();

      const autoWordReminderHeading = page.getByRole("heading", {
        name: "Auto Word Reminder",
      });
      const wordReminderDetails = page.getByText("Word Reminder Details");
      await expect(autoWordReminderHeading).toBeVisible();
      await expect(wordReminderDetails).not.toBeVisible();
      await expect(createAutoWordReminderButton).not.toBeVisible();
    });

    test("that an auto word reminder is updated correctly", async ({
      page,
    }) => {
      const createAutoWordReminderButton = page.getByRole("button", {
        name: "Create Auto Word Reminder",
        exact: true,
      });
      const reminder = page.getByLabel("Reminder", { exact: true });
      const weeks = page.getByLabel("Weeks");
      const wordCount = page.getByLabel("Word Count");
      const createButton = page.getByRole("button", {
        name: "Create",
        exact: true,
      });
      await createAutoWordReminderButton.click();
      await reminder.fill("* * * * *"); // every minute
      await weeks.fill("1");
      await wordCount.fill("7");
      await page.getByLabel("Create Now").click(); // clicking sets create now to false
      await createButton.click();

      const updateButton = page.getByRole("button", {
        name: "Update",
        exact: true,
      });
      await updateButton.click();
      await page.getByLabel("Word Count").fill("8");
      await page.getByLabel("Create Now").click(); // clicking sets create now to false
      const modalUpdateButton = page
        .getByRole("button", {
          name: "Update",
          exact: true,
        })
        .last();
      await modalUpdateButton.click();

      const autoWordReminderWordCount = page.getByText(
        "Word Count (how many words to include): 8"
      );
      await expect(autoWordReminderWordCount).toBeVisible();
    });

    test("that an auto word reminder is deleted correctly", async ({
      page,
    }) => {
      const createAutoWordReminderButton = page.getByRole("button", {
        name: "Create Auto Word Reminder",
        exact: true,
      });
      const reminder = page.getByLabel("Reminder", { exact: true });
      const weeks = page.getByLabel("Weeks");
      const wordCount = page.getByLabel("Word Count");
      const createNow = page.getByLabel("Create Now");
      const createButton = page.getByRole("button", {
        name: "Create",
        exact: true,
      });
      await createAutoWordReminderButton.click();
      await reminder.fill("* * * * *"); // every minute
      await weeks.fill("1");
      await wordCount.fill("7");
      await createNow.click(); // clicking sets create now to false
      await createButton.click();

      const deleteButton = page.getByRole("button", {
        name: "Delete",
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

      const autoWordReminderHeading = page.getByRole("heading", {
        name: "Auto Word Reminder",
        exact: true,
      });
      await expect(createAutoWordReminderButton).toBeVisible();
      await expect(autoWordReminderHeading).not.toBeVisible();
    });

    test("that a word reminder is created based on the duration (every minute) when the user chooses not to create a word reminder immediately while creating", async ({
      page,
      extensionId,
    }) => {
      const createAutoWordReminderButton = page.getByRole("button", {
        name: "Create Auto Word Reminder",
        exact: true,
      });
      const reminder = page.getByLabel("Reminder", { exact: true });
      const minutes = page.getByLabel("Minutes");
      const wordCount = page.getByLabel("Word Count");
      const createNow = page.getByLabel("Create Now");
      const createButton = page.getByRole("button", {
        name: "Create",
        exact: true,
      });

      await createAutoWordReminderButton.click();
      await reminder.fill("* * * * *"); // every minute
      await minutes.fill("1");
      await wordCount.fill("7");
      await createNow.click(); // clicking sets create now to false
      await createButton.click();

      await page.waitForTimeout(70_000); // 1 minute and change to prevent flakiness
      await goto(page, extensionId);
      const wordRemindersLink = page.getByRole("link", {
        name: "Word Reminders",
      });
      await wordRemindersLink.click();

      const wordReminderDetails = page.getByRole("link", {
        name: "Word Reminder Details",
      });
      await expect(wordReminderDetails).toBeVisible();
    });

    test("that a word reminder is created based on the duration (every minute) when the user chooses not to create a word reminder immediately while updating", async ({
      page,
      extensionId,
    }) => {
      const createAutoWordReminderButton = page.getByRole("button", {
        name: "Create Auto Word Reminder",
        exact: true,
      });
      const reminder = page.getByLabel("Reminder", { exact: true });
      const minutes = page.getByLabel("Minutes");
      const wordCount = page.getByLabel("Word Count");
      const createButton = page.getByRole("button", {
        name: "Create",
        exact: true,
      });
      await createAutoWordReminderButton.click();
      await reminder.fill("* * * * *"); // every minute
      await minutes.fill("2");
      await wordCount.fill("7");
      await page.getByLabel("Create Now").click(); // clicking sets create now to false
      await createButton.click();

      const updateButton = page.getByRole("button", {
        name: "Update",
        exact: true,
      });
      await updateButton.click();
      await page.getByLabel("Minutes", { exact: true }).fill("1");
      await page.getByLabel("Create Now").click(); // clicking sets create now to false
      const modalUpdateButton = page
        .getByRole("button", {
          name: "Update",
          exact: true,
        })
        .last();
      await modalUpdateButton.click();

      await page.waitForTimeout(70_000); // 1 minute and change to prevent flakiness
      await goto(page, extensionId);
      const wordRemindersLink = page.getByRole("link", {
        name: "Word Reminders",
      });
      await wordRemindersLink.click();

      const wordReminderDetails = page.getByRole("link", {
        name: "Word Reminder Details",
      });
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

      const wordReminderDetails = page.getByText("Word Reminder Details");
      await expect(wordReminderDetails).toBeVisible();
    });

    test("that a word reminder is updated", async ({ page }) => {
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
      const updateButton = page.getByRole("button", {
        name: "Update",
        exact: true,
      });
      await updateButton.click();
      await page.getByLabel("Reminder", { exact: true }).fill("*/10 * * * *");
      const modalUpdateButton = page
        .getByRole("button", {
          name: "Update",
          exact: true,
        })
        .last();
      await modalUpdateButton.click();

      await expect(page.getByText("every 10 minutes")).toBeVisible();
    });

    test("that a word reminder is deleted", async ({ page }) => {
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
      const deleteButton = page.getByRole("button", {
        name: "Delete",
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

      const wordReminderDetails = page.getByText("Word Reminder Details");
      await expect(wordReminderDetails).not.toBeVisible();
    });
  });
});
