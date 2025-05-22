import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { NotificationProvider } from "./context/Notification";
import { Router } from "./routes/Router";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

createRoot(document.getElementById("root") as HTMLDivElement).render(
  <StrictMode>
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </NotificationProvider>
      </QueryClientProvider>
    </MemoryRouter>
  </StrictMode>
);
