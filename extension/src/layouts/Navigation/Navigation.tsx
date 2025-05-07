import CSSModules from "react-css-modules";
import { Link, useLocation, useNavigate } from "react-router-dom";

import styles from "./Navigation.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService } from "../../services/session_service";
import { useNotificationError } from "../../hooks/useNotificationError";

export const Navigation = CSSModules(
  function () {
    const { pathname } = useLocation();
    const { showNotificationError } = useNotificationError();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { isPending, mutate } = useMutation({
      mutationFn: sessionService.logoutUser,
      onSettled: () => {
        chrome.storage.sync.remove("userId");
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

    async function handleLogout() {
      mutate();
      queryClient.clear();
      await navigate("/login");
    }

    function handleNewTab() {
      const url = chrome.runtime.getURL("index.html?popup=false");
      chrome.tabs.create({ url });
    }

    const urlSearchParams = new URLSearchParams(window.location.search);
    const inPopup = urlSearchParams.get("popup") === "true";

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
        {inPopup && (
          <button onClick={handleNewTab} styleName="navigation__button">
            Open in New Tab
          </button>
        )}
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
