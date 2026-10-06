import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import RutinaWidget from './components/RutinaWidget';
import ProgresoWidget from './components/ProgresoWidget';

export default function SkincareDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <PageHeader
        title="Concierge de bienestar"
        description="Rutina del día: facial, corporal y hábitos de nutrición."
        actions={
          <button
            type="button"
            onClick={() => navigate('/mi-burbuja')}
            className="border border-neutral-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
          >
            Volver
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <RutinaWidget />
        <ProgresoWidget />
      </div>
    </div>
  );
}
