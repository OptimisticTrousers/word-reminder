import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RouteSwitch from "./RouteSwitch.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouteSwitch />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </React.StrictMode>
);
