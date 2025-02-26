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
import { AddToDate } from "../../ui/AddToDate";

interface Props {
  searchParams: URLSearchParams;
  toggleModal: ToggleModal;
}

export const AutoCreateWordReminderModal = CSSModules(
  function ({ searchParams, toggleModal }: Props) {
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
      mutate({
        userId,
        body: {
          auto: true,
          reminder: {
            minutes: Number(formData.get("reminder-minutes") as string),
            hours: Number(formData.get("reminder-hours") as string),
            days: Number(formData.get("reminder-days") as string),
            weeks: Number(formData.get("reminder-weeks") as string),
            months: Number(formData.get("reminder-months") as string),
          },
          create_now: Boolean(formData.get("create_now") as string),
          duration: {
            minutes: Number(formData.get("duration-minutes") as string),
            hours: Number(formData.get("duration-hours") as string),
            days: Number(formData.get("duration-days") as string),
            weeks: Number(formData.get("duration-weeks") as string),
            months: Number(formData.get("duration-months") as string),
          },
          word_count: Number(formData.get("word_count") as string),
          is_active: Boolean(formData.get("is_active") as string),
          has_reminder_onload: Boolean(
            formData.get("has_reminder_onload") as string
          ),
          has_learned_words: Boolean(
            formData.get("has_learned_words") as string
          ),
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
          <AddToDate legend="Reminder" disabled={false} />
          <AddToDate legend="Duration" disabled={false} />
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
