import { CircleAlert } from "lucide-react";
import CSSModules from "react-css-modules";

import styles from "./ErrorMessage.module.css";

interface Props {
  message: string;
}

export const ErrorMessage = CSSModules(
  function ({ message }: Props) {
    return (
      <p styleName="message">
        <CircleAlert styleName="message_icon" />
        <span styleName="message_text">{message}</span>
      </p>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
