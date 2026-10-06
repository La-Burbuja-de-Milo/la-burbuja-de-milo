import React from 'react';

export default function EditHotspot({ enabled, onEdit, label = 'Editar', children, className = '' }) {
  if (!enabled || !onEdit) return children;

  return (
    <div className={`relative ${className}`}>
      {children}
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onEdit();
        }}
        className="absolute right-2 top-2 z-30 bg-neutral-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white"
      >
        {label}
      </button>
    </div>
  );
}
