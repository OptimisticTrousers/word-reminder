import { createMemoryRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { ProtectedRoutes } from "./components";
import { Login, Register, Words, WordsByDurations } from "./pages";

const RouteSwitch = () => {
  const router = createMemoryRouter([
    {
      element: <App />,
      children: [
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          element: <ProtectedRoutes />,
          children: [
            {
              path: "/",
              element: <Words />,
            },
            {
              path: "/wordsByDurations",
              element: <WordsByDurations />,
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default RouteSwitch;
