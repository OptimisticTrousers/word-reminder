import { User } from "common";
import { Navigate } from "react-router-dom";

import { App } from "../components/App";
import { Login } from "../pages/Auth/Login";
import { Signup } from "../pages/Auth/Signup";
import { Settings } from "../pages/Settings";
import { UserWord } from "../pages/UserWord";
import { UserWords } from "../pages/UserWords";
import { WordReminder } from "../pages/WordReminder";
import { WordReminders } from "../pages/WordReminders";
import { ForgotPassword } from "../pages/Auth/ForgotPassword";
import { EmailConfirmation } from "../pages/Auth/EmailConfirmation";

export function routes(user: User | undefined) {
  return [
    {
      path: "/login",
      element: user ? <Navigate to="/userWords" /> : <Login />,
    },
    {
      path: "/signup",
      element: user ? <Navigate to="/userWords" /> : <Signup />,
    },
    {
      path: "/forgotPassword",
      element: user ? <Navigate to="/userWords" /> : <ForgotPassword />,
    },
    {
      path: "/",
      element: user ? <App user={user} /> : <Navigate to="/login" />,
      children: [
        {
          path: "confirmation",
          element:
            user && user.confirmed ? (
              <Navigate to="/userWords" />
            ) : (
              <EmailConfirmation />
            ),
        },
        { path: "userWords", element: <UserWords /> },
        { path: "userWords/:userWordId", element: <UserWord /> },
        { path: "wordReminders", element: <WordReminders /> },
        {
          path: "wordReminders/:wordReminderId",
          element: <WordReminder />,
        },
        { path: "settings/:token", element: <Settings /> },
        { path: "settings", element: <Settings /> },
      ],
    },
  ];
}
