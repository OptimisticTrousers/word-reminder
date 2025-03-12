import CSSModules from "react-css-modules";
import styles from "./ForgotPassword.module.css";
import { EMAIL_MAX, Subject, Template } from "common";
import { useMutation } from "@tanstack/react-query";
import { emailService } from "../../../services/email_service";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { useContext, useRef } from "react";
import {
  NotificationContext,
  NOTIFICATION_ACTIONS,
} from "../../../context/Notification";
import { Link } from "react-router-dom";

export const ForgotPassword = CSSModules(
  function () {
    const emailRef = useRef<string>("");
    const { showNotificationError } = useNotificationError();
    const { showNotification } = useContext(NotificationContext);
    const { isPending, mutate } = useMutation({
      mutationFn: emailService.sendEmail,
      onSuccess: () => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          FORGOT_PASSWORD_NOTIFICATION_MSGS.sendEmail()
        );
      },
      onError: showNotificationError,
    });

    function handleSubmit(formData: FormData) {
      const email = formData.get("email") as string;
      emailRef.current = email;
      mutate({
        userId: undefined,
        body: {
          email,
          subject: Subject.FORGOT_PASSWORD,
          template: Template.FORGOT_PASSWORD,
        },
      });
    }

    const disabled = isPending;

    return (
      <div styleName="enter-email">
        <h2 styleName="enter-email__heading">Reset your password</h2>
        <p styleName="enter-email__description">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
        <form styleName="enter-email__form" action={handleSubmit}>
          <div styleName="enter-email__control">
            <label htmlFor="email" styleName="enter-email__label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              styleName="enter-email__input"
              required={true}
              disabled={disabled}
              maxLength={EMAIL_MAX}
            />
          </div>
          <button
            styleName="enter-email__button"
            type="submit"
            disabled={disabled}
          >
            {disabled
              ? "Sending verification email..."
              : "Send verification email"}
          </button>
        </form>
        <Link styleName="enter-email__link" to="/login">
          Go back to login
        </Link>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);

const FORGOT_PASSWORD_NOTIFICATION_MSGS = {
  sendEmail: () => {
    return `A confirmation email was sent to your email to reset your password.`;
  },
};
