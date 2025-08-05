import { Subject, Template, User } from "common";
import CSSModules from "react-css-modules";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { emailService } from "../../../services/email_service";
import styles from "./EmailConfirmation.module.css";
import { Loading } from "../../../components/ui/Loading";
import { Error500 } from "../../Error500";
import { sessionService } from "../../../services/session_service";
import { extension } from "../../../utils/extension";
import { useNotificationError } from "../../../hooks/useNotificationError";
import { useNavigate } from "react-router-dom";

interface Props {
  user: User;
}

export const EmailConfirmation = CSSModules(
  function ({ user }: Props) {
    const userId = String(user.id);
    const { showNotificationError } = useNotificationError();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { isLoading, failureReason } = useQuery({
      queryKey: ["emails"],
      queryFn: () => {
        return emailService.sendEmail({
          userId,
          body: {
            email: user.email,
            subject: Subject.CONFIRM_ACCOUNT,
            template: Template.CONFIRM_ACCOUNT,
          },
        });
      },
    });
    const { isPending, mutate } = useMutation({
      mutationFn: sessionService.logoutUser,
      onSettled: async () => {
        await extension.storage.sync.remove("userId");
        await navigate("/login");
      },
      onError: showNotificationError,
    });

    async function handleLogout() {
      mutate();
      queryClient.clear();
    }

    if (failureReason) {
      return <Error500 message={failureReason.message} />;
    }

    if (isLoading) {
      return <Loading />;
    }

    const disabled = isPending;

    return (
      <div styleName="email-confirmation">
        <div styleName="email-confirmation__container">
          <img
            styleName="email-confirmation__image"
            src="/images/word-reminder.png"
            alt=""
          />
        </div>
        <h2 styleName="email-confirmation__heading">Check your email</h2>
        <p styleName="email-confirmation__message">
          Follow the link in the email sent to
          <span styleName="email-confirmation__bold"> {user.email} </span>
          to create, verify, and use your account.
        </p>
        <button
          styleName="email-confirmation__button"
          onClick={handleLogout}
          disabled={disabled}
        >
          Cancel
        </button>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
