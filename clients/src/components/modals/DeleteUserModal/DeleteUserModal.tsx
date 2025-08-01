import { User } from "common";
import { useContext } from "react";
import CSSModules from "react-css-modules";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  NotificationContext,
  NOTIFICATION_ACTIONS,
} from "../../../context/Notification";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { ModalContainer } from "../ModalContainer";
import { ErrorResponse } from "../../../types";
import styles from "./DeleteUserModal.module.css";
import { ToggleModal } from "../types";
import { userService } from "../../../services/user_service";
import { extension } from "../../../utils/extension/extension";

interface Props {
  toggleModal: ToggleModal;
}

export const DeleteUserModal = CSSModules(
  function ({ toggleModal }: Props) {
    const navigate = useNavigate();
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const queryClient = useQueryClient();
    const { isPending, mutate } = useMutation({
      mutationFn: userService.deleteUser,
      onSuccess: async () => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          USER_NOTIFICATION_MSGS.deleteUser()
        );
        await extension.storage.sync.remove("userId");
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

    async function handleDelete() {
      mutate({ userId });
      queryClient.clear();
      await navigate("/login");
    }

    function handleCancel() {
      toggleModal();
    }

    return (
      <ModalContainer title="Delete User" toggleModal={toggleModal}>
        <form styleName="modal" action={handleDelete}>
          <p styleName="modal__alert">
            Are you sure you want to delete your account?
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

const USER_NOTIFICATION_MSGS = {
  deleteUser: () => {
    return "You have successfully your user!";
  },
};
