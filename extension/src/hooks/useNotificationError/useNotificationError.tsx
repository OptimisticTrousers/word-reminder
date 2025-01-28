import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
  NOTIFICATION_ACTIONS,
  NotificationContext,
} from "../../context/Notification";
import { ErrorResponse } from "../../types";
import { AUTH_NOTIFICATION_MSGS } from "../../pages/Auth/constants";

export function useNotificationError() {
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);

  function showNotificationError(response: ErrorResponse) {
    if (response.status === 401) {
      showNotification(
        NOTIFICATION_ACTIONS.ERROR,
        AUTH_NOTIFICATION_MSGS.credentialsExpired()
      );
      navigate("/login");
    } else {
      showNotification(NOTIFICATION_ACTIONS.ERROR, response.json.message);
    }
  }

  return { showNotificationError };
}
