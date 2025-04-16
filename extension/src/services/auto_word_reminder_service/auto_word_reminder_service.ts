import { SortMode } from "common";

import { service } from "../service";

export const autoWordReminderService = (function (service) {
  const { get, post, put, remove, VITE_API_DOMAIN } = service;

  function getAutoWordReminder({ userId }: { userId: string }) {
    return get({
      url: `${VITE_API_DOMAIN}/users/${userId}/autoWordReminders`,
      options: {
        credentials: "include",
      },
    });
  }

  function createAutoWordReminder({
    userId,
    body,
  }: {
    userId: string;
    body: {
      is_active: boolean;
      create_now: boolean;
      has_reminder_onload: boolean;
      reminder: string;
      duration: number;
      word_count: number;
      sort_mode: SortMode;
      has_learned_words: boolean;
    };
  }) {
    return post({
      url: `${VITE_API_DOMAIN}/users/${userId}/autoWordReminders`,
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

  function updateAutoWordReminder({
    userId,
    autoWordReminderId,
    body,
  }: {
    userId: string;
    autoWordReminderId: string;
    body: {
      is_active: boolean;
      create_now: boolean;
      has_reminder_onload: boolean;
      reminder: string;
      duration: number;
      word_count: number;
      sort_mode: SortMode;
      has_learned_words: boolean;
    };
  }) {
    return put({
      url: `${VITE_API_DOMAIN}/users/${userId}/autoWordReminders/${autoWordReminderId}`,
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

  function deleteAutoWordReminder({
    userId,
    autoWordReminderId,
  }: {
    userId: string;
    autoWordReminderId: string;
  }) {
    return remove({
      url: `${VITE_API_DOMAIN}/users/${userId}/autoWordReminders/${autoWordReminderId}`,
      options: { credentials: "include" },
    });
  }

  return {
    createAutoWordReminder,
    getAutoWordReminder,
    deleteAutoWordReminder,
    updateAutoWordReminder,
  };
})(service);
