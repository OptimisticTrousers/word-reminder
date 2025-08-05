import { User } from "common";
import { useContext } from "react";
import CSSModules from "react-css-modules";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  NotificationContext,
  NOTIFICATION_ACTIONS,
} from "../../../context/Notification";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { ModalContainer } from "../ModalContainer";
import { ErrorResponse } from "../../../types";
import styles from "./DeleteUserWordModal.module.css";
import { ToggleModal } from "../types";
import { userWordService } from "../../../services/user_word_service";

interface Props {
  toggleModal: ToggleModal;
  userWordId: string;
}

export const DeleteUserWordModal = CSSModules(
  function ({ toggleModal, userWordId }: Props) {
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const queryClient = useQueryClient();
    const { isPending, mutate } = useMutation({
      mutationFn: userWordService.deleteUserWord,
      onSuccess: () => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          USER_WORD_NOTIFICATION_MSGS.deleteUserWord()
        );
        queryClient.invalidateQueries({
          queryKey: ["userWords"],
        });
      },
      onError: (response: ErrorResponse) => {
        showNotificationError(response);
      },
      onSettled: () => {
        toggleModal();
      },
    });
    const { user }: { user: User } = useOutletContext();
    const userId = String(user.id);

    function handleDelete() {
      mutate({ userId, userWordId });
    }

    function handleCancel() {
      toggleModal();
    }

    return (
      <ModalContainer title="Delete User Word" toggleModal={toggleModal}>
        <form styleName="modal" action={handleDelete}>
          <p styleName="modal__alert">
            Are you sure you want to delete your user word?
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

const USER_WORD_NOTIFICATION_MSGS = {
  deleteUserWord: () => {
    return "You have successfully deleted a word!";
  },
};
