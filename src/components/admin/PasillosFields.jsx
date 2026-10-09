import React from 'react';
import { GripVertical } from 'lucide-react';
import { usePointerReorder } from '../../lib/pointerReorder';

const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300';
const inputClass = 'w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white';

function PasilloOrderPreview({ pasillos, onReorder }) {
  const { containerRef, draggingId, start, move, stop } = usePointerReorder(pasillos, onReorder, {
    axis: 'x',
    selector: '[data-pasillo-id]'
  });

  return (
    <div className="mt-3 overflow-x-auto border border-neutral-200 bg-[#f4f1ea] p-3 dark:border-neutral-700">
      <div ref={containerRef} className="flex w-max min-w-full gap-2">
        {pasillos.map((pasillo) => (
          <button
            key={pasillo.id}
            type="button"
            data-pasillo-id={pasillo.id}
            aria-label={`Mover ${pasillo.nombre}`}
            onPointerDown={(event) => start(event, pasillo.id)}
            onPointerMove={move}
            onPointerUp={stop}
            onPointerCancel={stop}
            className={`shrink-0 touch-none select-none whitespace-nowrap px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
              draggingId === pasillo.id
                ? 'cursor-grabbing bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'cursor-grab border border-neutral-300 text-neutral-600 dark:border-neutral-600 dark:text-neutral-300'
            }`}
          >
            {pasillo.nombre || 'Sin nombre'}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PasillosFields({ pasillos = [], onChange }) {
  const { containerRef, draggingId, start, move, stop } = usePointerReorder(pasillos, onChange, {
    axis: 'y',
    selector: '[data-pasillo-id]'
  });

  const rename = (id, nombre) => {
    onChange(pasillos.map((item) => (item.id === id ? { ...item, nombre } : item)));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className={labelClass}>Orden del carrusel</p>
        <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          Arrastra los rótulos o las filas. El menú hamburguesa sigue el mismo orden y los mismos nombres.
        </p>
        <PasilloOrderPreview pasillos={pasillos} onReorder={onChange} />
      </div>

      <ul ref={containerRef} className="space-y-2">
        {pasillos.map((pasillo) => (
          <li
            key={pasillo.id}
            data-pasillo-id={pasillo.id}
            className={`flex items-center gap-2 ${draggingId === pasillo.id ? 'opacity-70' : ''}`}
          >
            <button
              type="button"
              aria-label={`Mover ${pasillo.nombre || 'pasillo'}`}
              onPointerDown={(event) => start(event, pasillo.id)}
              onPointerMove={move}
              onPointerUp={stop}
              onPointerCancel={stop}
              className={`shrink-0 touch-none p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white ${
                draggingId === pasillo.id ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <input
              value={pasillo.nombre || ''}
              onChange={(event) => rename(pasillo.id, event.target.value)}
              className={inputClass}
              aria-label={`Nombre de ${pasillo.nombre || 'pasillo'}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
