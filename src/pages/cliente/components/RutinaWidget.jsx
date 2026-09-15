import React from 'react';
import GlassCard from '../../../components/ui/GlassCard';
import { CheckCircle2, Circle } from 'lucide-react';

export default function RutinaWidget() {
  const mockRutina = [
    { id: 1, step: 'Limpieza', product: 'Gel Limpiador Suave', done: true },
    { id: 2, step: 'Tratamiento', product: 'Serum Vitamina C', done: false },
    { id: 3, step: 'Hidratación', product: 'Crema Ligera', done: false },
    { id: 4, step: 'Protección', product: 'SPF 50+', done: false },
  ];

  return (
    <GlassCard className="flex flex-col h-full">
      <div className="h-[40px] flex items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rutina de Hoy (AM)</h2>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {mockRutina.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center gap-3 p-3 bg-white/40 dark:bg-gray-800/40 rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
          >
            {item.done ? (
              <CheckCircle2 className="w-5 h-5 text-pink-500 drop-shadow-[0_0_4px_rgba(236,72,153,0.5)]" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
            )}
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${item.done ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                {item.step}
              </span>
              <span className="text-xs text-gray-500">{item.product}</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
