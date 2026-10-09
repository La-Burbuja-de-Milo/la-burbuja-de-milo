import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import ImageUploader from './ImageUploader';
import ImageFocusPicker from './ImageFocusPicker';
import {
  TIENDA_HERO_RATIO,
  TIENDA_INSERT_TYPES,
  TIENDA_SUGGEST_SHAPES,
  createFeedCircle,
  createTiendaHeroSlide,
  createTiendaInsert,
  withTiendaFeed
} from '../../lib/tiendaFeed';

const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300';
const inputClass = 'w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white';

function HeroFields({ item, onChange, onRemove }) {
  return (
    <div className="space-y-3 border border-neutral-200 p-3 dark:border-neutral-700">
      <div className="flex items-center justify-between gap-2">
        <p className={labelClass}>{item.title || 'Banner'}</p>
        <button type="button" onClick={onRemove} className="p-1 text-neutral-400 hover:text-red-600" aria-label="Quitar">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <ImageFocusPicker
        src={item.imagen}
        seed={item.title || 'tienda'}
        posX={item.posX}
        posY={item.posY}
        zoom={item.zoom}
        flipX={item.flipX}
        flipY={item.flipY}
        rotate={item.rotate}
        shape="rect"
        frameRatio={TIENDA_HERO_RATIO}
        onChange={(patch) => onChange({ ...item, ...patch })}
        grabHint="La foto es la protagonista: recorta lo que se verá en la pieza"
      />
      <ImageUploader compact label="Foto" value={item.imagen} onChange={(imagen) => onChange({ ...item, imagen })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Etiqueta</label>
          <input value={item.tag} onChange={(event) => onChange({ ...item, tag: event.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Título</label>
          <input value={item.title} onChange={(event) => onChange({ ...item, title: event.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Botón</label>
          <input value={item.button} onChange={(event) => onChange({ ...item, button: event.target.value })} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Destino</label>
          <input value={item.to} onChange={(event) => onChange({ ...item, to: event.target.value })} placeholder="/tienda?pasillo=skincare" className={inputClass} />
        </div>
      </div>
    </div>
  );
}

function CircleRow({ circle, onChange, onRemove }) {
  return (
    <div className="space-y-2 border border-neutral-200 p-2 dark:border-neutral-700">
      <div className="flex justify-end">
        <button type="button" onClick={onRemove} className="p-1 text-neutral-400 hover:text-red-600" aria-label="Quitar círculo">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <ImageFocusPicker
        src={circle.imagen}
        seed={circle.label || 'circulo'}
        posX={circle.posX}
        posY={circle.posY}
        zoom={circle.zoom}
        flipX={circle.flipX}
        flipY={circle.flipY}
        rotate={circle.rotate}
        shape="circle"
        onChange={(patch) => onChange({ ...circle, ...patch })}
      />
      <ImageUploader compact label="Foto del círculo" value={circle.imagen} onChange={(imagen) => onChange({ ...circle, imagen })} />
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={circle.label} onChange={(event) => onChange({ ...circle, label: event.target.value })} placeholder="Nombre" className={inputClass} />
        <input value={circle.to} onChange={(event) => onChange({ ...circle, to: event.target.value })} placeholder="/tienda?pasillo=corporal" className={inputClass} />
        <select value={circle.shape} onChange={(event) => onChange({ ...circle, shape: event.target.value })} className={inputClass}>
          {TIENDA_SUGGEST_SHAPES.map((shape) => (
            <option key={shape.id} value={shape.id}>{shape.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function InsertFields({ item, onChange, onRemove, pasillos = [] }) {
  return (
    <div className="space-y-3 border border-neutral-200 p-3 dark:border-neutral-700">
      <div className="flex items-center justify-between gap-2">
        <p className={labelClass}>{item.title || 'Sugerencia'}</p>
        <button type="button" onClick={onRemove} className="p-1 text-neutral-400 hover:text-red-600" aria-label="Quitar">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Tipo</label>
          <select value={item.type} onChange={(event) => onChange({ ...item, type: event.target.value })} className={inputClass}>
            {TIENDA_INSERT_TYPES.map((type) => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Susurro</label>
          <input value={item.title} onChange={(event) => onChange({ ...item, title: event.target.value })} placeholder="También en vitrina" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Forma</label>
          <select value={item.shape} onChange={(event) => onChange({ ...item, shape: event.target.value })} className={inputClass}>
            <option value="mix">Mezcla</option>
            {TIENDA_SUGGEST_SHAPES.map((shape) => (
              <option key={shape.id} value={shape.id}>{shape.label}</option>
            ))}
          </select>
        </div>
        {item.type === 'random' ? (
          <>
            <div>
              <label className={labelClass}>Cuántos</label>
              <input type="number" min="3" max="8" value={item.count} onChange={(event) => onChange({ ...item, count: event.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Pasillo origen</label>
              <select value={item.sourcePasillo} onChange={(event) => onChange({ ...item, sourcePasillo: event.target.value })} className={inputClass}>
                <option value="">Cualquier otro</option>
                {pasillos.filter((pas) => pas.id !== 'todos' && pas.id !== 'tratamientos').map((pas) => (
                  <option key={pas.id} value={pas.id}>{pas.nombre}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={item.enCamino} onChange={(event) => onChange({ ...item, enCamino: event.target.checked })} />
              Solo en camino
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={item.inStock} onChange={(event) => onChange({ ...item, inStock: event.target.checked })} />
              Con stock
            </label>
          </>
        ) : null}
        {item.type === 'peek' ? (
          <div className="sm:col-span-2">
            <label className={labelClass}>Destino</label>
            <input value={item.to} onChange={(event) => onChange({ ...item, to: event.target.value })} className={inputClass} />
          </div>
        ) : null}
      </div>
      {item.type === 'peek' ? (
        <>
          <ImageFocusPicker
            src={item.imagen}
            seed={item.title || 'pieza'}
            posX={item.posX}
            posY={item.posY}
            zoom={item.zoom}
            flipX={item.flipX}
            flipY={item.flipY}
            rotate={item.rotate}
            shape="rect"
            frameRatio={5 / 4}
            onChange={(patch) => onChange({ ...item, ...patch })}
          />
          <ImageUploader compact label="Foto de la pieza" value={item.imagen} onChange={(imagen) => onChange({ ...item, imagen })} />
        </>
      ) : null}
      {item.type === 'circles' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className={labelClass}>Círculos</p>
            <button
              type="button"
              onClick={() => onChange({ ...item, circles: [...item.circles, createFeedCircle({ label: 'Nuevo' }, item.circles.length)] })}
              className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
            >
              <Plus className="h-3.5 w-3.5" /> Añadir
            </button>
          </div>
          {item.circles.map((circle, index) => (
            <CircleRow
              key={circle.id}
              circle={circle}
              onChange={(next) => onChange({ ...item, circles: item.circles.map((entry, i) => (i === index ? next : entry)) })}
              onRemove={() => onChange({ ...item, circles: item.circles.filter((_, i) => i !== index) })}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function TiendaFeedFields({ form, onChange, pasillos = [] }) {
  const feed = withTiendaFeed({ tiendaFeed: form });
  const patch = (next) => onChange(withTiendaFeed({ tiendaFeed: next }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-500">
        Cada cuatro filas de la parrilla aparece una fila de círculos o un banner de esquinas redondeadas, sin ocupar más de cuatro filas.
      </p>
      <div>
        <label className={labelClass}>Cada cuántas filas</label>
        <input
          type="number"
          min="2"
          max="8"
          value={feed.interval}
          onChange={(event) => patch({ ...feed, interval: event.target.value })}
          className={`${inputClass} max-w-[8rem]`}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Piezas de entrada</h3>
          <button
            type="button"
            onClick={() => patch({ ...feed, hero: [...feed.hero, createTiendaHeroSlide({ title: 'Nueva pieza' }, feed.hero.length)] })}
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
          >
            <Plus className="h-3.5 w-3.5" /> Añadir pieza
          </button>
        </div>
        {feed.hero.map((slide, index) => (
          <HeroFields
            key={slide.id}
            item={slide}
            onChange={(next) => patch({ ...feed, hero: feed.hero.map((entry, i) => (i === index ? next : entry)) })}
            onRemove={() => patch({ ...feed, hero: feed.hero.filter((_, i) => i !== index) })}
          />
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Sugerencias del scroll</h3>
          <button
            type="button"
            onClick={() => patch({
              ...feed,
              inserts: [...feed.inserts, createTiendaInsert({ type: 'random', after: (feed.inserts.at(-1)?.after || 0) + feed.interval })]
            })}
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
          >
            <Plus className="h-3.5 w-3.5" /> Añadir sugerencia
          </button>
        </div>
        {feed.inserts.map((insert, index) => (
          <InsertFields
            key={insert.id}
            item={insert}
            pasillos={pasillos}
            onChange={(next) => patch({ ...feed, inserts: feed.inserts.map((entry, i) => (i === index ? next : entry)) })}
            onRemove={() => patch({ ...feed, inserts: feed.inserts.filter((_, i) => i !== index) })}
          />
        ))}
      </div>
    </div>
  );
}
