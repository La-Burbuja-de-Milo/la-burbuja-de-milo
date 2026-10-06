import React from 'react';
import ImageUploader from './ImageUploader';
import ImageFocusPicker from './ImageFocusPicker';

const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300';
const inputClass = 'w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white';

function StoryCardFields({ item, frameRatio, onChange, showCta = false }) {
  return (
    <div className="space-y-3 border border-neutral-200 p-3 dark:border-neutral-700">
      <p className={labelClass}>{item.title || 'Tarjeta'}</p>
      <ImageFocusPicker
        src={item.imagen}
        seed={item.seed}
        posX={item.posX}
        posY={item.posY}
        zoom={item.zoom}
        flipX={item.flipX}
        flipY={item.flipY}
        rotate={item.rotate}
        shape="rect"
        frameRatio={frameRatio}
        onChange={(patch) => onChange({ ...item, ...patch })}
        grabHint="Agarra la foto y muévela: lo que quede dentro del recuadro es lo que se publica"
      />
      <ImageUploader
        compact
        label="Foto de la tarjeta"
        value={item.imagen}
        onChange={(imagen) => onChange({ ...item, imagen })}
      />
      <div>
        <label className={labelClass}>Título</label>
        <input
          value={item.title}
          onChange={(event) => onChange({ ...item, title: event.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Texto</label>
        <textarea
          rows={3}
          value={item.copy}
          onChange={(event) => onChange({ ...item, copy: event.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Enlace</label>
        <input
          value={item.to}
          onChange={(event) => onChange({ ...item, to: event.target.value })}
          placeholder="/tienda"
          className={inputClass}
        />
      </div>
      {showCta && (
        <div>
          <label className={labelClass}>Botón</label>
          <input
            value={item.cta}
            onChange={(event) => onChange({ ...item, cta: event.target.value })}
            placeholder="Shop now"
            className={inputClass}
          />
        </div>
      )}
    </div>
  );
}

function GroupHeaderFields({ group, onChange, hint }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="sm:col-span-3">
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{hint}</p>
      </div>
      <div>
        <label className={labelClass}>Título de sección</label>
        <input
          value={group.title}
          onChange={(event) => onChange({ ...group, title: event.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Texto del enlace</label>
        <input
          value={group.actionLabel}
          onChange={(event) => onChange({ ...group, actionLabel: event.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Destino</label>
        <input
          value={group.actionTo}
          onChange={(event) => onChange({ ...group, actionTo: event.target.value })}
          placeholder="/tienda"
          className={inputClass}
        />
      </div>
    </div>
  );
}

export default function HomeStoryFields({ form, onChange, section = 'pasillos' }) {
  if (section === 'estetica') {
    const block = form.estetica;
    return (
      <div className="space-y-3">
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          El recuadro negro junto a las notas del blog: etiqueta, título y texto.
        </p>
        <div>
          <label className={labelClass}>Etiqueta</label>
          <input
            value={block.tag}
            onChange={(event) => onChange({ ...form, estetica: { ...block, tag: event.target.value } })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Título</label>
          <input
            value={block.title}
            onChange={(event) => onChange({ ...form, estetica: { ...block, title: event.target.value } })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Texto</label>
          <textarea
            rows={4}
            value={block.copy}
            onChange={(event) => onChange({ ...form, estetica: { ...block, copy: event.target.value } })}
            className={inputClass}
          />
        </div>
      </div>
    );
  }

  const key = section === 'marcas' ? 'marcas' : 'pasillos';
  const group = form[key];
  const showCta = key === 'marcas';
  const frameRatio = key === 'marcas' ? 4 / 3 : 16 / 9;
  const hint = key === 'marcas'
    ? 'Fotos, recorte, títulos y enlaces de fuXion y Riman.'
    : 'Fotos, recorte, títulos y enlaces de Facial, Corporal y Bienestar.';

  const patchGroup = (next) => onChange({ ...form, [key]: next });
  const patchItem = (id, nextItem) => {
    patchGroup({
      ...group,
      items: group.items.map((item) => (item.id === id ? nextItem : item))
    });
  };

  return (
    <div className="space-y-5">
      <GroupHeaderFields group={group} onChange={patchGroup} hint={hint} />
      <div className={`grid gap-4 ${key === 'marcas' ? 'sm:grid-cols-2' : 'sm:grid-cols-1 lg:grid-cols-3'}`}>
        {group.items.map((item) => (
          <StoryCardFields
            key={item.id}
            item={item}
            frameRatio={frameRatio}
            showCta={showCta}
            onChange={(next) => patchItem(item.id, next)}
          />
        ))}
      </div>
    </div>
  );
}
