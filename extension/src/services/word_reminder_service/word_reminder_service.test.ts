import { http } from "common";

import { service } from "../service";
import { wordReminderService } from "./word_reminder_service";

vi.mock("common");

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
    auto: false,
    hasReminderOnload: true,
    isActive: true,
    reminder: "every 2 hours",
    finish: new Date(Date.now() + 1000), // make sure date comes after current date
    words: [],
  };

  const wordReminderId2 = "2";
  const wordReminder2 = {
    auto: true,
    hasReminderOnload: true,
    isActive: true,
    reminder: "every 2 hours",
    duration: "1 week",
    count: 7,
    hasLearnedWords: false,
    order: -1,
  };

  describe("getWordReminderList", () => {
    it("calls the functions at the correct API endpoint with query params", async () => {
      const params = new URLSearchParams({
        column: "created_at",
        direction: "-1",
      });
      const paramsObject = Object.fromEntries(params);
      const mockHttpGet = vi.spyOn(http, "get").mockImplementation(async () => {
        return {
          json: { wordReminders: [wordReminder1, wordReminder2] },
          status,
        };
      });

      const response = await wordReminderService.getWordReminderList(
        sampleUser1.id,
        paramsObject
      );

      expect(mockHttpGet).toHaveBeenCalledTimes(1);
      expect(mockHttpGet).toHaveBeenCalledWith({
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

  describe("createWordReminder", () => {
    describe("autoCreateWordReminder", () => {
      it("calls the functions at the correct API endpoint with body", async () => {
        const mockHttpPost = vi
          .spyOn(http, "post")
          .mockImplementation(async () => {
            return { json: { wordReminder: wordReminder1 }, status };
          });

        const response = await wordReminderService.createWordReminder(
          sampleUser1.id,
          wordReminderId1,
          wordReminder1
        );

        expect(mockHttpPost).toHaveBeenCalledTimes(1);
        expect(mockHttpPost).toHaveBeenCalledWith({
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

    describe("manualCreateWordReminder", () => {
      it("calls the functions at the correct API endpoint with body", async () => {
        const mockHttpPost = vi
          .spyOn(http, "post")
          .mockImplementation(async () => {
            return { json: { wordReminder: wordReminder2 }, status };
          });

        const response = await wordReminderService.createWordReminder(
          sampleUser1.id,
          wordReminderId2,
          wordReminder2
        );

        expect(mockHttpPost).toHaveBeenCalledTimes(1);
        expect(mockHttpPost).toHaveBeenCalledWith({
          url: `${VITE_API_DOMAIN}/users/${sampleUser1.id}/wordReminders/${wordReminderId2}`,
          options: {
            body: JSON.stringify(wordReminder2),
            credentials: "include",
          },
        });
        expect(response).toEqual({
          json: { wordReminder: wordReminder2 },
          status,
        });
      });
    });
  });

  describe("deleteWordReminders", () => {
    it("calls the functions at the correct API endpoint", async () => {
      const mockHttpRemove = vi
        .spyOn(http, "remove")
        .mockImplementation(async () => {
          return {
            json: { wordReminders: [wordReminder1, wordReminder2] },
            status,
          };
        });

      const response = await wordReminderService.deleteWordReminders(
        sampleUser1.id
      );

      expect(mockHttpRemove).toHaveBeenCalledTimes(1);
      expect(mockHttpRemove).toHaveBeenCalledWith({
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
    it("calls the functions at the correct API endpoint with body", async () => {
      const mockHttpPut = vi.spyOn(http, "put").mockImplementation(async () => {
        return { json: { wordReminder: wordReminder1 }, status };
      });

      const response = await wordReminderService.updateWordReminder(
        sampleUser1.id,
        wordReminderId1,
        wordReminder1
      );

      expect(mockHttpPut).toHaveBeenCalledTimes(1);
      expect(mockHttpPut).toHaveBeenCalledWith({
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
    it("calls the functions at the correct API endpoint", async () => {
      const mockHttpRemove = vi
        .spyOn(http, "remove")
        .mockImplementation(async () => {
          return { json: { wordReminder: wordReminder1 }, status };
        });

      const response = await wordReminderService.deleteWordReminder(
        sampleUser1.id,
        wordReminderId1
      );

      expect(mockHttpRemove).toHaveBeenCalledTimes(1);
      expect(mockHttpRemove).toHaveBeenCalledWith({
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
