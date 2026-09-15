import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MiloStore } from '../../services/miloStore';
import { generateGoogleCalendarUrl } from '../../services/calendarService';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import AuroraButton from '../../components/ui/AuroraButton';
import { Calendar, Clock, ShoppingBag, Sparkles, CheckCircle, CalendarPlus, UserCheck, Droplets, AlertCircle } from 'lucide-react';

export default function ClienteDashboard() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [productosEnCamino, setProductosEnCamino] = useState([]);
  const [activeTab, setActiveTab] = useState('citas'); // 'citas' | 'reservas' | 'perfil'

  const loadData = () => {
    setCitas(MiloStore.getCitas());
    // Productos en camino que se pueden reservar
    const allProds = MiloStore.getProductos();
    setProductosEnCamino(allProds.filter(p => p.enCamino));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('milo_store_updated', loadData);
    return () => window.removeEventListener('milo_store_updated', loadData);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Mi Burbuja" 
        description="Tu santuario personal: Consulta tus citas agendadas, recordatorios y productos reservados."
        glow="default"
        actions={
          <button
            onClick={() => navigate('/citas')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/20 active:scale-95 transition-all"
          >
            + Nueva Cita
          </button>
        }
      />

      {/* Selector de Pestañas del Cliente */}
      <div className="flex items-center gap-2 border-b border-gray-200/60 dark:border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('citas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'citas'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Mis Citas ({citas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reservas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'reservas'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Productos en Camino ({productosEnCamino.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('perfil')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'perfil'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Ficha de Piel</span>
        </button>
      </div>

      {/* PESTAÑA 1: CITAS AGENDADAS */}
      {activeTab === 'citas' && (
        <div className="space-y-4">
          {citas.length === 0 ? (
            <GlassCard className="p-8 text-center flex flex-col items-center justify-center space-y-3">
              <Calendar className="w-8 h-8 text-gray-400" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">No tienes citas activas</p>
              <AuroraButton onClick={() => navigate('/citas')} className="px-6 py-2 text-xs font-semibold">
                Agendar mi primera valoración
              </AuroraButton>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {citas.map((cita) => {
                const calUrl = generateGoogleCalendarUrl({
                  titulo: `Cita: ${cita.servicioTitulo} - La Burbuja de Milo`,
                  descripcion: `Tratamiento estético en La Burbuja de Milo.\nCliente: ${cita.clienteNombre}`,
                  ubicacion: 'La Burbuja de Milo - Cabina Estética & Spa',
                  fecha: cita.fecha,
                  hora: cita.hora,
                  duracionMinutos: cita.duracionMinutos || 60
                });

                return (
                  <GlassCard key={cita.id} className="p-5 flex flex-col justify-between space-y-4 border border-gray-200/60 dark:border-white/10 hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          cita.estado === 'Confirmada'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : cita.estado === 'Pendiente'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            : cita.estado === 'Realizada'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                        }`}>
                          {cita.estado}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {cita.duracionMinutos || 60} min
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {cita.servicioTitulo}
                      </h3>

                      <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-pink-500" />
                          <span><strong>Fecha:</strong> {cita.fecha} — {cita.hora}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                          <span><strong>Titular:</strong> {cita.clienteNombre}</span>
                        </p>
                        {cita.notasCliente && (
                          <p className="text-[11px] text-gray-400 italic pt-1">
                            "{cita.notasCliente}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <a
                        href={calUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-semibold transition-colors"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>Sincronizar a Google Calendar</span>
                      </a>

                      <span className="text-[11px] text-gray-400">Cabina Principal</span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: PRODUCTOS EN CAMINO Y PREVENTA */}
      {activeTab === 'reservas' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs flex items-start gap-3">
            <Clock className="w-5 h-5 shrink-0 mt-0.5 text-purple-500" />
            <div>
              <p className="font-bold">Monitoreo de Arribos Internacionales</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Los productos que se encuentran en tránsito pueden ser apartados sin costo inicial. Te contactaremos vía WhatsApp tan pronto ingresen a nuestro inventario para despacharlos inmediatamente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosEnCamino.map((prod) => (
              <GlassCard key={prod.id} className="p-5 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-md">
                      En Camino
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      Arribo: {prod.fechaLlegada}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{prod.nombre}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{prod.descripcion}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">${prod.precio.toFixed(2)}</span>
                  <button
                    onClick={() => MiloStore.addToCarrito(prod, 'reserva_en_camino')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 active:scale-95 transition-all"
                  >
                    Apartar
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: FICHA DE PIEL */}
      {activeTab === 'perfil' && (
        <GlassCard className="p-6 sm:p-8 space-y-4 max-w-2xl">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4">
            <div className="w-12 h-12 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Perfil Estético & Recomendaciones</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Actualizado según tu última valoración en cabina</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 space-y-1">
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Diagnóstico de Manto Lipídico</span>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Barrera Cutánea Normal a Mixta</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 space-y-1">
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Activos Recomendados</span>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Centella Asiática, Ácido Hialurónico, Filtro Mineral</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 space-y-1">
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Próxima Sesión Sugerida</span>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Limpieza Profunda e Hidratación Ultrasónica</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 space-y-1">
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Skin Concierge Asignado</span>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Dra. Milo & Especialistas</p>
            </div>
          </div>
        </GlassCard>
      )}

    </div>
  );
}
