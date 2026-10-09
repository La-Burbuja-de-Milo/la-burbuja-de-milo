import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatCOP } from '../../lib/money';
import { etiquetaVitrina, hasNamedVariantes, stockEstado } from '../../lib/variantes';

const CARD_SLOTS = 2;

function PrecioFila({ label, precio, agotada, active, as: Tag = 'div', ...props }) {
  const { className, ...rest } = props;
  return (
    <Tag
      {...rest}
      className={`flex h-5 w-full items-baseline gap-1.5 text-left text-[11px] leading-5 ${
        agotada
          ? 'text-neutral-400 dark:text-neutral-500'
          : active
            ? 'text-neutral-900 dark:text-white'
            : 'text-neutral-800 dark:text-neutral-200'
      } ${className || ''}`}
    >
      {label ? <span className="max-w-[58%] shrink-0 truncate">{label}</span> : null}
      {label ? (
        <span
          className={`min-w-2 flex-1 border-b border-dotted ${
            active ? 'border-neutral-800 dark:border-neutral-300' : 'border-neutral-300 dark:border-neutral-600'
          }`}
          aria-hidden
        />
      ) : (
        <span className="min-w-0 flex-1" />
      )}
      <span className="shrink-0 tabular-nums tracking-tight">
        {agotada ? 'Agotada' : formatCOP(precio)}
      </span>
    </Tag>
  );
}

export function PresentacionSelect({ product, value, onChange }) {
  const variantes = (product.variantes || []).filter((item) => String(item.nombre || '').trim());
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = variantes.find((item) => item.id === value) || variantes[0];
  const selectedLabel = etiquetaVitrina(selected?.nombre) || selected?.nombre || '';
  const frameClass =
    'flex h-8 w-full items-center border border-neutral-200 bg-white px-2.5 text-[11px] font-normal text-neutral-800 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100';

  if (variantes.length <= 1) {
    return (
      <div className="mt-1.5 h-8">
        {selectedLabel ? (
          <div className={frameClass}>
            <span className="min-w-0 truncate">{selectedLabel}</span>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative mt-1.5 h-8 ${open ? 'z-30' : ''}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Presentación"
        onClick={() => setOpen((current) => !current)}
        className={`${frameClass} justify-between gap-2 text-left`}
      >
        <span className="min-w-0 truncate">{selectedLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-neutral-900 transition-transform dark:text-white ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.75}
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="Presentaciones"
          className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden border border-neutral-200 bg-white shadow-[0_12px_28px_rgba(23,23,23,0.12)] dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
        >
          {variantes.map((variante) => {
            const agotada = !product.enCamino && stockEstado(product, variante) === 'agotado';
            const active = variante.id === (selected?.id || value);
            const label = etiquetaVitrina(variante.nombre) || variante.nombre;
            return (
              <li key={variante.id} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={agotada}
                  onClick={() => {
                    if (agotada) return;
                    onChange?.(variante.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-baseline gap-2 px-2.5 py-2 text-left text-[11px] font-normal leading-tight disabled:cursor-not-allowed disabled:opacity-45 ${
                    active
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-neutral-700 hover:bg-[#f6f6f6] dark:text-neutral-200 dark:hover:bg-neutral-900'
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  <span className="shrink-0 tabular-nums tracking-tight">
                    {agotada ? 'Agotada' : formatCOP(variante.precio)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function PrecioTarjeta({ product, onPick }) {
  const named = (product.variantes || []).filter((item) => String(item.nombre || '').trim());
  const rows = named.length
    ? named.slice(0, CARD_SLOTS)
    : [{ nombre: '', precio: product.precio }];
  while (rows.length < CARD_SLOTS) rows.push(null);

  return (
    <div className="mt-3 grid h-10 grid-rows-2 content-start" aria-label="Presentaciones y precios">
      {rows.map((row, index) => (
        row ? (
          <PrecioFila
            key={row.id || `precio-${index}`}
            as={onPick && row.id ? 'button' : 'div'}
            type={onPick && row.id ? 'button' : undefined}
            onClick={onPick && row.id ? () => onPick(row.id) : undefined}
            label={etiquetaVitrina(row.nombre)}
            precio={row.precio}
            agotada={!product.enCamino && Boolean(row.nombre) && stockEstado(product, row) === 'agotado'}
          />
        ) : (
          <div key={`slot-${index}`} className="h-5" aria-hidden />
        )
      ))}
    </div>
  );
}

export default function PresentacionPicker({ product, value, onChange }) {
  if (!hasNamedVariantes(product)) return null;
  const variantes = product.variantes || [];

  return (
    <fieldset className="min-w-0">
      <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-900 dark:text-white">
        Elige presentación
      </legend>
      <div className={`mt-3 grid gap-2 ${variantes.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
        {variantes.map((variante) => {
          const agotada = !product.enCamino && stockEstado(product, variante) === 'agotado';
          const active = value === variante.id;
          return (
            <button
              key={variante.id}
              type="button"
              disabled={agotada}
              aria-pressed={active}
              onClick={() => onChange(variante.id)}
              className="presentacion-opcion flex min-h-[5.25rem] flex-col justify-center px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                {etiquetaVitrina(variante.nombre) || variante.nombre}
              </span>
              <span className="mt-1.5 text-xl font-medium tabular-nums tracking-tight">
                {formatCOP(variante.precio)}
              </span>
              <span className="presentacion-opcion-hint mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">
                {agotada ? 'Agotada' : active ? 'Seleccionada' : 'Disponible'}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
