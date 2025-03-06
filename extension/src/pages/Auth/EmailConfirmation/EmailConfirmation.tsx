import { Subject, Template, User } from "common";
import CSSModules from "react-css-modules";
import { useQuery } from "@tanstack/react-query";

import { emailService } from "../../../services/email_service";
import styles from "./EmailConfirmation.module.css";
import { Loading } from "../../../components/ui/Loading";
import { Error500 } from "../../Error500";
import { useOutletContext } from "react-router-dom";

interface Props {
  email: string;
}

export const EmailConfirmation = CSSModules(
  function ({ email }: Props) {
    const { user }: { user: User } = useOutletContext();
    const userId = String(user.id);
    const { isLoading, failureReason } = useQuery({
      queryKey: ["emails"],
      queryFn: () => {
        return emailService.sendEmail({
          userId,
          body: {
            email: email,
            subject: Subject.CONFIRM_ACCOUNT,
            template: Template.CONFIRM_ACCOUNT,
          },
        });
      },
    });

    if (failureReason) {
      return <Error500 message={failureReason.message} />;
    }

    if (isLoading) {
      return <Loading />;
    }

    return (
      <div styleName="email-confirmation">
        <h2 styleName="email-confirmation__heading">Check your email</h2>
        <p styleName="email-confirmation__message">
          Follow the link in the email sent to
          <span styleName="email-confirmation__bold"> {email} </span>
          and continue creating your account.
        </p>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
