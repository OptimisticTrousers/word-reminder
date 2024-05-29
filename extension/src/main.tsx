import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "./components";
import AuthProvider from "./context/AuthContext.tsx";
import ThemeProvider from "./context/ThemeContext.tsx";
import RouteSwitch from "./RouteSwitch.tsx";
import "./assets/global.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLDivElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools />
            <RouteSwitch />
          </QueryClientProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
