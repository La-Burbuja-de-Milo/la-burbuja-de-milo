import React from 'react';
import { HOME_TAB_ALIGNS } from '../../lib/homeTabRows';
import PhotoCropFields from './PhotoCropFields';

const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300';
const inputClass = 'w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white';

function AlignButtons({ value, onChange }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {HOME_TAB_ALIGNS.map((item) => {
        const selected = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
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
  );
}

function TabRowFields({ title, hint, row, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <p className={labelClass}>{title}</p>
        <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">{hint}</p>
        <AlignButtons value={row.align} onChange={(align) => onChange({ ...row, align })} />
      </div>
      <div className="space-y-2">
        {row.tabs.map((tab, index) => (
          <input
            key={tab.id}
            value={tab.label}
            onChange={(event) => {
              const tabs = row.tabs.map((item, current) => (
                current === index ? { ...item, label: event.target.value } : item
              ));
              onChange({ ...row, tabs });
            }}
            className={inputClass}
          />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Texto del enlace</label>
          <input
            value={row.actionLabel}
            onChange={(event) => onChange({ ...row, actionLabel: event.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Destino</label>
          <input
            value={row.actionTo}
            onChange={(event) => onChange({ ...row, actionTo: event.target.value })}
            placeholder="/tienda"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

function FeaturedServicioCard({ item, catalog, usedIds, onChange, onPick }) {
  return (
    <div className="space-y-3 border border-neutral-200 p-3 dark:border-neutral-700">
      <div>
        <label className={labelClass}>Tratamiento</label>
        <select
          value={item.id || ''}
          onChange={(event) => onPick(event.target.value)}
          className={inputClass}
        >
          {(catalog || []).map((servicio) => (
            <option
              key={servicio.id}
              value={servicio.id}
              disabled={usedIds.includes(servicio.id) && servicio.id !== item.id}
            >
              {servicio.titulo}
            </option>
          ))}
        </select>
      </div>
      <PhotoCropFields
        value={item}
        onChange={onChange}
        seed={item.id || 'servicio'}
        label="Foto de cabina"
        frameRatio={3 / 2}
      />
      <div>
        <label className={labelClass}>Título</label>
        <input
          value={item.titulo || ''}
          onChange={(event) => onChange({ ...item, titulo: event.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Categoría</label>
        <input
          value={item.categoria || ''}
          onChange={(event) => onChange({ ...item, categoria: event.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Texto</label>
        <textarea
          rows={3}
          value={item.descripcion || ''}
          onChange={(event) => onChange({ ...item, descripcion: event.target.value })}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export default function HomeTabRowsFields({
  form,
  onChange,
  servicios = [],
  featuredServicios = [],
  onFeaturedServiciosChange
}) {
  const usedIds = featuredServicios.map((item) => item.id).filter(Boolean);

  const updateFeatured = (index, nextItem) => {
    const next = featuredServicios.map((item, current) => (current === index ? nextItem : item));
    onFeaturedServiciosChange?.(next);
    onChange({
      ...form,
      picks: {
        ...form.picks,
        servicioIds: next.map((item) => item.id).filter(Boolean)
      }
    });
  };

  const pickFeatured = (index, id) => {
    const chosen = servicios.find((item) => item.id === id);
    if (!chosen) return;
    updateFeatured(index, { ...chosen });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <p className={labelClass}>Featured top picks</p>
          <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            Sube la foto y acomódala: arrastra, acerca, espejo, invertir y girar. Lo que quede en el recuadro es lo que se publica.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {featuredServicios.map((item, index) => (
            <FeaturedServicioCard
              key={item.id || index}
              item={item}
              catalog={servicios}
              usedIds={usedIds}
              onChange={(next) => updateFeatured(index, next)}
              onPick={(id) => pickFeatured(index, id)}
            />
          ))}
        </div>
      </div>
      <TabRowFields
        title="Selección"
        hint="Featured top picks y Value items: nombres, alineación y el enlace de agenda."
        row={form.picks}
        onChange={(picks) => onChange({ ...form, picks })}
      />
      <TabRowFields
        title="Productos"
        hint="Bestsellers, New arrivals y En camino: nombres, alineación y el enlace Shop all."
        row={form.products}
        onChange={(products) => onChange({ ...form, products })}
      />
    </div>
  );
}
