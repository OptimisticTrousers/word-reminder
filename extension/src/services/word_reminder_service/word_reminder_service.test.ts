import { service } from "../service";
import { wordReminderService } from "./word_reminder_service";

vi.mock("../service");

const { VITE_API_DOMAIN } = service;

describe("wordReminderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const status = 200;

  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const wordReminderId1 = "1";
  const wordReminder1 = {
    has_reminder_onload: true,
    is_active: true,
    reminder: {
      minutes: 0,
      hours: 2,
      days: 0,
      weeks: 0,
      months: 0,
    },
    finish: new Date(Date.now() + 1000), // make sure date comes after current date
    user_words: [],
  };

  const wordReminder2 = {
    has_reminder_onload: true,
    is_active: true,
    reminder: {
      minutes: 0,
      hours: 2,
      days: 0,
      weeks: 0,
      months: 0,
    },
    finish: new Date(Date.now() + 1000), // make sure date comes after current date
    user_words: [],
  };

  describe("getWordReminderList", () => {
    it("gets using the correct API endpoint with query params", async () => {
      const params = new URLSearchParams({
        column: "created_at",
        direction: "-1",
      });
      const paramsObject = Object.fromEntries(params);
      const mockGet = vi.spyOn(service, "get").mockImplementation(async () => {
        return {
          json: { wordReminders: [wordReminder1, wordReminder2] },
          status,
        };
      });

      const response = await wordReminderService.getWordReminderList(
        sampleUser1.id,
        paramsObject
      );

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${sampleUser1.id}/wordReminders`,
        params: paramsObject,
        options: { credentials: "include" },
      });
      expect(response).toEqual({
        json: { wordReminders: [wordReminder1, wordReminder2] },
        status,
      });
    });
  });

  describe("getWordReminder", () => {
    it("gets using the correct API endpoint", async () => {
      const mockGet = vi.spyOn(service, "get").mockImplementation(async () => {
        return {
          json: { wordReminder: wordReminder1 },
          status,
        };
      });

      const response = await wordReminderService.getWordReminder(
        sampleUser1.id,
        wordReminderId1
      );

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${sampleUser1.id}/wordReminders/${wordReminderId1}`,
        options: {
          credentials: "include",
        },
      });
      expect(response).toEqual({
        json: { wordReminder: wordReminder1 },
        status,
      });
    });
  });

  describe("createWordReminder", () => {
    it("creates using the correct API endpoint with auto word reminder body", async () => {
      const mockPost = vi
        .spyOn(service, "post")
        .mockImplementation(async () => {
          return { json: { wordReminder: wordReminder1 }, status };
        });

      const response = await wordReminderService.createWordReminder({
        userId: sampleUser1.id,
        body: wordReminder1,
      });

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${sampleUser1.id}/wordReminders`,
        options: {
          body: JSON.stringify(wordReminder1),
          credentials: "include",
        },
      });
      expect(response).toEqual({
        json: { wordReminder: wordReminder1 },
        status,
      });
    });
  });

  describe("deleteWordReminders", () => {
    it("deletes using the correct API endpoint", async () => {
      const mockRemove = vi
        .spyOn(service, "remove")
        .mockImplementation(async () => {
          return {
            json: { wordReminders: [wordReminder1, wordReminder2] },
            status,
          };
        });

      const response = await wordReminderService.deleteWordReminders(
        sampleUser1.id
      );

      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${sampleUser1.id}/wordReminders`,
        options: { credentials: "include" },
      });
      expect(response).toEqual({
        json: { wordReminders: [wordReminder1, wordReminder2] },
        status,
      });
    });
  });

  describe("updateWordReminder", () => {
    it("updates from the correct API endpoint with word reminder body", async () => {
      const mockPut = vi.spyOn(service, "put").mockImplementation(async () => {
        return { json: { wordReminder: wordReminder1 }, status };
      });

      const response = await wordReminderService.updateWordReminder({
        userId: sampleUser1.id,
        wordReminderId: wordReminderId1,
        body: wordReminder1,
      });

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${sampleUser1.id}/wordReminders/${wordReminderId1}`,
        options: {
          body: JSON.stringify(wordReminder1),
          credentials: "include",
        },
      });
      expect(response).toEqual({
        json: { wordReminder: wordReminder1 },
        status,
      });
    });
  });

  describe("deleteWordReminder", () => {
    it("deletes the functions at the correct API endpoint", async () => {
      const mockRemove = vi
        .spyOn(service, "remove")
        .mockImplementation(async () => {
          return { json: { wordReminder: wordReminder1 }, status };
        });

      const response = await wordReminderService.deleteWordReminder({
        userId: sampleUser1.id,
        wordReminderId: wordReminderId1,
      });

      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${sampleUser1.id}/wordReminders/${wordReminderId1}`,
        options: { credentials: "include" },
      });
      expect(response).toEqual({
        json: { wordReminder: wordReminder1 },
        status,
      });
    });
  });
});
