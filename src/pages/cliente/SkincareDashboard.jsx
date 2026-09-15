import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import RutinaWidget from './components/RutinaWidget';
import ProgresoWidget from './components/ProgresoWidget';

export default function SkincareDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Mi Skin-Concierge" 
        description="Seguimiento de rutina y progreso de tu piel."
        glow="modelo"
        actions={
          <button 
            onClick={() => navigate('/mi-burbuja')}
            className="text-sm font-medium px-4 py-2 bg-white/50 dark:bg-black/20 rounded-lg hover:bg-white dark:hover:bg-black/40 transition-colors shadow-sm"
          >
            &larr; Volver al Hub
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto sm:h-[450px]">
        <RutinaWidget />
        <ProgresoWidget />
      </div>
    </div>
  );
}
