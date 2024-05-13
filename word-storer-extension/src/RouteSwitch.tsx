import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { Home, Login, Register } from "./pages";

const RouteSwitch = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default RouteSwitch;
