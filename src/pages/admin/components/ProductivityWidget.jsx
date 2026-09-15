import React from 'react';
import GlassCard from '../../../components/ui/GlassCard';

export default function ProductivityWidget() {
  const mockRates = [
    { currency: 'USD → COP', rate: '3,950.50', trend: '+12.50' },
    { currency: 'EUR → COP', rate: '4,210.00', trend: '-5.20' },
  ];

  return (
    <GlassCard className="flex flex-col h-full">
      {/* Encabezado con altura estricta para simetría (Regla 9) */}
      <div className="h-[40px] flex items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Productividad & Tasas</h2>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Dynamic Time Island / Tasas (Regla 12) */}
        <div className="grid grid-cols-2 gap-3">
          {mockRates.map((rate, i) => (
            <div key={i} className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-xl border border-blue-500/10 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{rate.currency}</span>
              <span className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">{rate.rate}</span>
              <span className={`text-[10px] font-medium ${rate.trend.startsWith('+') ? 'text-green-500' : 'text-rose-500'}`}>
                {rate.trend} hoy
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400 text-center px-4">
            Sin alertas de productividad para el equipo principal.
          </p>
        </div>
      </div>

      {/* Footer anclado (Regla 9) */}
      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
        <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity">
          Configurar tasas &rarr;
        </button>
      </div>
    </GlassCard>
  );
}
