import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import AuroraButton from '../components/ui/AuroraButton';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <GlassCard className="w-full max-w-md text-center p-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 mb-2">
          La Burbuja de Milo
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Selecciona un rol para visualizar la interfaz.
        </p>

        <div className="flex flex-col gap-4">
          <AuroraButton onClick={() => navigate('/admin')} className="w-full">
            Entrar como Administrador
          </AuroraButton>
          
          <button 
            onClick={() => navigate('/cliente')}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
          >
            Entrar como Cliente
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
