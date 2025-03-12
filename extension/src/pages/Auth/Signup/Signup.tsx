import { EMAIL_MAX, PASSWORD_MAX, User } from "common";
import { useContext } from "react";
import CSSModules from "react-css-modules";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { AUTH_NOTIFICATION_MSGS } from "../constants";
import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../../context/Notification";
import { sessionService } from "../../../services/session_service";
import { userService } from "../../../services/user_service";
import { Response } from "../../../types";
import styles from "../Auth.module.css";
import { useNotificationError } from "../../../hooks/useNotificationError";

export const Signup = CSSModules(
  function () {
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const navigate = useNavigate();

    const { status, mutate } = useMutation({
      mutationFn: async (data: { email: string; password: string }) => {
        await userService.signupUser(data);
        return sessionService.loginUser(data);
      },
      onSuccess: (response: Response & { json: { user: User } }) => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          SIGNUP_AUTH_NOTIFICATION_MSGS.signup(response.json.user.email)
        );
        navigate("/userWords");
      },
      onError: showNotificationError,
    });

    function handleSubmit(formData: FormData) {
      mutate({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });
    }

    const disabled = status === "pending";

    return (
      <section styleName="auth auth--register">
        <div styleName="auth__hero">
          <h2 styleName="auth__heading">Word Storer</h2>
          <p styleName="auth__description">
            Log in or create a new account to start storing your words.
          </p>
        </div>
        <form styleName="auth__form" action={handleSubmit}>
          <nav styleName="auth__navigation">
            <p styleName="auth__redirect">
              Already have an account?{" "}
              <Link styleName="auth___link" to="/login">
                Login
              </Link>
            </p>
            <h3 styleName="auth__title">Create account</h3>
            <button styleName="auth__button" type="submit" disabled={disabled}>
              {disabled ? "Signing up..." : "Signup"}
            </button>
          </nav>
          <div styleName="auth__control">
            <label htmlFor="email" styleName="auth__label">
              Email <span styleName="auth__required">(required)</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              styleName="auth__input"
              required={true}
              disabled={disabled}
              maxLength={EMAIL_MAX}
            />
          </div>
          <div className={`${styles.auth__control}`}>
            <label htmlFor="password" className={`${styles.auth__label}`}>
              Password <span styleName="auth__required">(required)</span>
            </label>
            <input
              className={`${styles.auth__input}`}
              id="password"
              type="password"
              name="password"
              required={true}
              disabled={disabled}
              maxLength={PASSWORD_MAX}
            />
          </div>
          <p className={`${styles.auth__help}`}>
            <b>Important:</b> Your password cannot be recovered if you forget
            it!
          </p>
        </form>
      </section>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);

const SIGNUP_AUTH_NOTIFICATION_MSGS = {
  ...AUTH_NOTIFICATION_MSGS,
  signup: (email: string) => {
    return `You have successfully signed in, ${email}.`;
  },
};
