import { User } from "common";
import { useContext } from "react";
import CSSModules from "react-css-modules";
import { useOutletContext } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import {
  NotificationContext,
  NOTIFICATION_ACTIONS,
} from "../../../context/Notification";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { ModalContainer } from "../ModalContainer";
import { ErrorResponse } from "../../../types";
import { wordService } from "../../../services/word_service";
import styles from "./DeleteUserWordModal.module.css";

interface Props {
  toggleModal: () => void;
  wordId: string;
}

export const DeleteUserWordModal = CSSModules(
  function ({ toggleModal, wordId }: Props) {
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const { isPending, mutate } = useMutation({
      mutationFn: wordService.deleteUserWord,
      onSuccess: () => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          USER_WORD_NOTIFICATION_MSGS.deleteUserWord()
        );
      },
      onError: (response: ErrorResponse) => {
        showNotificationError(response);
      },
    });
    const { user }: { user: User } = useOutletContext();
    const userId = user.id;

    function handleDelete() {
      mutate({ userId, wordId });
    }

    function handleCancel() {
      toggleModal();
    }

    return (
      <ModalContainer title="Delete User Word" toggleModal={toggleModal}>
        <form styleName="modal" action={handleDelete}>
          <p styleName="modal__alert">
            Are you sure you want to delete your words by duration?
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

const USER_WORD_NOTIFICATION_MSGS = {
  deleteUserWord: () => {
    return "You have successfully deleted a word!";
  },
};
