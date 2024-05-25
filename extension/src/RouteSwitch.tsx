import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import { Words, Login, WordsByDurations, Register } from "./pages";
import { useQuery } from "@tanstack/react-query";

const RouteSwitch = () => {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_DOMAIN}/auth/current`, {
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()),
  });

  console.log(user);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (isError) {
    console.error("Error fetching user: ", error);
    return <h1>Error loading user data</h1>;
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<App />}>
        <Route index element={<Words />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="wordsByDurations" element={<WordsByDurations />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default RouteSwitch;
