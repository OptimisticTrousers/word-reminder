import CSSModules from "react-css-modules";
import { Link, useLocation } from "react-router-dom";

import styles from "./Navigation.module.css";

export const Navigation = CSSModules(
  function () {
    const { pathname } = useLocation();

    let isUserWordsActive = false;
    let isWordRemindersActive = false;

    if (pathname === "/userWords") {
      isUserWordsActive = true;
    } else if (pathname === "/wordReminders") {
      isWordRemindersActive = true;
    }

    return (
      <nav styleName="navigation">
        <Link
          to="/userWords"
          styleName={`navigation__link ${
            isUserWordsActive && "navigation__link--active"
          }`}
          aria-current={isUserWordsActive && "page"}
        >
          User Words
        </Link>
        <Link
          to="/wordReminders"
          styleName={`navigation__link ${
            isWordRemindersActive && "navigation__link--active"
          }`}
          aria-current={isWordRemindersActive && "page"}
        >
          Word Reminders
        </Link>
      </nav>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
