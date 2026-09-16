import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isGerente, isStaff } from '../../lib/roles';

export default function RequireAuth({ children, staffOnly = false, gerenteOnly = false }) {
  const location = useLocation();
  const { session, profile, loading, configured } = useAuth();

  if (!configured) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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

  if (gerenteOnly && !isGerente(profile?.rol)) {
    return <Navigate to={isStaff(profile?.rol) ? '/admin' : '/mi-burbuja'} replace />;
  }

  if (staffOnly && !isStaff(profile?.rol)) {
    return <Navigate to="/mi-burbuja" replace />;
  }

  return children;
}
