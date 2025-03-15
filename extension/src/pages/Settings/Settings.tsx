import { Subject, Template, User } from "common";
import { MouseEvent, useContext, useState } from "react";
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
import { DeleteUserModal } from "../../components/modals/DeleteUserModal";
import { ThemeContext } from "../../context/Theme";

export const Settings = CSSModules(
  function () {
    const { user }: { user: User } = useOutletContext();
    const userId = String(user.id);
    const { showNotificationError } = useNotificationError();
    const { showNotification } = useContext(NotificationContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { isPending, mutate } = useMutation({
      mutationFn: emailService.sendEmail,
      onSuccess: (_, variables) => {
        let field = "";
        switch (variables.body.template) {
          case Template.CHANGE_EMAIL:
            field = "email";
            break;
          case Template.CHANGE_PASSWORD:
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

    function toggleDeleteModal() {
      setIsDeleteModalOpen((prevValue) => !prevValue);
    }

    function handleEmailClick(event: MouseEvent<HTMLInputElement>) {
      const name = event.currentTarget.name;
      let template = Template.CHANGE_EMAIL;
      let subject = Subject.CHANGE_EMAIL;
      switch (name) {
        case "email":
          subject = Subject.CHANGE_EMAIL;
          template = Template.CHANGE_EMAIL;
          break;
        case "password":
          subject = Subject.CHANGE_PASSWORD;
          template = Template.CHANGE_PASSWORD;
          break;
      }
      mutate({
        userId,
        body: {
          email: user.email,
          subject,
          template,
        },
      });
    }

    const disabled = isPending;

    return (
      <section
        styleName={`settings settings--${theme}`}
        aria-labelledby="heading"
      >
        <h2 styleName="settings__heading" id="heading">
          Change Account Details
        </h2>
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
              onClick={handleEmailClick}
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
              onClick={handleEmailClick}
              disabled={disabled}
            />
          </div>
          <div styleName="settings__control">
            <label styleName="settings__label" htmlFor="user">
              Delete User
            </label>
            <input
              id="user"
              type="button"
              name="user"
              styleName="settings__input"
              onClick={toggleDeleteModal}
              disabled={disabled}
            />
          </div>
          <div styleName="settings__control">
            <button
              styleName="settings__button"
              onClick={toggleTheme}
              role="switch"
            >
              Toggle Theme
            </button>
          </div>
        </div>
        {isDeleteModalOpen && (
          <DeleteUserModal toggleModal={toggleDeleteModal} />
        )}
      </section>
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
