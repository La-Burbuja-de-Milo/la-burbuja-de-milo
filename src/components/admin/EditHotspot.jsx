import React from 'react';
import { Pencil } from 'lucide-react';

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
        aria-label={label}
        title={label}
        className={`absolute top-2 z-30 inline-flex h-8 w-8 items-center justify-center ${
          placement === 'left' ? 'left-2' : 'right-2'
        } ${
          tone === 'light'
            ? 'bg-white text-neutral-900'
            : 'bg-neutral-900 text-white'
        }`}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}
