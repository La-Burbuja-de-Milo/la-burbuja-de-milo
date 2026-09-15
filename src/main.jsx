import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { hydrateMiloStore } from './services/miloStore.js'

async function boot() {
  try {
    await hydrateMiloStore();
  } catch (error) {
    console.warn('No se pudo conectar con Supabase al iniciar:', error);
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

boot();
