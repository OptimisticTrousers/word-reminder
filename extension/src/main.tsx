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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <MemoryRouter>
            <Router />
          </MemoryRouter>
        </NotificationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
