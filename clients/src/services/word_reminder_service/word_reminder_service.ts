import { UserWord } from "common";
import { service, Params } from "../service";

export const wordReminderService = (function (service) {
  const { get, post, put, remove, VITE_API_DOMAIN } = service;

  function getWordReminderList({
    userId,
    params,
  }: {
    userId: string;
    params: Params;
  }) {
    return get({
      url: `${VITE_API_DOMAIN}/users/${userId}/wordReminders`,
      params,
      options: {
        credentials: "include",
      },
    });
  }

  function getWordReminder({
    userId,
    wordReminderId,
  }: {
    userId: string;
    wordReminderId: string;
  }) {
    return get({
      url: `${VITE_API_DOMAIN}/users/${userId}/wordReminders/${wordReminderId}`,
      options: {
        credentials: "include",
      },
    });
  }

  function createWordReminder({
    userId,
    body,
  }: {
    userId: string;
    body: {
      is_active: boolean;
      has_reminder_onload: boolean;
      reminder: string;
      finish: Date;
      user_words: UserWord[];
    };
  }) {
    return post({
      url: `${VITE_API_DOMAIN}/users/${userId}/wordReminders`,
      options: {
        body: JSON.stringify(body),
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      },
    });
  }

  function deleteWordReminders({ userId }: { userId: string }) {
    return remove({
      url: `${VITE_API_DOMAIN}/users/${userId}/wordReminders`,
      options: { credentials: "include" },
    });
  }

  function updateWordReminder({
    userId,
    wordReminderId,
    body,
  }: {
    userId: string;
    wordReminderId: string;
    body: {
      is_active: boolean;
      has_reminder_onload: boolean;
      reminder: string;
      finish: Date;
      user_words: UserWord[];
    };
  }) {
    return put({
      url: `${VITE_API_DOMAIN}/users/${userId}/wordReminders/${wordReminderId}`,
      options: {
        body: JSON.stringify(body),
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      },
    });
  }

  function deleteWordReminder({
    userId,
    wordReminderId,
  }: {
    userId: string;
    wordReminderId: string;
  }) {
    return remove({
      url: `${VITE_API_DOMAIN}/users/${userId}/wordReminders/${wordReminderId}`,
      options: { credentials: "include" },
    });
  }

  return {
    createWordReminder,
    deleteWordReminder,
    deleteWordReminders,
    getWordReminder,
    getWordReminderList,
    updateWordReminder,
  };
})(service);
