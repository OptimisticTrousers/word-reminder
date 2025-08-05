import { User } from "common";
import { useContext } from "react";
import CSSModules from "react-css-modules";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../../context/Notification";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { ModalContainer } from "../ModalContainer";
import { ErrorResponse } from "../../../types";
import styles from "./DeleteAutoWordReminderModal.module.css";
import { ToggleModal } from "../types";
import { autoWordReminderService } from "../../../services/auto_word_reminder_service/auto_word_reminder_service";

interface Props {
  toggleModal: ToggleModal;
  autoWordReminderId: string;
}

export const DeleteAutoWordReminderModal = CSSModules(
  function ({ toggleModal, autoWordReminderId }: Props) {
    const { user }: { user: User } = useOutletContext();
    const userId = String(user.id);
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const queryClient = useQueryClient();
    const { isPending, mutate } = useMutation({
      mutationFn: autoWordReminderService.deleteAutoWordReminder,
      onSuccess: () => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          AUTO_WORD_REMINDER_NOTIFICATION_MSGS.deleteWordReminder()
        );
        queryClient.invalidateQueries({
          queryKey: ["autoWordReminders"],
          exact: true,
        });
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
      mutate({ userId, autoWordReminderId });
    };

    return (
      <ModalContainer
        title="Delete Auto Word Reminder"
        toggleModal={toggleModal}
      >
        <form styleName="modal" action={handleDelete}>
          <p styleName="modal__alert">
            Are you sure you want to delete this auto word reminder?
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
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

const AUTO_WORD_REMINDER_NOTIFICATION_MSGS = {
  deleteWordReminder: () => {
    return "You have successfully deleted an auto word reminder!";
  },
};
