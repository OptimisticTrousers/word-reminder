import { useReducer, ReactNode } from "react";

import { NOTIFICATION_ACTIONS, NotificationContext } from "./Context";
import { Notification } from "../../components/ui/Notification/Notification";

interface Props {
  children: ReactNode;
}

interface NotificationState {
  isVisible: boolean;
  type: string;
  message: string;
}

interface NotificationAction {
  payload: { message: string };
  type: string;
}

export interface NotificationContext {
  showNotification: (type: string, message: string) => void;
  dismissNotification: () => void;
}

const notificationReducer = (
  state: NotificationState,
  action: NotificationAction
) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SUCCESS:
      return {
        ...state,
        isVisible: true,
        type: NOTIFICATION_ACTIONS.SUCCESS,
        message: action.payload.message,
      };
    case NOTIFICATION_ACTIONS.ERROR:
      return {
        ...state,
        isVisible: true,
        type: NOTIFICATION_ACTIONS.ERROR,
        message: action.payload.message,
      };
    case DISAPPEAR:
      return { ...state, isVisible: false, type: "", message: "" };
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
};

// Provide ability to spawn Toast notification globally within the application
export function NotificationProvider({ children }: Props) {
  const [state, dispatch] = useReducer(notificationReducer, {
    isVisible: false,
    type: "",
    message: "",
  });

  function dismissNotification() {
    dispatch({
      type: DISAPPEAR,
      payload: { message: "" },
    });
  }

  function showNotification(type: string, message: string): void {
    const delay = 5000;

    dispatch({ type, payload: { message } });

    setTimeout(() => {
      dismissNotification();
    }, delay);
  }

  const { isVisible, type, message } = state;

  return (
    <NotificationContext.Provider
      value={{ showNotification, dismissNotification }}
    >
      {isVisible && <Notification type={type} message={message} />}
      {children}
    </NotificationContext.Provider>
  );
}

const DISAPPEAR = "disappear";
