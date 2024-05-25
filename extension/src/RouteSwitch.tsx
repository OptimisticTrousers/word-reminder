// import axios from "axios";
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import { Login, Register, Words, WordsByDurations } from "./pages";

const RouteSwitch = () => {
  const router = createMemoryRouter(
    createRoutesFromElements(
      <Route path="/" element={<App />}>
        <Route index element={<Words />} />
        <Route path="wordsByDurations" element={<WordsByDurations />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default RouteSwitch;
