import { Templates, User } from "common";
import { MouseEvent, useState } from "react";
import CSSModules from "react-css-modules";
import { useOutletContext } from "react-router-dom";

import { UserChangeModal } from "../../components/modals/UserChangeModal";
import styles from "./Settings.module.css";
import { useMutation } from "@tanstack/react-query";
import { emailService } from "../../services/email_service";
import { useNotificationError } from "../../hooks/useNotificationError";
import { ErrorResponse } from "../../types";

export const Settings = CSSModules(
  function () {
    const { user }: { user: User } = useOutletContext();
    const { showNotificationError } = useNotificationError();
    const { isPending, mutate } = useMutation({
      mutationFn: emailService.sendEmail,
      onSuccess: () => {
        toggleModal();
      },
      onError: (response: ErrorResponse) => {
        showNotificationError(response);
      },
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [path, setPath] = useState("");

    function handleClick(event: MouseEvent<HTMLButtonElement>) {
      const value = event.currentTarget.value;
      setPath(`/${value}`);
      const subject = `Change Your ${value[0].toUpperCase() + value.slice(1)}`;
      let template = "";
      switch (value) {
        case "email":
          template = Templates.CHANGE_EMAIL_VERIFICATION;
          break;
        case "password":
          template = Templates.CHANGE_PASSWORD_VERIFICATION;
          break;
      }
      mutate({
        email: user.email,
        subject,
        template,
      });
    }

    function toggleModal() {
      setIsModalOpen((prevValue) => !prevValue);
    }

    return (
      <>
        <div styleName="settings">
          <div styleName="settings__field">
            <p styleName="settings__email">Email: {user.email}</p>
            <button
              styleName="settings__button"
              value="email"
              onClick={handleClick}
              disabled={isPending}
            >
              Change Email
            </button>
          </div>
          <div styleName="settings__field">
            <p styleName="settings__password">Password: *********</p>
            <button
              styleName="settings__button"
              value="password"
              onClick={handleClick}
              disabled={isPending}
            >
              Change Password
            </button>
          </div>
        </div>
        {isModalOpen && (
          <UserChangeModal toggleModal={toggleModal} path={path} />
        )}
      </>
    );
  },
  styles,
  {
    allowMultiple: true,
    handleNotFoundStyleName: "log",
  }
);
