import { SortMode, User } from "common";
import CSSModules from "react-css-modules";
import { useOutletContext } from "react-router-dom";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { ToggleModal } from "../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useContext, useState } from "react";
import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../../context/Notification";
import { ModalContainer } from "../ModalContainer";
import styles from "./CreateAutoWordReminderModal.module.css";
import { Duration } from "../../ui/Duration";
import { autoWordReminderService } from "../../../services/auto_word_reminder_service/auto_word_reminder_service";
import { Reminder } from "../../ui/Reminder";
import { unitsToMs } from "../../../utils/date/date";

interface Props {
  toggleModal: ToggleModal;
}

export const AutoCreateWordReminderModal = CSSModules(
  function ({ toggleModal }: Props) {
    const [reminder, setReminder] = useState("");
    const { user }: { user: User } = useOutletContext();
    const userId = String(user.id);
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const queryClient = useQueryClient();
    const { isPending, mutate } = useMutation({
      mutationFn: autoWordReminderService.createAutoWordReminder,
      onSuccess: () => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          CREATE_AUTO_WORD_REMINDER_NOTIFICATION_MSGS.createAutoWordReminder()
        );
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

    function handleReminderChange(event: ChangeEvent<HTMLInputElement>) {
      setReminder(event.target.value);
    }

    function handleCreate(formData: FormData) {
      const time = {
        minutes: Number(formData.get("minutes") as string),
        hours: Number(formData.get("hours") as string),
        days: Number(formData.get("days") as string),
        weeks: Number(formData.get("weeks") as string),
      };
      mutate({
        userId,
        body: {
          reminder: formData.get("reminder") as string,
          create_now: Boolean(formData.get("create_now") as string),
          duration: unitsToMs(time),
          word_count: Number(formData.get("word_count") as string),
          is_active: Boolean(formData.get("is_active") as string),
          has_reminder_onload: Boolean(
            formData.get("has_reminder_onload") as string
          ),
          has_learned_words: Boolean(
            formData.get("has_learned_words") as string
          ),
          sort_mode: formData.get("sort_mode") as SortMode,
        },
      });
    }

    return (
      <ModalContainer
        title="Create Auto Word Reminder"
        toggleModal={toggleModal}
      >
        <form styleName="modal__form" action={handleCreate}>
          <Reminder
            disabled={false}
            value={reminder}
            handleChange={handleReminderChange}
          />
          <Duration
            disabled={false}
            defaultValues={{ minutes: 0, hours: 0, days: 0, weeks: 0 }}
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
            <div styleName="modal__control">
              <label styleName="modal__label" htmlFor="has_learned_words">
                Has Learned Words
              </label>
              <input
                styleName="modal__input"
                type="checkbox"
                id="has_learned_words"
                name="has_learned_words"
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
                defaultValue={SortMode.Random}
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
            Create
          </button>
        </form>
      </ModalContainer>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);

const CREATE_AUTO_WORD_REMINDER_NOTIFICATION_MSGS = {
  createAutoWordReminder: () => {
    return "Word reminders will now be created automatically!";
  },
};
