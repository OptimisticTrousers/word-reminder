import { Subject, Templates } from "common";
import CSSModules from "react-css-modules";
import { useQuery } from "@tanstack/react-query";

import { emailService } from "../../../services/email_service";
import styles from "./EmailConfirmation.module.css";
import { Loading } from "../../../components/ui/Loading";
import { Error500 } from "../../Error500";

interface Props {
  email: string;
}

export const EmailConfirmation = CSSModules(
  function ({ email }: Props) {
    const { isLoading, failureReason } = useQuery({
      queryKey: ["emails"],
      queryFn: () => {
        return emailService.sendEmail({
          email: email,
          subject: Subject.CHANGE_VERIFICATION,
          template: Templates.CONFIRM_EMAIL,
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
