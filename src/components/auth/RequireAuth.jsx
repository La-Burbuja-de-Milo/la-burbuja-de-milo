import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Guardia de Rutas (Simulación Temporal).
 * Esto será reemplazado por el estado real de Supabase Auth más adelante.
 */
export default function RequireAuth({ children }) {
  const location = useLocation();
  
  // SIMULACIÓN: Leemos el estado del localStorage
  const isAuthenticated = localStorage.getItem('simulated_login') === 'true';

  if (!isAuthenticated) {
    // Redirige al login y guarda la ruta que intentaba visitar para volver a ella después
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
