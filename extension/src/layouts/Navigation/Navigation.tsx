import CSSModules from "react-css-modules";
import { Link, useLocation, useNavigate } from "react-router-dom";

import styles from "./Navigation.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService } from "../../services/session_service";
import { useNotificationError } from "../../hooks/useNotificationError";
import { LogOut } from "lucide-react";

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
      <div styleName="navigation">
        <div styleName="navigation__top">
          <div styleName="navigation__logo">
            <img
              styleName="navigation__image"
              src="images/word-reminder.png"
              alt="lightbulb followed by the word reminder"
            />
            <h1 styleName="navigation__heading">Word Reminder</h1>
          </div>
          <nav styleName="navigation__nav">
            <ul styleName="navigation__list">
              <li styleName="navigation__item">
                <Link
                  to="/settings"
                  styleName="navigation__link navigation__link--settings"
                  aria-current={isSettingsActive && "page"}
                  aria-label="Settings"
                >
                  ⚙️
                </Link>
              </li>
              <li styleName="navigation__item">
                <button
                  styleName="navigation__button"
                  onClick={handleLogout}
                  disabled={disabled}
                  aria-label="Log Out"
                >
                  <LogOut styleName="navigation__icon" />
                </button>
              </li>
            </ul>
          </nav>
        </div>
        <nav styleName="navigation__nav">
          <ul styleName="navigation__list navigation__list--bottom">
            <li styleName={`navigation__item navigation__item--bottom`}>
              <Link
                to="/userWords"
                styleName={`navigation__link navigation__link--bottom ${
                  isUserWordsActive && "navigation__link--active"
                }`}
                aria-current={isUserWordsActive && "page"}
              >
                User Words
              </Link>
            </li>
            <li styleName={`navigation__item navigation__item--bottom`}>
              <Link
                to="/wordReminders"
                styleName={`navigation__link navigation__link--bottom ${
                  isWordRemindersActive && "navigation__link--active"
                }`}
                aria-current={isWordRemindersActive && "page"}
              >
                Word Reminders
              </Link>
            </li>
            {inPopup && (
              <li styleName="navigation__item">
                <button
                  onClick={handleNewTab}
                  styleName="navigation__button navigation__button--bottom"
                >
                  Open in New Tab
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
