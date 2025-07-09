import { SortMode } from "common";

import { autoWordReminderService } from "./auto_word_reminder_service";
import { service } from "../service";

vi.mock("../service");

const { VITE_API_DOMAIN } = service;

describe("autoWordReminderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const status = 200;

  const userId = "1";

  const autoWordReminderParams = {
    create_now: true,
    has_reminder_onload: true,
    is_active: true,
    reminder: "* * * * *",
    duration: 360000,
    word_count: 7,
    has_learned_words: false,
    sort_mode: SortMode.Random,
  };

  const autoWordReminder = {
    id: "1",
    ...autoWordReminderParams,
  };

  describe("getAutoWordReminderByUserId", () => {
    it("gets using the correct API endpoint with query params", async () => {
      const mockGet = vi.spyOn(service, "get").mockImplementation(async () => {
        return {
          json: { wordReminder: autoWordReminder },
          status,
        };
      });

      const response = await autoWordReminderService.getAutoWordReminder({
        userId,
      });

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/autoWordReminders`,
        options: { credentials: "include" },
      });
      expect(response).toEqual({
        json: { wordReminder: autoWordReminder },
        status,
      });
    });
  });

  describe("createAutoWordReminder", () => {
    it("creates using the correct API endpoint with auto word reminder body", async () => {
      const mockPost = vi
        .spyOn(service, "post")
        .mockImplementation(async () => {
          return { json: { wordReminder: autoWordReminder }, status };
        });

      const response = await autoWordReminderService.createAutoWordReminder({
        userId,
        body: autoWordReminderParams,
      });

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/autoWordReminders`,
        options: {
          body: JSON.stringify(autoWordReminderParams),
          credentials: "include",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        },
      });
      expect(response).toEqual({
        json: { wordReminder: autoWordReminder },
        status,
      });
    });
  });

  describe("deleteAutoWordReminder", () => {
    it("deletes using the correct API endpoint", async () => {
      const mockRemove = vi
        .spyOn(service, "remove")
        .mockImplementation(async () => {
          return {
            json: { wordReminder: autoWordReminder },
            status,
          };
        });

      const response = await autoWordReminderService.deleteAutoWordReminder({
        userId,
        autoWordReminderId: autoWordReminder.id,
      });

      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/autoWordReminders/${autoWordReminder.id}`,
        options: { credentials: "include" },
      });
      expect(response).toEqual({
        json: { wordReminder: autoWordReminder },
        status,
      });
    });
  });

  describe("updateWordReminder", () => {
    it("updates from the correct API endpoint with word reminder body", async () => {
      const mockPut = vi.spyOn(service, "put").mockImplementation(async () => {
        return { json: { wordReminder: autoWordReminder }, status };
      });

      const response = await autoWordReminderService.updateAutoWordReminder({
        userId,
        autoWordReminderId: autoWordReminder.id,
        body: autoWordReminderParams,
      });

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${userId}/autoWordReminders/${autoWordReminder.id}`,
        options: {
          body: JSON.stringify(autoWordReminderParams),
          credentials: "include",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        },
      });
      expect(response).toEqual({
        json: { wordReminder: autoWordReminder },
        status,
      });
    });
  });
});
