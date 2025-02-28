import { Subject, Templates, User } from "common";
import { MouseEvent, useContext } from "react";
import CSSModules from "react-css-modules";
import { useOutletContext } from "react-router-dom";

import styles from "./Settings.module.css";
import { useMutation } from "@tanstack/react-query";
import { emailService } from "../../services/email_service";
import { useNotificationError } from "../../hooks/useNotificationError";
import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../context/Notification";

export const Settings = CSSModules(
  function () {
    const { user }: { user: User } = useOutletContext();
    const { showNotificationError } = useNotificationError();
    const { showNotification } = useContext(NotificationContext);
    const { isPending, mutate } = useMutation({
      mutationFn: emailService.sendEmail,
      onSuccess: (_, variables) => {
        let field = "";
        switch (variables.template) {
          case Templates.CHANGE_EMAIL:
            field = "email";
            break;
          case Templates.CHANGE_PASSWORD:
            field = "password";
            break;
        }
        showNotification(
          NOTIFICATION_ACTIONS.SUCCESS,
          SETTINGS_NOTIFICATION_MSGS.sendEmail(field)
        );
      },
      onError: showNotificationError,
    });

    function handleClick(event: MouseEvent<HTMLInputElement>) {
      const name = event.currentTarget.name;
      let template = "";
      switch (name) {
        case "email":
          template = Templates.CHANGE_EMAIL;
          break;
        case "password":
          template = Templates.CHANGE_PASSWORD;
          break;
      }
      mutate({
        email: user.email,
        subject: Subject.CHANGE_VERIFICATION,
        template,
      });
    }

    const disabled = isPending;

    return (
      <div styleName="settings">
        <h2 styleName="settings__heading">Change Account Details</h2>
        <div styleName="settings__buttons">
          <div styleName="settings__control">
            <label styleName="settings__label" htmlFor="email">
              Change Email
            </label>
            <input
              id="email"
              type="button"
              name="email"
              styleName="settings__input"
              onClick={handleClick}
              disabled={disabled}
            />
          </div>
          <div styleName="settings__control">
            <label styleName="settings__label" htmlFor="password">
              Change Password
            </label>
            <input
              id="password"
              type="button"
              name="password"
              styleName="settings__input"
              onClick={handleClick}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    );
  },
  styles,
  {
    allowMultiple: true,
    handleNotFoundStyleName: "log",
  }
);

const SETTINGS_NOTIFICATION_MSGS = {
  sendEmail: (field: string) => {
    return `A confirmation email was sent to your email to update your ${field}.`;
  },
};
