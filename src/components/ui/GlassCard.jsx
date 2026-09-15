import React from 'react';

/**
 * GlassCard (Regla 2: Contenedores y Tarjetas)
 * Componente base para albergar contenido con Glassmorphism limpio.
 * Prohibidos los esquinas cuadradas (rounded-none).
 */
export default function GlassCard({ children, className = '', padding = 'p-4', ...props }) {
  return (
    <div 
      className={`
        bg-white/70 dark:bg-gray-800/60 
        backdrop-blur-xl 
        border border-white/40 dark:border-white/5 
        shadow-sm 
        rounded-2xl sm:rounded-3xl 
        ${padding} 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
