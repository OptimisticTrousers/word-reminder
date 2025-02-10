import { EMAIL_MAX, PASSWORD_MAX, Subject, Templates, User } from "common";
import { useContext, useState } from "react";
import CSSModules from "react-css-modules";
import { useOutletContext, useParams } from "react-router-dom";

import { UserChangeModal } from "../../components/modals/UserChangeModal";
import styles from "./Settings.module.css";
import { useMutation, useQuery } from "@tanstack/react-query";
import { emailService } from "../../services/email_service";
import { useNotificationError } from "../../hooks/useNotificationError";
import { Loading } from "../../components/ui/Loading";
import { Error500 } from "../Error500";
import { userService } from "../../services/user_service";
import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../context/Notification";

export const Settings = CSSModules(
  function () {
    const { user }: { user: User } = useOutletContext();
    const { token } = useParams();
    const { data, failureReason, isLoading } = useQuery({
      queryKey: ["emails", token],
      queryFn: () => {
        return emailService.verifyEmailToken({ token });
      },
      throwOnError: true,
      staleTime: STALE_TIME,
    });
    const { showNotificationError } = useNotificationError();
    const { showNotification } = useContext(NotificationContext);
    const { isPending: sendEmailIsPending, mutate: sendEmailMutate } =
      useMutation({
        mutationFn: emailService.sendEmail,
        onSuccess: () => {
          toggleModal();
        },
        onError: showNotificationError,
      });

    const { isPending: updateUserIsPending, mutate: updateUserMutate } =
      useMutation({
        mutationFn: userService.updateUser,
        onSuccess: () => {
          showNotification(
            NOTIFICATION_ACTIONS.SUCCESS,
            SETTING_NOTIFICATION_MSGS.updateUser()
          );
        },
        onError: showNotificationError,
        onSettled: () => {
          toggleModal();
        },
      });

    const [isModalOpen, setIsModalOpen] = useState(false);

    function handleClick() {
      sendEmailMutate({
        email: user.email,
        subject: Subject.CHANGE_VERIFICATION,
        template: Templates.CHANGE_VERIFICATION,
      });
    }

    function handleSubmit(formData: FormData) {
      const newPassword = formData.get("newPassword") as string;
      const newPasswordConfirmation = formData.get(
        "newPasswordConfirmation"
      ) as string;

      if (newPassword !== newPasswordConfirmation) {
        showNotification(
          NOTIFICATION_ACTIONS.ERROR,
          "New Password and New Password Confirmation fields do not match. Please try again."
        );
        return;
      }

      updateUserMutate({
        id: user.id,
        email: formData.get("email") as string,
        newPassword,
        newPasswordConfirmation,
      });
    }

    function toggleModal() {
      setIsModalOpen((prevValue) => !prevValue);
    }

    if (isLoading) {
      return <Loading />;
    }

    if (failureReason) {
      return <Error500 message={failureReason.message} />;
    }

    const json = data?.json;

    const disabled = !json;

    return (
      <>
        <form styleName="settings" action={handleSubmit}>
          <h2 styleName="settings__heading">Change Account Details</h2>
          <div styleName="settings__control">
            <label styleName="settings__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              styleName="settings__input"
              defaultValue={user.email}
              disabled={disabled}
              maxLength={EMAIL_MAX}
              required={true}
            />
          </div>
          <div styleName="settings__control">
            <label styleName="settings__label" htmlFor="newPassword">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              name="newPassword"
              styleName="settings__input"
              placeholder="Password: *********"
              disabled={disabled}
              maxLength={PASSWORD_MAX}
            />
          </div>
          <div styleName="settings__control">
            <label
              styleName="settings__label"
              htmlFor="newPasswordConfirmation"
            >
              New Password Confirmation
            </label>
            <input
              id="newPasswordConfirmation"
              type="password"
              name="newPasswordConfirmation"
              styleName="settings__input"
              placeholder="Password: *********"
              disabled={disabled}
              maxLength={PASSWORD_MAX}
            />
          </div>
          {json ? (
            <button
              styleName="settings_button"
              type="submit"
              disabled={updateUserIsPending}
            >
              Submit
            </button>
          ) : (
            <button
              type="button"
              styleName="settings__button"
              value="email"
              onClick={handleClick}
              disabled={sendEmailIsPending}
            >
              Change
            </button>
          )}
        </form>
        {isModalOpen && <UserChangeModal toggleModal={toggleModal} />}
      </>
    );
  },
  styles,
  {
    allowMultiple: true,
    handleNotFoundStyleName: "log",
  }
);

const STALE_TIME = 30000; // 30 seconds in milliseconds
const SETTING_NOTIFICATION_MSGS = {
  updateUser: () => {
    return "You have successfully updated your account.";
  },
};
