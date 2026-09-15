import React from 'react';

/**
 * PageHeader (Regla 8: Encabezados Principales)
 * Encabezado maestro estandarizado para todas las vistas principales.
 */
export default function PageHeader({ title, description, actions, glow = 'default' }) {
  // Manejo del Glow atmosférico basado en el tema
  const glowStyles = {
    default: 'from-blue-500/10 to-transparent',
    admin: 'from-purple-500/10 to-transparent',
    superadmin: 'from-rose-500/10 to-transparent',
    modelo: 'from-pink-500/10 to-transparent',
  };

  const selectedGlow = glowStyles[glow] || glowStyles.default;

  return (
    <div className="relative mb-6 sm:mb-8 overflow-hidden rounded-3xl">
      {/* Fondo de desenfoque e inyección de glow */}
      <div className={`absolute inset-0 bg-gradient-to-b ${selectedGlow} pointer-events-none`} />
      <div className="absolute inset-0 backdrop-blur-3xl bg-white/40 dark:bg-black/20 pointer-events-none" />
      
      {/* Contenedor Flexbox estricto para mantener alineación */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border border-white/20 dark:border-white/5 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        
        {/* Acciones inyectadas */}
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
