import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RequireAuth({ children, adminOnly = false }) {
  const location = useLocation();
  const { session, isAdmin, loading, configured } = useAuth();

  if (!configured) {
    const isAuthenticated = localStorage.getItem('simulated_login') === 'true';
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-gray-500">
        Cargando sesión...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/mi-burbuja" replace />;
  }

  return children;
}
