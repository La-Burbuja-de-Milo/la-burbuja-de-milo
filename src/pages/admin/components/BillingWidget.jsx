import React from 'react';
import GlassCard from '../../../components/ui/GlassCard';

export default function BillingWidget() {
  const mockData = [
    { id: 1, name: 'Agencia Innova', gross: '$12,450', cut: '$2,490', profit: '$9,960' },
    { id: 2, name: 'Estudio Alpha', gross: '$8,320', cut: '$1,664', profit: '$6,656' },
    { id: 3, name: 'Boutique Zen', gross: '$5,100', cut: '$1,020', profit: '$4,080' },
  ];

  return (
    <GlassCard className="flex flex-col h-full">
      {/* Encabezado con altura estricta para simetría (Regla 9) */}
      <div className="h-[40px] flex items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Facturación</h2>
      </div>

      {/* Cuerpo expansible con scroll (Regla 12) */}
      <div className="flex-1 overflow-y-auto apple-scroll pr-2 -mr-2">
        <div className="space-y-3">
          {mockData.map((item) => (
            <div key={item.id} className="flex flex-col gap-1 p-3 bg-white/50 dark:bg-gray-900/50 rounded-xl border border-white/20 dark:border-white/5">
              <span className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</span>
              <div className="flex justify-between text-xs tabular-nums text-gray-500 dark:text-gray-400">
                <span>Gross: <span className="text-gray-900 dark:text-gray-200">{item.gross}</span></span>
                <span>Cut: {item.cut}</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Profit: {item.profit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer anclado (Regla 9) */}
      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
        <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity">
          Ver reporte completo &rarr;
        </button>
      </div>
    </GlassCard>
  );
}
