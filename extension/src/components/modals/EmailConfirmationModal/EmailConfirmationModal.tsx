import { Subject, Templates, TOKEN_MAX_BYTES, User } from "common";
import { useContext } from "react";
import CSSModules from "react-css-modules";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  NotificationContext,
  NOTIFICATION_ACTIONS,
} from "../../../context/Notification";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { ModalContainer } from "../ModalContainer";
import { emailService } from "../../../services/email_service";
import styles from "./EmailConfirmationModal.module.css";

export const EmailConfirmationModal = CSSModules(
  function () {
    const { user }: { user: User } = useOutletContext();
    const navigate = useNavigate();
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const { isLoading } = useQuery({
      queryKey: ["emails"],
      queryFn: () => {
        return emailService.sendEmail({
          email: user.email,
          subject: Subject.CHANGE_VERIFICATION,
          template: Templates.CHANGE_VERIFICATION,
        });
      },
      throwOnError: true,
    });
    const {
      isPending: verifyEmailTokenIsPending,
      mutate: verifyEmailTokenMutate,
    } = useMutation({
      mutationFn: emailService.verifyEmailToken,
      onError: showNotificationError,
      onSuccess: () => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          EMAIL_CONFIRMATION_NOTIFICATION_MSGS.confirmEmail(user.email)
        );
        navigate("/userWords");
      },
    });

    function handleConfirm(formData: FormData) {
      const body = {
        token: formData.get("token") as string,
      };
      verifyEmailTokenMutate(body);
    }

    const disabled = isLoading || verifyEmailTokenIsPending;

    return (
      <ModalContainer title="Confirm your email" toggleModal={function () {}}>
        <form styleName="modal" action={handleConfirm}>
          <p styleName="modal__message">
            Please enter the confirmation code that was sent to{" "}
            <span styleName="modal__bold">{user.email}</span> within 5 minutes.
          </p>
          <label styleName="modal__label">
            Code
            <input
              styleName="modal__input"
              name="token"
              type="text"
              required={true}
              disabled={disabled}
              maxLength={TOKEN_MAX_BYTES}
            />
          </label>
          <div styleName="modal__buttons">
            <button
              styleName="modal__button modal__button--confirm"
              type="submit"
              disabled={disabled}
            >
              Enter Code
            </button>
          </div>
        </form>
      </ModalContainer>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);

const EMAIL_CONFIRMATION_NOTIFICATION_MSGS = {
  confirmEmail: (email: string) => {
    return `You have confirmed your email: ${email}`;
  },
};
