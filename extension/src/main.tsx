import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

import { Router } from "./routes/Router";
import "./index.css";

createRoot(document.getElementById("root") as HTMLDivElement).render(
  <StrictMode>
    <MemoryRouter>
      <Router />
    </MemoryRouter>
  </StrictMode>
);
