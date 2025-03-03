import { Order } from "common";
import { service } from "../service";
import { autoWordReminderService } from "./auto_word_reminder_service";

vi.mock("../service");

const { VITE_API_DOMAIN } = service;

describe("autoWordReminderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const status = 200;

  const sampleUser1 = {
    id: "1",
    email: "email@protonmail.com",
    password: "password",
  };

  const autoWordReminderParams = {
    create_now: true,
    has_reminder_onload: true,
    is_active: true,
    reminder: {
      minutes: 0,
      hours: 2,
      days: 0,
      weeks: 0,
      months: 0,
    },
    duration: {
      minutes: 0,
      hours: 0,
      days: 0,
      weeks: 1,
      months: 0,
    },
    word_count: 7,
    has_learned_words: false,
    order: Order.Random,
  };

  const autoWordReminder = {
    id: "1",
    ...autoWordReminderParams,
  };

  describe("getAutoWordReminder", () => {
    it("gets using the correct API endpoint with query params", async () => {
      const mockGet = vi.spyOn(service, "get").mockImplementation(async () => {
        return {
          json: { wordReminder: autoWordReminder },
          status,
        };
      });

      const response = await autoWordReminderService.getAutoWordReminder(
        sampleUser1.id
      );

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${sampleUser1.id}/autoWordReminders`,
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
        userId: sampleUser1.id,
        body: autoWordReminderParams,
      });

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${sampleUser1.id}/autoWordReminders`,
        options: {
          body: JSON.stringify(autoWordReminderParams),
          credentials: "include",
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
        userId: sampleUser1.id,
        autoWordReminderId: autoWordReminder.id,
      });

      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${sampleUser1.id}/autoWordReminders/${autoWordReminder.id}`,
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
        userId: sampleUser1.id,
        autoWordReminderId: autoWordReminder.id,
        body: autoWordReminderParams,
      });

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith({
        url: `${VITE_API_DOMAIN}/users/${sampleUser1.id}/autoWordReminders/${autoWordReminder.id}`,
        options: {
          body: JSON.stringify(autoWordReminderParams),
          credentials: "include",
        },
      });
      expect(response).toEqual({
        json: { wordReminder: autoWordReminder },
        status,
      });
    });
  });
});
