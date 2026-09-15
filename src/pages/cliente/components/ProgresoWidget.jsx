import React from 'react';
import GlassCard from '../../../components/ui/GlassCard';
import { Camera } from 'lucide-react';

export default function ProgresoWidget() {
  const mockFotos = [
    { id: 1, date: 'Hoy', label: 'Día 14' },
    { id: 2, date: 'Hace 1 sem', label: 'Día 7' },
    { id: 3, date: 'Hace 2 sem', label: 'Día 1' },
  ];

  return (
    <GlassCard className="flex flex-col h-full">
      <div className="h-[40px] flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Progreso Visual</h2>
        <button className="p-2 bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-full hover:bg-pink-500/20 active:scale-95 transition-all">
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Carrusel vertical infinito simulado (Regla 6) */}
      <div className="flex-1 relative overflow-hidden h-[200px] rounded-xl bg-black/5 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 flex flex-col gap-2 p-2 overflow-y-auto apple-scroll">
          {mockFotos.map((foto) => (
            <div key={foto.id} className="relative h-[80px] shrink-0 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex items-end p-2">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <span className="relative z-10 text-xs font-medium text-white">{foto.label} &bull; {foto.date}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
