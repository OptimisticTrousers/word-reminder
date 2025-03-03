import {
  AddToDate as IAddToDate,
  User,
  UserWord,
  Word,
  WordReminder,
} from "common";
import CSSModules from "react-css-modules";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ModalContainer } from "../ModalContainer";
import { wordService } from "../../../services/word_service";
import styles from "./UpdateWordReminderModal.module.css";
import { useContext } from "react";
import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../../context/Notification";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { wordReminderService } from "../../../services/word_reminder_service";
import { ToggleModal } from "../types";
import { AddToDate } from "../../ui/AddToDate";

interface Props {
  searchParams: URLSearchParams;
  toggleModal: ToggleModal;
  wordReminder: WordReminder & {
    user_words: (UserWord & Word)[];
    reminder: IAddToDate;
  };
}

export const UpdateWordReminderModal = CSSModules(
  function ({ searchParams, toggleModal, wordReminder }: Props) {
    const { user }: { user: User } = useOutletContext();
    const userId = user.id;
    const { showNotification } = useContext(NotificationContext);
    const queryClient = useQueryClient();
    const { showNotificationError } = useNotificationError();
    const { data } = useQuery({
      queryKey: ["userWords"],
      queryFn: async () => {
        const params = new URLSearchParams();
        return wordService.getWordList(userId, Object.fromEntries(params));
      },
      throwOnError: true,
    });
    const { isPending, mutate } = useMutation({
      mutationFn: wordReminderService.updateWordReminder,
      onSuccess: () => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          UPDATE_WORD_REMINDER_NOTIFICATION_MSGS.updateWordReminder()
        );
        const searchParamsObject = Object.fromEntries(searchParams);
        queryClient.invalidateQueries({
          queryKey: ["wordReminders", searchParamsObject],
          exact: true,
        });
      },
      onError: showNotificationError,
      onSettled: () => {
        toggleModal();
      },
    });

    function handleUpdate(formData: FormData) {
      const userWordToIds: { [key: string]: string } = {};
      data?.json.userWords.forEach((userWord: UserWord & Word) => {
        userWordToIds[userWord.details[0].word] = userWord.id;
      });

      const userWords = formData.get("user_words") as string;
      const userWordIds = userWords.split(",").map((userWord: string) => {
        return userWordToIds[userWord.toLowerCase()];
      });

      mutate({
        userId,
        wordReminderId: wordReminder.id,
        body: {
          reminder: {
            minutes: Number(formData.get("reminder-minutes") as string),
            hours: Number(formData.get("reminder-hours") as string),
            days: Number(formData.get("reminder-days") as string),
            weeks: Number(formData.get("reminder-weeks") as string),
            months: Number(formData.get("reminder-months") as string),
          },
          finish: new Date(formData.get("finish") as string),
          is_active: Boolean(formData.get("is_active") as string),
          has_reminder_onload: Boolean(
            formData.get("has_reminder_onload") as string
          ),
          user_words: userWordIds,
        },
      });
    }

    const { minutes, hours, days, weeks, months } = wordReminder.reminder;

    return (
      <ModalContainer title="Update Word Reminder" toggleModal={toggleModal}>
        <form styleName="modal__form" action={handleUpdate}>
          <AddToDate
            legend="Reminder"
            disabled={false}
            defaultValues={{
              minutes,
              hours,
              days,
              weeks,
              months,
            }}
          />
          <div styleName="modal__control">
            <label styleName="modal__label" htmlFor="finish">
              Finish
            </label>
            <input
              styleName="modal__input"
              type="date"
              id="finish"
              name="finish"
              required
              defaultValue={String(
                wordReminder.finish.toISOString().slice(0, 10)
              )}
            />
          </div>
          <div styleName="modal__control">
            <label styleName="modal__label" htmlFor="user_words">
              User Words
            </label>
            <input
              type="text"
              multiple
              name="user_words"
              id="user_words"
              list="words"
              required
              size={64}
              placeholder="Separate words with a comma."
              defaultValue={String(
                wordReminder.user_words.map((userWord: UserWord & Word) => {
                  return userWord.details[0].word;
                })
              )}
            />
            <datalist id="words">
              {data?.json.userWords.map((userWord: UserWord & Word) => {
                const word = userWord.details[0].word;
                return (
                  <option
                    key={userWord.id}
                    styleName="modal__option"
                    value={word}
                  >
                    {word}
                  </option>
                );
              })}
            </datalist>
          </div>
          <fieldset styleName="modal__fieldset">
            <legend styleName="modal__legend">Options</legend>
            <div styleName="modal__control">
              <label styleName="modal__label" htmlFor="is_active">
                Is Active
              </label>
              <input
                styleName="modal__input"
                type="checkbox"
                id="is_active"
                name="is_active"
                defaultChecked={wordReminder.is_active}
              />
            </div>
            <div styleName="modal__control">
              <label styleName="modal__label" htmlFor="has_reminder_onload">
                Has Reminder Onload
              </label>
              <input
                styleName="modal__input"
                type="checkbox"
                id="has_reminder_onload"
                name="has_reminder_onload"
                defaultChecked={wordReminder.has_reminder_onload}
              />
            </div>
          </fieldset>
          <button styleName="modal__button" disabled={isPending} type="submit">
            Update
          </button>
        </form>
      </ModalContainer>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);

const UPDATE_WORD_REMINDER_NOTIFICATION_MSGS = {
  updateWordReminder: () => {
    return "Your word reminder has been updated!";
  },
};
