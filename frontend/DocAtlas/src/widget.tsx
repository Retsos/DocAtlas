import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatbotWidget from './chatbot/ChatbotWidget'
import './index.css';

const currentScript = document.currentScript || document.querySelector('script[src*="widget.js"]');
const tenantUid = currentScript ? currentScript.getAttribute('data-tenant-uid') : null;

if (!tenantUid) {
    console.error("DocAtlas: Λείπει το data-tenant-uid. Ποιος νομίζεις ότι είσαι; Η πόρτα παραμένει κλειστή.");
} else {
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'docatlas-chatbot-root';

    document.body.appendChild(widgetContainer);

    ReactDOM.createRoot(widgetContainer).render(
        <React.StrictMode>
            <ChatbotWidget uid={tenantUid} />
        </React.StrictMode>
    );
}