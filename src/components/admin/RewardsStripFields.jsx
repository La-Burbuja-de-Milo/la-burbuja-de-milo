import React from 'react';
import RichTextField from './RichTextField';
import { rewardsStripVars, sanitizeRewardsHtml } from '../../lib/rewardsStrip';

const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300';
const inputClass = 'w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white';

function RangeField({ label, value, min, max, unit, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        <span>{label}</span>
        <span>{value}{unit}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
    </label>
  );
}

export default function RewardsStripFields({ form, onChange }) {
  const patch = (next) => onChange({ ...form, ...next });

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.visible !== false}
          onChange={(event) => patch({ visible: event.target.checked })}
        />
        Mostrar franja
      </label>
      <RichTextField
        label="Texto"
        value={form.html}
        onChange={(html) => patch({ html })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <RangeField label="Texto móvil" value={form.fontSize} min={8} max={22} unit="px" onChange={(fontSize) => patch({ fontSize })} />
        <RangeField label="Texto escritorio" value={form.fontSizeLg} min={10} max={32} unit="px" onChange={(fontSizeLg) => patch({ fontSizeLg })} />
        <RangeField label="Espacio móvil" value={form.paddingY} min={4} max={48} unit="px" onChange={(paddingY) => patch({ paddingY })} />
        <RangeField label="Espacio escritorio" value={form.paddingYLg} min={8} max={80} unit="px" onChange={(paddingYLg) => patch({ paddingYLg })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Botón</label>
          <input value={form.buttonText} onChange={(event) => patch({ buttonText: event.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Enlace</label>
          <input value={form.buttonHref} onChange={(event) => patch({ buttonHref: event.target.value })} className={inputClass} />
        </div>
      </div>
      <div>
        <p className={labelClass}>Vista previa</p>
        <div
          className="milo-rewards-strip mt-2 bg-neutral-950 px-4 text-white"
          style={rewardsStripVars(form)}
        >
          <div className="flex items-center justify-between gap-3">
            <p
              className="milo-rewards-copy min-w-0"
              dangerouslySetInnerHTML={{ __html: sanitizeRewardsHtml(form.html) }}
            />
            <span className="shrink-0 border border-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
              {form.buttonText || 'Join now'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
