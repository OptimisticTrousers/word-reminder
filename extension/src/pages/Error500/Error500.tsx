import { FC } from "react";
import CSSModules from "react-css-modules";
import { Link } from "react-router-dom";
import styles from "./Error500.module.css";

interface Props {
  message: string;
}

const Error500: FC<Props> = CSSModules(
  ({ message }) => {
    return (
      <div styleName="error">
        <div styleName="error__container">
          <img
            styleName="error__image"
            src={"/images/robot.png"}
            alt="sad robot looking down"
          />
          <h2 styleName="error__number">500</h2>
          <hr styleName="error__break" />
          <p styleName="error__message">Internal Server Error: {message}</p>
          <Link styleName="error__link" to="/">
            Go back to the home page
          </Link>
        </div>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "ignore" }
);

export default Error500;
