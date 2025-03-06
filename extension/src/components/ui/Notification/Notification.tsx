import { CircleCheck, CircleX, X } from "lucide-react";
import { useContext } from "react";
import CSSModules from "react-css-modules";

import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../../context/Notification";
import styles from "./Notification.module.css";

export const Notification = CSSModules(
  function ({ type, message }: { type: string; message: string }) {
    const { dismissNotification } = useContext(NotificationContext);

    function handleClick() {
      dismissNotification();
    }

    return (
      <div
        styleName={`notification notification--${type}`}
        role="dialog"
        aria-labelledby="notification-message"
      >
        <div styleName="notification__flex">
          <div styleName="notification__item">
            {type === NOTIFICATION_ACTIONS.SUCCESS ? (
              <CircleCheck
                data-testid="check-icon"
                styleName="notification__icon notification__icon--circle"
              />
            ) : (
              <CircleX
                data-testid="x-icon"
                styleName="notification__icon notification__icon--circle"
              />
            )}
          </div>
          <div styleName="notification__box">
            <span id="notification-message" styleName="notification__message">
              {message}
            </span>
          </div>
          <div styleName="notification__controls">
            <div styleName="notification__control">
              <button styleName="notification_button" onClick={handleClick}>
                <span styleName="notification__text">Dismiss</span>
                <X styleName="notification__icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
  styles,
  { allowMultiple: true, handleNotFoundStyleName: "log" }
);
