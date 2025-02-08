import { Order, User } from "common";
import CSSModules from "react-css-modules";
import { useOutletContext } from "react-router-dom";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { ToggleModal } from "../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wordReminderService } from "../../../services/word_reminder_service";
import { useContext } from "react";
import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../../context/Notification";
import { ModalContainer } from "../ModalContainer";
import styles from "./AutoCreateWordReminderModal.module.css";

interface Props {
  toggleModal: ToggleModal;
}

// TODO: Pass searchParams into this code so that it can invalidate the query correctly.
export const AutoCreateWordReminderModal = CSSModules(
  function ({ toggleModal }: Props) {
    const { user }: { user: User } = useOutletContext();
    const userId = user.id;
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const queryClient = useQueryClient();
    const { isPending, mutate } = useMutation({
      mutationFn: wordReminderService.createWordReminder,
      onSuccess: () => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          AUTO_CREATE_WORD_REMINDER_NOTIFICATION_MSGS.autoCreateWordReminder()
        );
        queryClient.invalidateQueries({
          queryKey: ["wordReminders"],
          exact: true,
        });
      },
      onError: showNotificationError,
      onSettled: () => {
        toggleModal();
      },
    });

    function handleCreate(formData: FormData) {
      mutate({
        userId,
        body: {
          auto: true,
          reminder: formData.get("reminder") as string,
          duration: formData.get("duration") as string,
          wordCount: Number(formData.get("wordCount") as string),
          isActive: Boolean(formData.get("isActive") as string),
          hasReminderOnload: Boolean(
            formData.get("hasReminderOnload") as string
          ),
          hasLearnedWords: Boolean(formData.get("hasLearnedWords") as string),
          order: formData.get("order") as Order,
        },
      });
    }

    return (
      <ModalContainer
        title="Automatically Create Word Reminder"
        toggleModal={toggleModal}
      >
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
            <label styleName="modal__label" htmlFor="duration">
              Duration
            </label>
            <input
              styleName="modal__input"
              type="text"
              id="duration"
              name="duration"
              placeholder="1 week, 2 weeks, 10 days"
              required
              maxLength={10}
            />
          </div>
          <div styleName="modal__control">
            <label styleName="modal__label" htmlFor="wordCount">
              Word Count
            </label>
            <input
              styleName="modal__input"
              type="number"
              id="wordCount"
              name="wordCount"
              required
              max={99}
            />
          </div>
          <fieldset styleName="modal__fieldset">
            <legend styleName="modal__legend">Options</legend>
            <div styleName="modal__control">
              <label styleName="modal__label" htmlFor="isActive">
                Is Active
              </label>
              <input
                styleName="modal__input"
                type="checkbox"
                id="isActive"
                name="isActive"
                defaultChecked
              />
            </div>
            <div styleName="modal__control">
              <label styleName="modal__label" htmlFor="hasReminderOnload">
                Has Reminder Onload
              </label>
              <input
                styleName="modal__input"
                type="checkbox"
                id="hasReminderOnload"
                name="hasReminderOnload"
                defaultChecked
              />
            </div>
            <div styleName="modal__control">
              <label styleName="modal__label" htmlFor="hasLearnedWords">
                Has Learned Words
              </label>
              <input
                styleName="modal__input"
                type="checkbox"
                id="hasLearnedWords"
                name="hasLearnedWords"
              />
            </div>
            <div styleName="modal__control">
              <label styleName="modal__label" htmlFor="order">
                Order
              </label>
              <select
                styleName="modal__select"
                name="order"
                id="order"
                required
                defaultValue={Order.Random}
              >
                <option styleName="modal__option" value={Order.Newest}>
                  Newest
                </option>
                <option styleName="modal__option" value={Order.Oldest}>
                  Oldest
                </option>
                <option styleName="modal__option" value={Order.Random}>
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

const AUTO_CREATE_WORD_REMINDER_NOTIFICATION_MSGS = {
  autoCreateWordReminder: () => {
    return "Word reminders will now be created automatically!";
  },
};
