import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Router } from "./routes/Router";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root") as HTMLDivElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Router />
      </MemoryRouter>
      <ReactQueryDevtools />
    </QueryClientProvider>
  </StrictMode>
);
