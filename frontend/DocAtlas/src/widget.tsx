import React from "react";
import ReactDOM from "react-dom/client";
import ChatbotWidget from "./components/chatbot/ChatbotWidget";
import "./index.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const currentScript =
  document.currentScript || document.querySelector('script[src*="widget.js"]');
const tenantUid = currentScript
  ? currentScript.getAttribute("data-tenant-uid")
  : null;
const queryClient = new QueryClient();


if (!tenantUid) {
  console.error("DocAtlas: data-tenant-uid misiing.");
} else {
  const widgetContainer = document.createElement("div");
  widgetContainer.id = "docatlas-chatbot-root";

  document.body.appendChild(widgetContainer);

  ReactDOM.createRoot(widgetContainer).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ChatbotWidget uid={tenantUid} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
