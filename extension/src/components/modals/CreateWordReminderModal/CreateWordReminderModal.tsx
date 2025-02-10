import { User, UserWord, Word } from "common";
import CSSModules from "react-css-modules";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ModalContainer } from "../ModalContainer";
import { wordService } from "../../../services/word_service";
import styles from "./CreateWordReminderModal.module.css";
import { useContext } from "react";
import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../../context/Notification";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { wordReminderService } from "../../../services/word_reminder_service";
import { ToggleModal } from "../types";

interface Props {
  searchParams: URLSearchParams;
  toggleModal: ToggleModal;
}

export const CreateWordReminderModal = CSSModules(
  function ({ toggleModal, searchParams }: Props) {
    const { user }: { user: User } = useOutletContext();
    const userId = user.id;
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const queryClient = useQueryClient();
    const { data } = useQuery({
      queryKey: ["userWords"],
      queryFn: async () => {
        return wordService.getWordList(
          userId,
          Object.fromEntries(new URLSearchParams())
        );
      },
      throwOnError: true,
    });
    const { isPending, mutate } = useMutation({
      mutationFn: wordReminderService.createWordReminder,
      onSuccess: () => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          CREATE_WORD_REMINDER_NOTIFICATION_MSGS.createWordReminder()
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

    function handleCreate(formData: FormData) {
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
        body: {
          auto: false,
          reminder: formData.get("reminder") as string,
          finish: new Date(formData.get("finish") as string),
          is_active: Boolean(formData.get("is_active") as string),
          has_reminder_onload: Boolean(
            formData.get("has_reminder_onload") as string
          ),
          user_words: userWordIds,
        },
      });
    }

    return (
      <ModalContainer title="Create Word Reminder" toggleModal={toggleModal}>
        <form styleName="modal__form" action={handleCreate}>
          <div styleName="modal__control">
            <label styleName="modal__label" htmlFor="reminder">
              Reminder
            </label>
            <input
              styleName="modal__input"
              type="text"
              id="reminder"
              name="reminder"
              placeholder="1 hour (indicating every hour), 30 minutes (indicating every thirty minutes)"
              required
              maxLength={10}
            />
          </div>
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
                defaultChecked
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
                defaultChecked
              />
            </div>
          </fieldset>
          <button styleName="modal__button" disabled={isPending} type="submit">
            Create
          </button>
        </form>
      </ModalContainer>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);

const CREATE_WORD_REMINDER_NOTIFICATION_MSGS = {
  createWordReminder: () => {
    return "A word reminder has been created!";
  },
};
