import { Github } from "lucide-react";
import CSSModules from "react-css-modules";

import styles from "./Footer.module.css";

export const Footer = CSSModules(
  function () {
    return (
      <footer styleName="footer">
        <a
          styleName="footer__link"
          href="https://github.com/OptimisticTrousers/word-storer"
          aria-label="View source on Github (new tab)"
          target="_blank"
        >
          <Github styleName="footer__icon" />
        </a>
      </footer>
    );
  },
  styles,
  {
    allowMultiple: true,
    handleNotFoundStyleName: "log",
  }
);
