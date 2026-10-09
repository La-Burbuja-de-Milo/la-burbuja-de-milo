import React, { useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import ImageUploader from './ImageUploader';
import ImageFocusPicker from './ImageFocusPicker';
import ProductVisual from '../shop/ProductVisual';
import {
  CATEGORY_CIRCLE_ALIGNS,
  categoryRowClass,
  moveCircle
} from '../../lib/categoryCircles';

const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300';
const inputClass = 'w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white';

function CircleOrderPreview({ circles, align, onReorder }) {
  const rowRef = useRef(null);
  const dragRef = useRef(null);
  const circlesRef = useRef(circles);
  const [draggingId, setDraggingId] = useState(null);
  circlesRef.current = circles;

  const indexFromX = (clientX) => {
    const nodes = [...(rowRef.current?.querySelectorAll('[data-circle-id]') || [])];
    if (!nodes.length) return 0;
    let best = 0;
    let bestDist = Infinity;
    nodes.forEach((node, index) => {
      const box = node.getBoundingClientRect();
      const dist = Math.abs(clientX - (box.left + box.width / 2));
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    return best;
  };

  const stopDrag = () => {
    dragRef.current = null;
    setDraggingId(null);
  };

  const moveDrag = (clientX) => {
    const drag = dragRef.current;
    if (!drag) return;
    const toIndex = indexFromX(clientX);
    if (toIndex === drag.lastIndex) return;
    drag.lastIndex = toIndex;
    onReorder(moveCircle(circlesRef.current, drag.id, toIndex));
  };

  return (
    <div className="mt-3 overflow-x-auto border border-neutral-200 bg-[#f4f1ea] p-3 dark:border-neutral-700">
      <div ref={rowRef} className={`flex min-w-full w-max gap-3 ${categoryRowClass(align)}`}>
        {circles.map((circle) => (
          <button
            key={circle.id}
            type="button"
            data-circle-id={circle.id}
            aria-label={`Mover ${circle.label}`}
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              const from = circles.findIndex((item) => item.id === circle.id);
              dragRef.current = { id: circle.id, lastIndex: from };
              setDraggingId(circle.id);
            }}
            onPointerMove={(event) => moveDrag(event.clientX)}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            className={`w-12 shrink-0 touch-none select-none text-center ${
              draggingId === circle.id ? 'cursor-grabbing opacity-70' : 'cursor-grab'
            }`}
          >
            <div className={`aspect-square overflow-hidden rounded-full bg-[#efeae2] ${
              draggingId === circle.id ? 'ring-2 ring-neutral-900 dark:ring-white' : ''
            }`}
            >
              <ProductVisual
                seed={circle.seed}
                src={circle.imagen}
                posX={circle.posX}
                posY={circle.posY}
                zoom={circle.zoom}
                flipX={circle.flipX}
                flipY={circle.flipY}
                rotate={circle.rotate}
                focalCrop
                className="pointer-events-none h-full w-full"
              />
            </div>
            <span className="mt-1 block truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-neutral-600 dark:text-neutral-300">
              {circle.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CategoryCirclesFields({
  form,
  onChange,
  orderHint = 'Arrastra los círculos con la mano para cambiar el orden. Elige cómo se sientan en Inicio.',
  editableLabels = false,
  allowAdd = false,
  onCreate
}) {
  const { circles, align } = form;
  const [draft, setDraft] = useState('');
  const patchCircle = (id, patch) => {
    onChange({
      ...form,
      circles: circles.map((item) => (item.id === id ? { ...item, ...patch } : item))
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className={labelClass}>Centrado y orden del grupo</p>
        <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          {orderHint}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORY_CIRCLE_ALIGNS.map((item) => {
            const selected = align === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange({ ...form, align: item.id })}
                className={`border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  selected
                    ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                    : 'border-neutral-300 text-neutral-600 dark:border-neutral-600 dark:text-neutral-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <CircleOrderPreview
          circles={circles}
          align={align}
          onReorder={(next) => onChange({ ...form, circles: next })}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {circles.map((circle) => (
          <div key={circle.id} className="space-y-3 border border-neutral-200 p-3 dark:border-neutral-700">
            {editableLabels ? (
              <div className="flex items-center gap-2">
                <input
                  value={circle.label || ''}
                  onChange={(event) => patchCircle(circle.id, { label: event.target.value })}
                  className={inputClass}
                  aria-label={`Nombre de ${circle.label || 'círculo'}`}
                />
                {allowAdd && (
                  <button
                    type="button"
                    onClick={() => onChange({
                      ...form,
                      circles: circles.filter((item) => item.id !== circle.id)
                    })}
                    className="shrink-0 p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    aria-label={`Quitar ${circle.label || 'círculo'}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <p className={labelClass}>{circle.label}</p>
            )}
            <ImageFocusPicker
              src={circle.imagen}
              seed={circle.seed}
              posX={circle.posX}
              posY={circle.posY}
              zoom={circle.zoom}
              flipX={circle.flipX}
              flipY={circle.flipY}
              rotate={circle.rotate}
              onChange={(patch) => patchCircle(circle.id, patch)}
              grabHint="Agarra la foto y muévela: lo que quede dentro del círculo es lo que se publica"
            />
            <ImageUploader
              compact
              label="Foto del círculo"
              value={circle.imagen}
              onChange={(imagen) => patchCircle(circle.id, { imagen })}
            />
          </div>
        ))}
      </div>

      {allowAdd && (
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              const nombre = draft.trim();
              if (!nombre || !onCreate) return;
              onCreate(nombre);
              setDraft('');
            }}
            placeholder="Nueva marca"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => {
              const nombre = draft.trim();
              if (!nombre || !onCreate) return;
              onCreate(nombre);
              setDraft('');
            }}
            className="inline-flex items-center gap-1 border border-neutral-900 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] dark:border-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Alta
          </button>
        </div>
      )}
    </div>
  );
}
