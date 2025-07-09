import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { NotificationProvider } from "./context/Notification";
import { Router } from "./routes/Router";
import { ThemeProvider } from "./context/Theme";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root") as HTMLDivElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ErrorBoundary>
          <ThemeProvider>
            <NotificationProvider>
              <Router />
            </NotificationProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </MemoryRouter>
    </QueryClientProvider>
  </StrictMode>
);
