import { FC } from "react";
import CSSModules from "react-css-modules";
import { GoAlert } from "react-icons/go";
import styles from "./ErrorMessage.module.css";

interface Props {
  message: string;
}

const ErrorMessage: FC<Props> = CSSModules(
  ({ message }) => {
    return (
      <p styleName="message">
        <GoAlert styleName="message__icon" />
        <span styleName="message__text">{message}</span>
      </p>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default ErrorMessage;
