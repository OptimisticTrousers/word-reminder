import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { WordsByDurations, Words, Login, Register } from "./pages";

const RouteSwitch = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Words />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="wordsByDurations" element={<WordsByDurations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default RouteSwitch;
