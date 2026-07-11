import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// --- GLOBAL FETCH INTERCEPTOR FOR CORRELATION ID ---
// Tarayıcının varsayılan fetch fonksiyonu
const originalFetch = window.fetch;
// Kendi özel fetch fonksiyon
window.fetch = async (...args) => {
    let [resource, config] = args;
    
    const apiBase = import.meta.env.VITE_API_BASE_URL;

    // Sadece backend'e giden isteklere müdahale et (Dış API'lere gitmesin)
    if (typeof resource === 'string' && resource.startsWith(apiBase)) {
        config = config || {};
        config.headers = {
            ...config.headers,
            'X-Correlation-ID': window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
        };
        args = [resource, config];
    }
    // Değiştirilmiş paketle orijinal fetch'i çağır
    return originalFetch(...args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
