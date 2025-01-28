import { User } from "common";
import { Navigate } from "react-router-dom";

import { App } from "../components/App";
import { Login } from "../pages/Auth/Login";
import { Signup } from "../pages/Auth/Signup";
import { Settings } from "../pages/Settings";
import { WordReminders } from "../pages/WordReminders";
import { Words } from "../pages/Words";

export function routes(user: User | undefined) {
  return [
    {
      path: "/",
      element: <App user={user} />,
      children: [
        {
          path: "/",
          element: user && <Navigate to="/app/words" />,
          children: [
            {
              path: "login",
              element: <Login />,
            },
            {
              path: "signup",
              element: <Signup />,
            },
          ],
        },
        {
          path: "/app",
          element: !user && <Navigate to="/login" />,
          children: [
            { path: "words", element: <Words /> },
            { path: "wordReminders", element: <WordReminders /> },
            { path: "settings", element: <Settings /> },
          ],
        },
      ],
    },
  ];
}
