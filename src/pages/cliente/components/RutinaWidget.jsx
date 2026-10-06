import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function RutinaWidget() {
  const mockRutina = [
    { id: 1, step: 'Facial', product: 'Limpieza Incellderm + sérum de cabina', done: true },
    { id: 2, step: 'Corporal', product: 'Gel reafirmante en abdomen y piernas', done: false },
    { id: 3, step: 'Bienestar', product: 'fuXion Cafezzino o colágeno Lifening', done: false },
    { id: 4, step: 'Protección', product: 'SPF 50+ Riman o mineral Milo', done: false },
  ];

  return (
    <section className="flex h-full flex-col border border-neutral-200 p-5">
      <h2 className="mb-4 text-xl font-medium tracking-tight">Rutina de hoy (AM)</h2>
      <div className="flex flex-1 flex-col gap-2">
        {mockRutina.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border border-neutral-200 p-3">
            {item.done ? (
              <CheckCircle2 className="h-5 w-5 text-neutral-900" />
            ) : (
              <Circle className="h-5 w-5 text-neutral-300" />
            )}
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${item.done ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                {item.step}
              </span>
              <span className="text-xs text-neutral-500">{item.product}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
