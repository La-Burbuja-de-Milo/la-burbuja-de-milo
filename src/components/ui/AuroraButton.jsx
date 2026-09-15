import React from 'react';

/**
 * AuroraButton (Regla 4: Apple Style Glow)
 * Botón de acción primaria altamente visible y dinámico.
 */
export default function AuroraButton({ children, onClick, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        relative overflow-hidden
        px-5 py-2.5 
        text-sm font-semibold text-white 
        rounded-xl
        bg-gradient-to-r from-cyan-600 to-fuchsia-600
        bg-[length:200%_auto]
        shadow-md shadow-cyan-500/30 dark:shadow-[0_0_15px_rgba(34,211,238,0.5)]
        hover:animate-aurora-flow
        active:scale-[0.98] transition-all duration-200
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
