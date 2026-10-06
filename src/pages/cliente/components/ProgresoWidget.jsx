import React from 'react';
import { Camera } from 'lucide-react';

export default function ProgresoWidget() {
  const mockFotos = [
    { id: 1, date: 'Hoy', label: 'Día 14' },
    { id: 2, date: 'Hace 1 sem', label: 'Día 7' },
    { id: 3, date: 'Hace 2 sem', label: 'Día 1' },
  ];

  return (
    <section className="flex h-full flex-col border border-neutral-200 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-medium tracking-tight">Progreso visual</h2>
        <button type="button" className="border border-neutral-900 p-2" aria-label="Añadir foto">
          <Camera className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {mockFotos.map((foto) => (
          <div key={foto.id} className="flex h-20 items-end bg-[#f3f0ea] p-3">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-700">
              {foto.label} · {foto.date}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
