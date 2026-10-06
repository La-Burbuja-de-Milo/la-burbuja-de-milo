import React from 'react';
import { HOME_TAB_ALIGNS } from '../../lib/homeTabRows';

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
    </div>
  );
}

export default function HomeTabRowsFields({ form, onChange }) {
  return (
    <div className="space-y-6">
      <TabRowFields
        title="Productos"
        hint="Bestsellers, New arrivals y En camino. Elige cómo se alinean en Inicio."
        row={form.products}
        onChange={(products) => onChange({ ...form, products })}
      />
      <TabRowFields
        title="Selección"
        hint="Featured top picks y Value items."
        row={form.picks}
        onChange={(picks) => onChange({ ...form, picks })}
      />
    </div>
  );
}
