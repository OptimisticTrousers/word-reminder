import { User } from "common";
import { useContext } from "react";
import CSSModules from "react-css-modules";
import { useOutletContext } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../../context/Notification";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { ModalContainer } from "../ModalContainer";
import { wordReminderService } from "../../../services/word_reminder_service";
import { ErrorResponse } from "../../../types";
import styles from "./DeleteWordReminderModal.module.css";
import { ToggleModal } from "../types";

interface Props {
  toggleModal: ToggleModal;
  wordReminderId: string;
}

export const DeleteWordReminderModal = CSSModules(
  function ({ toggleModal, wordReminderId }: Props) {
    const { user }: { user: User } = useOutletContext();
    const userId = user.id;
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const { isPending, mutate } = useMutation({
      mutationFn: wordReminderService.deleteWordReminder,
      onSuccess: () => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          WORD_REMINDER_NOTIFICATION_MSGS.deleteWordReminder()
        );
      },
      onError: (response: ErrorResponse) => {
        showNotificationError(response);
      },
      onSettled: () => {
        toggleModal();
      },
    });

    function handleCancel() {
      toggleModal();
    }

    const handleDelete = () => {
      mutate({ userId, wordReminderId });
    };

    return (
      <ModalContainer title="Delete Word Reminder" toggleModal={toggleModal}>
        <form styleName="modal" action={handleDelete}>
          <p styleName="modal__alert">
            Are you sure you want to delete this word reminder?
          </p>
          <p styleName="modal__message">You can't undo this action.</p>
          <div styleName="modal__buttons">
            <button
              styleName="modal__button modal__button--cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              styleName="modal__button modal__button--delete"
              type="submit"
              disabled={isPending}
            >
              Delete
            </button>
          </div>
        </form>
      </ModalContainer>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);

const WORD_REMINDER_NOTIFICATION_MSGS = {
  deleteWordReminder: () => {
    return "You have successfully deleted a word reminder!";
  },
};
