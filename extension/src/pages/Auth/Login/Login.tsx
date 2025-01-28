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
import { ErrorResponse, Response } from "../../../types";
import styles from "../Auth.module.css";

export const Login = CSSModules(
  function () {
    const { showNotification } = useContext(NotificationContext);
    const navigate = useNavigate();

    const { status, mutate } = useMutation({
      mutationFn: sessionService.loginUser,
      onSuccess: (response: Response & { json: { user: User } }) => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          LOGIN_AUTH_NOTIFICATION_MSGS.login(response.json.user.email)
        );
        navigate("/words");
      },
      onError: (response: ErrorResponse) => {
        showNotification(NOTIFICATION_ACTIONS.ERROR, response.json.message);
      },
    });

    function handleSubmit(formData: FormData) {
      mutate({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });
    }

    const disabled = status === "pending";

    return (
      <section styleName="auth auth--login">
        <div styleName="auth__hero">
          <h2 styleName="auth__heading">Word Storer</h2>
          <p styleName="auth__description">
            Log in or create a new account to start storing your words.
          </p>
        </div>
        <form styleName="auth__form" action={handleSubmit}>
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
          <div styleName="auth__control">
            <label htmlFor="password" styleName="auth__label">
              Password <span styleName="auth__required">(required)</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              styleName="auth__input"
              required={true}
              disabled={disabled}
              maxLength={PASSWORD_MAX}
            />
          </div>
          <button styleName="auth__button" type="submit" disabled={disabled}>
            Login
          </button>
        </form>
        <p styleName="auth__redirect">
          New around here?{" "}
          <Link styleName="auth_link" to="/register">
            Create account
          </Link>
        </p>
      </section>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);

const LOGIN_AUTH_NOTIFICATION_MSGS = {
  ...AUTH_NOTIFICATION_MSGS,
  login: (email: string) => {
    return `You have successfully logged in, ${email}.`;
  },
};
