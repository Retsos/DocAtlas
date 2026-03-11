import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App";

const queryClient = new QueryClient();

const currentScript = document.currentScript || document.querySelector('script[src*="widget.js"]');
const tenantUid = currentScript ? currentScript.getAttribute("data-tenant-uid") : "local-preview";

const CONTAINER_ID = "docatlas-chatbot-root";
let container = document.getElementById(CONTAINER_ID);

if (!container) {
  container = document.createElement("div");
  container.id = CONTAINER_ID;
  document.body.appendChild(container); 
}

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App uid={tenantUid || "local-preview"} />
    </QueryClientProvider>
  </StrictMode>
);