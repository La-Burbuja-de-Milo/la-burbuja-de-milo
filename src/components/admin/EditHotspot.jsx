import React from 'react';

export default function EditHotspot({ enabled, onEdit, label = 'Editar', children, className = '', tone = 'dark', placement = 'right' }) {
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
        className={`absolute top-2 z-30 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
          placement === 'left' ? 'left-2' : 'right-2'
        } ${
          tone === 'light'
            ? 'bg-white text-neutral-900'
            : 'bg-neutral-900 text-white'
        }`}
      >
        {label}
      </button>
    </div>
  );
}
