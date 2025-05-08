import { AutoWordReminder, SortMode, User } from "common";
import CSSModules from "react-css-modules";
import { useOutletContext } from "react-router-dom";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { ToggleModal } from "../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../../context/Notification";
import { ModalContainer } from "../ModalContainer";
import styles from "./UpdateAutoWordReminderModal.module.css";
import { Reminder } from "../../ui/Reminder";
import { Duration } from "../../ui/Duration";
import { autoWordReminderService } from "../../../services/auto_word_reminder_service/auto_word_reminder_service";
import { msToUnits, unitsToMs } from "../../../utils/date/date";

interface Props {
  toggleModal: ToggleModal;
  autoWordReminder: AutoWordReminder;
}

export const UpdateAutoWordReminderModal = CSSModules(
  function ({ toggleModal, autoWordReminder }: Props) {
    const { user }: { user: User } = useOutletContext();
    const userId = String(user.id);
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const queryClient = useQueryClient();
    const { isPending, mutate } = useMutation({
      mutationFn: autoWordReminderService.updateAutoWordReminder,
      onSuccess: () => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          UPDATE_AUTO_WORD_REMINDER_NOTIFICATION_MSGS.updateAutoWordReminder()
        );
        queryClient.invalidateQueries({
          queryKey: ["wordReminders"],
        });
        queryClient.invalidateQueries({
          queryKey: ["autoWordReminders"],
          exact: true,
        });
      },
      onError: showNotificationError,
      onSettled: () => {
        toggleModal();
      },
    });

    function handleUpdate(formData: FormData) {
      const time = {
        minutes: Number(formData.get("minutes") as string),
        hours: Number(formData.get("hours") as string),
        days: Number(formData.get("days") as string),
        weeks: Number(formData.get("weeks") as string),
      };

      mutate({
        userId,
        autoWordReminderId: String(autoWordReminder.id),
        body: {
          reminder: formData.get("reminder") as string,
          create_now: (formData.get("create_now") as string) === "on",
          duration: unitsToMs(time),
          word_count: Number(formData.get("word_count") as string),
          is_active: (formData.get("is_active") as string) === "on",
          has_reminder_onload:
            (formData.get("has_reminder_onload") as string) === "on",
          has_learned_words:
            (formData.get("has_learned_words") as string) === "on",
          sort_mode: formData.get("sort_mode") as SortMode,
        },
      });
    }

    return (
      <ModalContainer
        title="Update Auto Word Reminder"
        toggleModal={toggleModal}
      >
        <form styleName="modal__form" action={handleUpdate}>
          <Reminder disabled={false} value={autoWordReminder.reminder} />
          <Duration
            disabled={false}
            defaultValues={msToUnits(autoWordReminder.duration)}
          />
          <div styleName="modal__control">
            <label styleName="modal__label" htmlFor="word_count">
              Word Count
            </label>
            <input
              styleName="modal__input"
              type="number"
              id="word_count"
              name="word_count"
              required
              max={99}
              defaultValue={autoWordReminder.word_count}
            />
          </div>
          <fieldset styleName="modal__fieldset">
            <legend styleName="modal__legend">Options</legend>
            <div styleName="modal__control">
              <label styleName="modal__label" htmlFor="create_now">
                Create Now
              </label>
              <input
                styleName="modal__input"
                type="checkbox"
                id="create_now"
                name="create_now"
                defaultChecked
              />
            </div>
            <div styleName="modal__control">
              <label styleName="modal__label" htmlFor="is_active">
                Is Active
              </label>
              <input
                styleName="modal__input"
                type="checkbox"
                id="is_active"
                name="is_active"
                defaultChecked={autoWordReminder.is_active}
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
                defaultChecked={autoWordReminder.has_reminder_onload}
              />
            </div>
            <div styleName="modal__control">
              <label styleName="modal__label" htmlFor="has_learned_words">
                Has Learned Words
              </label>
              <input
                styleName="modal__input"
                type="checkbox"
                id="has_learned_words"
                name="has_learned_words"
                defaultChecked={autoWordReminder.has_learned_words}
              />
            </div>
            <div styleName="modal__control">
              <label styleName="modal__label" htmlFor="sort_mode">
                Sort Mode
              </label>
              <select
                styleName="modal__select"
                name="sort_mode"
                id="sort_mode"
                required
                defaultValue={autoWordReminder.sort_mode}
              >
                <option styleName="modal__option" value={SortMode.Newest}>
                  Newest
                </option>
                <option styleName="modal__option" value={SortMode.Oldest}>
                  Oldest
                </option>
                <option styleName="modal__option" value={SortMode.Random}>
                  Random
                </option>
              </select>
            </div>
          </fieldset>
          <button styleName="modal__button" type="submit" disabled={isPending}>
            Update
          </button>
        </form>
      </ModalContainer>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);

const UPDATE_AUTO_WORD_REMINDER_NOTIFICATION_MSGS = {
  updateAutoWordReminder: () => {
    return "Your auto word reminder preferences have been updated!";
  },
};
