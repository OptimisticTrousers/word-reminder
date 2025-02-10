import {
  WordReminder as IWordReminder,
  UserWord as IUserWord,
  Word,
} from "common";
import CSSModules from "react-css-modules";

import { UpdateWordReminderModal } from "../../modals/UpdateWordReminderModal";
import { UserWord } from "../../words/UserWord";
import styles from "./WordReminder.module.css";
import { useState } from "react";
import { DeleteWordReminderModal } from "../../modals/DeleteWordReminderModal";

export interface Props {
  searchParams: URLSearchParams;
  wordReminder: IWordReminder & { user_words: (IUserWord & Word)[] };
}

export const WordReminder = CSSModules(
  function ({ searchParams, wordReminder }: Props) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    function toggleUpdateModal() {
      setIsUpdateModalOpen((prevIsUpdateModalOpen) => !prevIsUpdateModalOpen);
    }

    function toggleDeleteModal() {
      setIsDeleteModalOpen((prevIsDeleteModalOpen) => !prevIsDeleteModalOpen);
    }

    return (
      <>
        <div styleName="word-reminder">
          <div styleName="word-reminder__id">{wordReminder.id}</div>
          <div styleName="word-reminder__reminder">
            This word reminder will remind you of these words{" "}
            {wordReminder.reminder}
          </div>
          <div styleName="word-reminder__is-active">
            Active (whether the word reminder will actively remind you of the
            words in it): {wordReminder.is_active ? "Yes" : "No"}
          </div>
          <div styleName="word-reminder__has-reminder-onload">
            Has Reminder Onload (reminds you of these words when you open your
            browser): {wordReminder.has_reminder_onload ? "Yes" : "No"}
          </div>
          <time styleName="word-reminder__finish">
            This word reminder will become inactive on{" "}
            {wordReminder.finish.toLocaleString()}
          </time>
          <div styleName="word-reminder__created_at">
            This word reminder was created on{" "}
            {wordReminder.created_at.toLocaleString()}
          </div>
          <div styleName="word-reminder__updated_at">
            This word reminder was updated on{" "}
            {wordReminder.updated_at.toLocaleString()}
          </div>
          <div styleName="word-reminder__buttons">
            <button
              styleName="word-reminder__button"
              onClick={toggleUpdateModal}
            >
              Update
            </button>
            <button
              styleName="word-reminder__button"
              onClick={toggleDeleteModal}
            >
              Delete
            </button>
          </div>
          <ul styleName="word-reminder__user-words">
            {wordReminder.user_words.map((userWord: IUserWord & Word) => {
              return <UserWord key={userWord.id} {...userWord} />;
            })}
          </ul>
        </div>
        {isUpdateModalOpen && (
          <UpdateWordReminderModal
            wordReminder={wordReminder}
            searchParams={searchParams}
            toggleModal={toggleUpdateModal}
          />
        )}
        {isDeleteModalOpen && (
          <DeleteWordReminderModal
            wordReminderId={wordReminder.id}
            toggleModal={toggleDeleteModal}
          />
        )}
      </>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);
