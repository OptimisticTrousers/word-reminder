import CSSModules from "react-css-modules";
import { Link, useLocation, useNavigate } from "react-router-dom";

import styles from "./Navigation.module.css";
import { useMutation } from "@tanstack/react-query";
import { sessionService } from "../../services/session_service";
import { useNotificationError } from "../../hooks/useNotificationError";

export const Navigation = CSSModules(
  function () {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { showNotificationError } = useNotificationError();
    const { isPending, mutate } = useMutation({
      mutationFn: sessionService.logoutUser,
      onSuccess: () => {
        navigate("/login");
      },
      onError: showNotificationError,
    });

    let isUserWordsActive = false;
    let isWordRemindersActive = false;
    let isSettingsActive = false;

    if (pathname === "/userWords") {
      isUserWordsActive = true;
    } else if (pathname === "/wordReminders") {
      isWordRemindersActive = true;
    } else if (pathname === "/settings") {
      isSettingsActive = true;
    }

    function handleLogout() {
      mutate();
    }

    const disabled = isPending;

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
        <Link
          to="/settings"
          styleName={`navigation__link ${
            isSettingsActive && "navigation__link--active"
          }`}
          aria-current={isSettingsActive && "page"}
        >
          Settings
        </Link>
        <button
          styleName="navigation__button"
          onClick={handleLogout}
          disabled={disabled}
        >
          Log Out
        </button>
      </nav>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
