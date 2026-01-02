import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/main.css';

// Backend connection check
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const checkBackendConnection = async () => {
  const isLocalhost = API_BASE_URL?.includes('localhost') || API_BASE_URL?.includes('127.0.0.1');
  const environmentType = isLocalhost ? '🏠 LOCALHOST' : '🌐 DEPLOYED';

  console.log('═══════════════════════════════════════════════════════');
  console.log('🔧 BACKEND CONFIGURATION');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📍 API Base URL: ${API_BASE_URL || 'NOT SET'}`);
  console.log(`🌍 Environment: ${environmentType}`);

  if (!API_BASE_URL) {
    console.error('❌ VITE_API_BASE_URL is not set in .env file!');
    return;
  }

  try {
    // Try to reach the backend (using a simple fetch with timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Any response (even 400/401) means backend is reachable
    console.log(`✅ Backend Status: CONNECTED (HTTP ${response.status})`);
    console.log('═══════════════════════════════════════════════════════');
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Backend Status: TIMEOUT (5s)');
    } else {
      console.error(`❌ Backend Status: UNREACHABLE - ${error.message}`);
    }
    console.log('═══════════════════════════════════════════════════════');
  }
};

// Run backend check on startup
checkBackendConnection();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
