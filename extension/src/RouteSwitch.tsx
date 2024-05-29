import { createMemoryRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { ProtectedRoutes } from "./components";
import { Login, Signup, Words, WordsByDurations } from "./pages";

const RouteSwitch = () => {
  const router = createMemoryRouter([
    {
      element: <App />,
      children: [
        {
          path: "/",
          element: <Login />,
        },
        {
          path: "/signup",
          element: <Signup />,
        },
        {
          element: <ProtectedRoutes />,
          children: [
            {
              path: "/words",
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
