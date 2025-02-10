import { AutoWordReminderParams, ManualWordReminderParams } from "common";

import { service, Params } from "../service";

export const wordReminderService = (function (service) {
  const { get, post, put, remove, VITE_API_DOMAIN } = service;

  function getWordReminderList(userId: string, params: Params) {
    return get({
      url: `${VITE_API_DOMAIN}/users/${userId}/wordReminders`,
      params,
      options: {
        credentials: "include",
      },
    });
  }

  function getWordReminder(userId: string, wordReminderId: string) {
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
    body: ManualWordReminderParams | AutoWordReminderParams;
  }) {
    return post({
      url: `${VITE_API_DOMAIN}/users/${userId}/wordReminders`,
      options: { body: JSON.stringify(body), credentials: "include" },
    });
  }

  function deleteWordReminders(userId: string) {
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
    body: Omit<ManualWordReminderParams, "auto">;
  }) {
    return put({
      url: `${VITE_API_DOMAIN}/users/${userId}/wordReminders/${wordReminderId}`,
      options: { body: JSON.stringify(body), credentials: "include" },
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
