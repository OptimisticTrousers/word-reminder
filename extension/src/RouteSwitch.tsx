import { Routes, Route, HashRouter } from "react-router-dom";
import App from "./App";
import { WordsByDurations, Words, Login, Register } from "./pages";

const RouteSwitch = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Words />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="wordsByDurations" element={<WordsByDurations />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};
export default RouteSwitch;
