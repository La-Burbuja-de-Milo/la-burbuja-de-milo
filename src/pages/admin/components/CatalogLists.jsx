import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { productInPasillo } from '../../../lib/pasillos';

const inputClass = 'w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white';

function CatalogColumn({ title, hint, items, lockedIds = [], onAdd, onRename, onDelete }) {
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState({});

  return (
    <div className="space-y-3 border border-neutral-200 p-4 dark:border-neutral-700">
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="mt-1 text-xs text-neutral-500">{hint}</p>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const nombre = draft.trim();
          if (!nombre) return;
          onAdd(nombre);
          setDraft('');
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Nuevo nombre"
          className={inputClass}
        />
        <button type="submit" className="inline-flex items-center gap-1 border border-neutral-900 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] dark:border-white">
          <Plus className="h-3.5 w-3.5" />
          Alta
        </button>
      </form>
      <ul className="space-y-2">
        {items.map((item) => {
          const locked = lockedIds.includes(item.id);
          const value = editing[item.id] ?? item.nombre;
          return (
            <li key={item.id} className="flex items-center gap-2">
              <input
                value={value}
                onChange={(event) => setEditing((current) => ({ ...current, [item.id]: event.target.value }))}
                onBlur={() => {
                  const next = (editing[item.id] ?? item.nombre).trim();
                  if (next && next !== item.nombre) onRename(item.id, next);
                  setEditing((current) => {
                    const copy = { ...current };
                    delete copy[item.id];
                    return copy;
                  });
                }}
                className={inputClass}
              />
              <button
                type="button"
                disabled={locked}
                onClick={() => onDelete(item.id)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-white"
                aria-label={`Eliminar ${item.nombre}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function CatalogLists({ pasillos, marcas, etiquetas, store }) {
  const editablePasillos = pasillos.filter((item) => item.id !== 'todos');

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-medium">Pasillos, marcas y etiquetas</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Listas fijas para el formulario de producto. Puedes agregar, renombrar o eliminar. “Toda la tienda” no se borra.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <CatalogColumn
          title="Pasillos"
          hint="Un producto puede estar en varios pasillos."
          items={editablePasillos}
          onAdd={(nombre) => store.addPasillo({ nombre })}
          onRename={(id, nombre) => store.updatePasillo(id, { nombre })}
          onDelete={(id) => {
            const used = store.getProductos().filter((product) => productInPasillo(product, id)).length;
            if (used && !window.confirm(`Hay ${used} producto(s) en este pasillo. ¿Eliminarlo de todas formas?`)) return;
            store.deletePasillo(id);
          }}
        />
        <CatalogColumn
          title="Marcas"
          hint="fuXion, Riman y las que sumes."
          items={marcas}
          onAdd={(nombre) => store.addMarca({ nombre })}
          onRename={(id, nombre) => store.updateMarca(id, { nombre })}
          onDelete={(id) => window.confirm('¿Eliminar esta marca del listado?') && store.deleteMarca(id)}
        />
        <CatalogColumn
          title="Etiquetas"
          hint="Bestseller, Nuevo, Preventa…"
          items={etiquetas}
          onAdd={(nombre) => store.addEtiqueta({ nombre })}
          onRename={(id, nombre) => store.updateEtiqueta(id, { nombre })}
          onDelete={(id) => window.confirm('¿Eliminar esta etiqueta del listado?') && store.deleteEtiqueta(id)}
        />
      </div>
    </div>
  );
}
