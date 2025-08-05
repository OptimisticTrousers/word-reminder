import { EMAIL_MAX, PASSWORD_MAX, User } from "common";
import { useContext } from "react";
import CSSModules from "react-css-modules";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import { extension } from "../../../utils/extension";

export const Signup = CSSModules(
  function () {
    const { showNotification } = useContext(NotificationContext);
    const { showNotificationError } = useNotificationError();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { status, mutate } = useMutation({
      mutationFn: async (data: { email: string; password: string }) => {
        await userService.signupUser(data);
        return sessionService.loginUser(data);
      },
      onSuccess: async (response: Response & { json: { user: User } }) => {
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          SIGNUP_AUTH_NOTIFICATION_MSGS.signup(response.json.user.email)
        );
        await queryClient.invalidateQueries({
          queryKey: ["sessions"],
          exact: true,
        });
        await extension.storage.sync.set({ userId: response.json.user.id });
        await extension.runtime.sendMessage(null);
      },
      onError: showNotificationError,
    });

    async function handleSubmit(formData: FormData) {
      mutate({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });
      await navigate("/userWords");
    }

    const disabled = status === "pending";

    return (
      <section styleName="auth">
        <div styleName="auth__hero">
          <div styleName="auth__container">
            <img
              styleName="auth__image"
              src="/images/word-reminder.png"
              alt=""
            />
          </div>
          <h2 styleName="auth__heading">Word Reminder</h2>
          <p styleName="auth__description">
            Log in or create a new account to start storing your words.
          </p>
        </div>
        <form styleName="auth__form" action={handleSubmit}>
          <nav styleName="auth__navigation">
            <div styleName="auth__redirect">
              Already have an account?{" "}
              <Link styleName="auth__link" to="/login">
                Login
              </Link>
            </div>
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
          <div className="auth__control">
            <label htmlFor="password" className="auth__label">
              Password <span styleName="auth__required">(required)</span>
            </label>
            <input
              styleName="auth__input"
              id="password"
              type="password"
              name="password"
              required={true}
              disabled={disabled}
              maxLength={PASSWORD_MAX}
            />
          </div>
        </form>
      </section>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

const SIGNUP_AUTH_NOTIFICATION_MSGS = {
  ...AUTH_NOTIFICATION_MSGS,
  signup: (email: string) => {
    return `You have successfully signed in, ${email}.`;
  },
};
