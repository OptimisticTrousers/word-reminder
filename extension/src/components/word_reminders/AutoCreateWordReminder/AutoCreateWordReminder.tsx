import { CirclePlus } from "lucide-react";
import { useState } from "react";
import cronstrue from "cronstrue";
import CSSModules from "react-css-modules";

import styles from "./AutoCreateWordReminder.module.css";
import { User } from "common";
import { useOutletContext } from "react-router-dom";
import { CreateAutoWordReminderModal } from "../../modals/CreateAutoWordReminderModal";
import { autoWordReminderService } from "../../../services/auto_word_reminder_service/auto_word_reminder_service";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "../../ui/Loading";
import { UpdateAutoWordReminderModal } from "../../modals/UpdateAutoWordReminderModal";
import { DeleteAutoWordReminderModal } from "../../modals/DeleteAutoWordReminderModal";
import { msToUnits } from "../../../utils/date/date";
import { ErrorMessage } from "../../ui/ErrorMessage";

export const AutoCreateWordReminder = CSSModules(
  function () {
    const { user }: { user: User } = useOutletContext();
    const userId = String(user.id);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const { data, failureReason, isLoading } = useQuery({
      queryKey: ["autoWordReminders"],
      queryFn: () => {
        return autoWordReminderService.getAutoWordReminder({ userId });
      },
    });

    const toggleCreateModal = () => {
      setIsCreateModalOpen((prevValue) => !prevValue);
    };
    const toggleUpdateModal = () => {
      setIsUpdateModalOpen((prevValue) => !prevValue);
    };

    const toggleDeleteModal = () => {
      setIsDeleteModalOpen((prevValue) => !prevValue);
    };

    if (failureReason) {
      return <ErrorMessage message={failureReason.message} />;
    }

    if (isLoading) {
      return <Loading />;
    }

    const autoWordReminder = data?.json.autoWordReminder;

    if (!autoWordReminder) {
      return (
        <>
          {isCreateModalOpen && (
            <CreateAutoWordReminderModal toggleModal={toggleCreateModal} />
          )}
          <button
            styleName="create"
            onClick={toggleCreateModal}
            aria-haspopup="dialog"
            aria-labelledby="title"
          >
            <div styleName="create__container">
              <CirclePlus styleName="create__icon" />
              <div styleName="create__text">
                <h2 styleName="create__title" id="title">
                  Create Auto Word Reminder
                </h2>
                <p styleName="create__description">
                  Automatically create word reminder on an interval to remember
                  words you come across in your readings. Set it and forget it.
                </p>
              </div>
            </div>
          </button>
        </>
      );
    }

    const reminder = cronstrue.toString(autoWordReminder.reminder);

    const duration = msToUnits(autoWordReminder.duration);

    return (
      <>
        <section styleName="auto-word-reminder">
          <h3 styleName="auto-word-reminder__heading">Auto Word Reminder</h3>
          <div styleName="auto-word-reminder__id">
            ID: {autoWordReminder.id}
          </div>
          <div styleName="auto-word-reminder__reminder">
            Reminder: {reminder}
          </div>
          <div styleName="auto-word-reminder__duration">
            Weeks: {duration.weeks}, Days: {duration.days}, Hours:{" "}
            {duration.hours}, Minutes: {duration.minutes}
          </div>
          <div styleName="auto-word-reminder__is-active">
            Active (whether the word reminder will actively remind you of the
            words in it): {autoWordReminder.is_active ? "Yes" : "No"}
          </div>
          <div styleName="auto-word-reminder__has_reminder_onload">
            Has Reminder Onload (reminds you of these words when you open your
            browser): {autoWordReminder.has_reminder_onload ? "Yes" : "No"}
          </div>
          <div styleName="auto-word-reminder__has_learned_words">
            Has Learned (whether to include words that you have already
            learned): {autoWordReminder.has_learned_words ? "Yes" : "No"}
          </div>
          <div styleName="auto-word-reminder__has-reminder-onload">
            Sort Mode (determines sort mode): {autoWordReminder.sort_mode}
          </div>
          <div styleName="auto-word-reminder__has-reminder-onload">
            Word Count (how many words to include):{" "}
            {autoWordReminder.word_count}
          </div>
          <div styleName="auto-word-reminder__created_at">
            This auto word reminder was created on{" "}
            {autoWordReminder.created_at.toLocaleString()}
          </div>
          <div styleName="auto-word-reminder__updated_at">
            This auto word reminder was updated on{" "}
            {autoWordReminder.updated_at.toLocaleString()}
          </div>
          <div styleName="auto-word-reminder__buttons">
            <button
              styleName="auto-word-reminder__button"
              onClick={toggleUpdateModal}
            >
              Update
            </button>
            <button
              styleName="auto-word-reminder__button"
              onClick={toggleDeleteModal}
            >
              Delete
            </button>
          </div>
        </section>
        {isUpdateModalOpen && (
          <UpdateAutoWordReminderModal
            autoWordReminder={autoWordReminder}
            toggleModal={toggleUpdateModal}
          />
        )}
        {isDeleteModalOpen && (
          <DeleteAutoWordReminderModal
            autoWordReminderId={autoWordReminder.id}
            toggleModal={toggleDeleteModal}
          />
        )}
      </>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
