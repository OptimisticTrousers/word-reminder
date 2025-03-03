import { AutoWordReminderParams } from "common";

import { service } from "../service";

export const autoWordReminderService = (function (service) {
  const { get, post, put, remove, VITE_API_DOMAIN } = service;

  function getAutoWordReminder(userId: string) {
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
    body: Omit<AutoWordReminderParams, "user_id">;
  }) {
    return post({
      url: `${VITE_API_DOMAIN}/users/${userId}/autoWordReminders`,
      options: { body: JSON.stringify(body), credentials: "include" },
    });
  }

  function updateAutoWordReminder({
    userId,
    autoWordReminderId,
    body,
  }: {
    userId: string;
    autoWordReminderId: string;
    body: Omit<AutoWordReminderParams, "user_id">;
  }) {
    return put({
      url: `${VITE_API_DOMAIN}/users/${userId}/autoWordReminders/${autoWordReminderId}`,
      options: { body: JSON.stringify(body), credentials: "include" },
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
