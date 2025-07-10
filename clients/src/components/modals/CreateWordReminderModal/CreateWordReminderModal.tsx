import { Detail, User, UserWord } from "common";
import CSSModules from "react-css-modules";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ModalContainer } from "../ModalContainer";
import { userWordService } from "../../../services/user_word_service";
import styles from "./CreateWordReminderModal.module.css";
import { ReactNode, useContext, useMemo } from "react";
import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../../context/Notification";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { wordReminderService } from "../../../services/word_reminder_service";
import { ToggleModal } from "../types";
import { Reminder } from "../../ui/Reminder";
import { useMobilePushNotificationRegistration } from "../../../hooks/useMobilePushNotifications";

interface Props {
  toggleModal: ToggleModal;
}

export const CreateWordReminderModal = CSSModules(
  function ({ toggleModal }: Props) {
    const { user }: { user: User } = useOutletContext();
    const userId = String(user.id);
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const { register } = useMobilePushNotificationRegistration(userId);
    const queryClient = useQueryClient();
    const { data } = useQuery({
      queryKey: ["userWords"],
      queryFn: async () => {
        return userWordService.getUserWordList({
          userId,
          params: Object.fromEntries(new URLSearchParams()),
        });
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
        queryClient.invalidateQueries({
          queryKey: ["wordReminders"],
        });
        register();
      },
      onError: showNotificationError,
      onSettled: () => {
        toggleModal();
      },
    });

    const [wordToUserWord, words] = useMemo(() => {
      const wordToUserWord: { [key: string]: UserWord } = {};

      const words: ReactNode[] = data?.json.userWords.map(
        (userWord: UserWord & { details: Detail[] }) => {
          const word = userWord.details[0].word;
          wordToUserWord[word] = userWord;
          return (
            <option key={userWord.id} styleName="modal__option" value={word}>
              {word}
            </option>
          );
        }
      );
      return [wordToUserWord, words];
    }, [data]);

    function handleCreate(formData: FormData) {
      const userWords = formData.get("user_words") as string;
      const userWordsData = userWords.split(",").map((userWord: string) => {
        return wordToUserWord[userWord.toLowerCase()];
      });

      mutate({
        userId,
        body: {
          reminder: formData.get("reminder") as string,
          finish: new Date(formData.get("finish") as string),
          is_active: (formData.get("is_active") as string) === "on",
          has_reminder_onload:
            (formData.get("has_reminder_onload") as string) === "on",
          user_words: userWordsData,
        },
      });
    }

    return (
      <ModalContainer title="Create Word Reminder" toggleModal={toggleModal}>
        <form styleName="modal" action={handleCreate}>
          <Reminder disabled={false} value={""} />
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
              styleName="modal__input"
              type="email"
              multiple
              name="user_words"
              id="user_words"
              autoFocus
              onFocus={(event) => {
                event.target.type = "email";
              }}
              onBlur={(event) => {
                event.target.type = "text";
              }}
              list="words"
              required
              size={64}
              placeholder="Separate words with a comma and no spaces."
            />
            <datalist id="words">{words}</datalist>
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
