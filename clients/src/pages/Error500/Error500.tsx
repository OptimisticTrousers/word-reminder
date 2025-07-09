import CSSModules from "react-css-modules";
import { Link } from "react-router-dom";

import robotImage from "../../assets/images/robot.png";
import styles from "./Error500.module.css";

export interface Props {
  message?: string;
}

export const Error500 = CSSModules(
  function ({ message }: Props) {
    return (
      <div styleName="error">
        <div styleName="error__container">
          <img styleName="error__image" src={robotImage} alt="" />
          <h2 styleName="error__number">500 Error</h2>
          <hr styleName="error__break" />
          <p styleName="error__message">
            Internal Server Error: {message || "unknown error"}
          </p>
          <Link styleName="error__link" to="/">
            Go back to the home page.
          </Link>
        </div>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
