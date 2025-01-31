import { CODE_MAX_BYTES, User } from "common";
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
import { emailService } from "../../../services/email_service";
import { ErrorResponse } from "../../../types";
import styles from "./EmailConfirmationModal.module.css";

interface Props {
  toggleModal: () => void;
}

export const EmailConfirmationModal = CSSModules(
  function ({ toggleModal }: Props) {
    const { user }: { user: User } = useOutletContext();
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const { isPending, mutate } = useMutation({
      mutationFn: emailService.verifyEmailCode,
      onError: (response: ErrorResponse) => {
        showNotificationError(response);
      },
      onSuccess: () => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          EMAIL_CONFIRMATION_NOTIFICATION_MSGS.confirmEmail(user.email)
        );
      },
      onSettled: () => {
        toggleModal();
      },
    });

    function handleConfirm(formData: FormData) {
      const body = {
        code: formData.get("code") as string,
      };
      mutate(body);
    }

    function handleCancel() {
      toggleModal();
    }

    return (
      <ModalContainer title="Confirm your email" toggleModal={toggleModal}>
        <form styleName="modal" action={handleConfirm}>
          <p styleName="modal__message">
            Please enter the confirmation code that was sent to{" "}
            <span styleName="modal__bold">{user.email}</span> within 5 minutes.
          </p>
          <label styleName="modal__label">
            Code
            <input
              styleName="modal__input"
              name="code"
              type="text"
              required={true}
              disabled={isPending}
              maxLength={CODE_MAX_BYTES}
            />
          </label>
          <div styleName="modal__buttons">
            <button
              styleName="modal__button modal__button--cancel"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              styleName="modal__button modal__button--confirm"
              type="submit"
              disabled={isPending}
            >
              Enter Code
            </button>
          </div>
        </form>
      </ModalContainer>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

const EMAIL_CONFIRMATION_NOTIFICATION_MSGS = {
  confirmEmail: (email: string) => {
    return `You have confirmed your email: ${email}`;
  },
};
