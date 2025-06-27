import { Detail, User, UserWord, WordReminder } from "common";
import CSSModules from "react-css-modules";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ModalContainer } from "../ModalContainer";
import { userWordService } from "../../../services/user_word_service";
import styles from "./UpdateWordReminderModal.module.css";
import { ReactNode, useContext, useMemo } from "react";
import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../../context/Notification";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { wordReminderService } from "../../../services/word_reminder_service";
import { ToggleModal } from "../types";
import { Reminder } from "../../ui/Reminder";

interface Props {
  toggleModal: ToggleModal;
  wordReminder: WordReminder & {
    user_words: (UserWord & { details: Detail[] })[];
  };
}

export const UpdateWordReminderModal = CSSModules(
  function ({ toggleModal, wordReminder }: Props) {
    const { user }: { user: User } = useOutletContext();
    const userId = String(user.id);
    const { showNotification } = useContext(NotificationContext);
    const queryClient = useQueryClient();
    const { showNotificationError } = useNotificationError();
    const { data } = useQuery({
      queryKey: ["userWords"],
      queryFn: async () => {
        const params = new URLSearchParams();
        return userWordService.getUserWordList({
          userId,
          params: Object.fromEntries(params),
        });
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
        queryClient.invalidateQueries({
          queryKey: ["wordReminders"],
        });
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

    function handleUpdate(formData: FormData) {
      const userWords = formData.get("user_words") as string;
      const userWordsData = userWords.split(",").map((userWord: string) => {
        return wordToUserWord[userWord.toLowerCase()];
      });

      mutate({
        userId,
        wordReminderId: String(wordReminder.id),
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
      <ModalContainer title="Update Word Reminder" toggleModal={toggleModal}>
        <form styleName="modal" action={handleUpdate}>
          <Reminder disabled={false} value={wordReminder.reminder} />
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
                new Date(wordReminder.finish).toISOString().slice(0, 10)
              )}
            />
          </div>
          <div styleName="modal__control">
            <label styleName="modal__label" htmlFor="user_words">
              User Words
            </label>
            <input
              type="email"
              styleName="modal__input"
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
              placeholder="Separate words with a comma."
              defaultValue={String(
                wordReminder.user_words.map(
                  (user_word: UserWord & { details: Detail[] }) => {
                    return user_word.details[0].word;
                  }
                )
              )}
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
