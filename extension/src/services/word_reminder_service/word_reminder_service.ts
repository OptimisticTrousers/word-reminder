import { UserWord } from "common";

import { service, Params } from "../service";

interface WordReminderParams {
  auto: boolean;
  hasReminderOnload: boolean;
  isActive: boolean;
  reminder: string;
}

interface ManualWordReminderParams extends WordReminderParams {
  finish: Date;
  words: UserWord[];
}

interface AutoWordReminderParams extends WordReminderParams {
  duration: string;
  count: number;
  hasLearnedWords: boolean;
  order: number;
}

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

  function createWordReminder(
    userId: string,
    wordReminderId: string,
    body: ManualWordReminderParams | AutoWordReminderParams
  ) {
    return post({
      url: `${VITE_API_DOMAIN}/users/${userId}/wordReminders/${wordReminderId}`,
      options: { body: JSON.stringify(body), credentials: "include" },
    });
  }

  function deleteWordReminders(userId: string) {
    return remove({
      url: `${VITE_API_DOMAIN}/users/${userId}/wordReminders`,
      options: { credentials: "include" },
    });
  }

  function updateWordReminder(
    userId: string,
    wordReminderId: string,
    body: ManualWordReminderParams
  ) {
    return put({
      url: `${VITE_API_DOMAIN}/users/${userId}/wordReminders/${wordReminderId}`,
      options: { body: JSON.stringify(body), credentials: "include" },
    });
  }

  function deleteWordReminder(userId: string, wordReminderId: string) {
    return remove({
      url: `${VITE_API_DOMAIN}/users/${userId}/wordReminders/${wordReminderId}`,
      options: { credentials: "include" },
    });
  }

  return {
    createWordReminder,
    deleteWordReminder,
    deleteWordReminders,
    getWordReminderList,
    updateWordReminder,
  };
})(service);
