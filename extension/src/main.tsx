import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/global.css";
import RouteSwitch from "./RouteSwitch.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouteSwitch />
  </React.StrictMode>
);
