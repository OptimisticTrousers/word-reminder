import { createContext } from "react";

import { NotificationContext as Context } from "./Provider";

export enum NOTIFICATION_ACTIONS {
  SUCCESS = "success",
  ERROR = "error",
}

export const NotificationContext = createContext<Context>({
  showNotification: function () {},
  dismissNotification: function () {},
});
