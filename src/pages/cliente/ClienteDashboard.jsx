import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MiloStore } from '../../services/miloStore';
import { generateGoogleCalendarUrl } from '../../services/calendarService';
import PageHeader from '../../components/ui/PageHeader';
import ProductCard from '../../components/shop/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { useCmsEdit, useVisualEdit } from '../../context/CmsEditContext';
import { Calendar, Clock, UserCheck, CalendarPlus } from 'lucide-react';

const tabClass = (active) =>
  `flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] sm:text-[13px] ${
    active ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
  }`;

const statusClass = (estado) => {
  if (estado === 'Confirmada') return 'bg-neutral-900 text-white';
  if (estado === 'Pendiente') return 'border border-neutral-900 text-neutral-900 dark:border-white dark:text-white';
  if (estado === 'Realizada') return 'bg-neutral-200 text-neutral-700';
  return 'bg-neutral-100 text-neutral-500';
};

export default function ClienteDashboard() {
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const { canEditFicha } = useVisualEdit();
  const { openFicha } = useCmsEdit();
  const [citas, setCitas] = useState([]);
  const [productosEnCamino, setProductosEnCamino] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [activeTab, setActiveTab] = useState('citas');
  const [notice, setNotice] = useState('');

  const loadData = () => {
    setCitas(MiloStore.getCitas());
    setProductosEnCamino(MiloStore.getProductos().filter((p) => p.enCamino));
    setClientes(MiloStore.getClientes());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('milo_store_updated', loadData);
    return () => window.removeEventListener('milo_store_updated', loadData);
  }, []);

  const ficha = useMemo(() => {
    const email = (session?.user?.email || profile?.email || '').toLowerCase();
    const telefono = profile?.telefono || '';
    return clientes.find((cl) =>
      (email && cl.email?.toLowerCase() === email) ||
      (telefono && cl.telefono === telefono)
    ) || null;
  }, [clientes, session?.user?.email, profile?.email, profile?.telefono]);

  const fichaCampos = [
    ['Diagnóstico', ficha?.diagnostico || ficha?.tipoPiel || 'Pendiente de valoración en cabina'],
    ['Activos recomendados', ficha?.activosRecomendados || 'Se asignan tras tu primera valoración'],
    ['Próxima sesión', ficha?.proximaSesion || 'Por agendar'],
    ['Concierge Milo', ficha?.skinConcierge || 'Equipo Milo'],
  ];

  const handleQuickBuy = (producto, tipo) => {
    const added = MiloStore.addToCarrito(producto, tipo);
    setNotice(added ? `${producto.nombre} se añadió a tu bolsa` : `No hay stock de ${producto.nombre}`);
    window.setTimeout(() => setNotice(''), 2500);
  };

  return (
    <div className="flex flex-col gap-8 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 px-4 py-2.5 text-xs font-medium text-white">
          {notice}
        </div>
      )}

      <PageHeader
        title="Mi Burbuja"
        description="Citas, preventas y tu ficha clínica de estética y bienestar."
        actions={
          <button
            type="button"
            onClick={() => navigate('/citas')}
            className="bg-neutral-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
          >
            Nueva cita
          </button>
        }
      />

      {canEditFicha && (
        <div className="space-y-3 border border-neutral-200 p-5">
          <h3 className="text-base font-medium">Fichas CRM publicadas</h3>
          <p className="text-sm text-neutral-500">Estas fichas son las que ve cada cliente en su cuenta.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {clientes.map((cl) => (
              <button
                key={cl.id}
                type="button"
                onClick={() => openFicha(cl)}
                className="border border-neutral-200 p-4 text-left hover:border-neutral-900"
              >
                <p className="text-sm font-medium">{cl.nombre}</p>
                <p className="mt-1 text-xs text-neutral-500">{cl.diagnostico || cl.tipoPiel || 'Sin diagnóstico'}</p>
                <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-[0.14em]">Editar ficha</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button type="button" onClick={() => setActiveTab('citas')} className={tabClass(activeTab === 'citas')}>
          <Calendar className="h-4 w-4" />
          Citas ({citas.length})
        </button>
        <button type="button" onClick={() => setActiveTab('reservas')} className={tabClass(activeTab === 'reservas')}>
          <Clock className="h-4 w-4" />
          En camino ({productosEnCamino.length})
        </button>
        <button type="button" onClick={() => setActiveTab('perfil')} className={tabClass(activeTab === 'perfil')}>
          <UserCheck className="h-4 w-4" />
          Ficha clínica
        </button>
      </div>

      {activeTab === 'citas' && (
        <div className="space-y-4">
          {citas.length === 0 ? (
            <div className="flex flex-col items-center gap-4 border border-neutral-200 px-6 py-12 text-center">
              <Calendar className="h-8 w-8 text-neutral-400" />
              <p className="text-sm font-medium">No tienes citas activas</p>
              <button
                type="button"
                onClick={() => navigate('/citas')}
                className="bg-neutral-900 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
              >
                Agendar valoración
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  <article key={cita.id} className="flex flex-col justify-between border border-neutral-200 p-5">
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusClass(cita.estado)}`}>
                          {cita.estado}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-neutral-400">
                          <Clock className="h-3.5 w-3.5" />
                          {cita.duracionMinutos || 60} min
                        </span>
                      </div>
                      <h3 className="text-base font-medium">{cita.servicioTitulo}</h3>
                      <p className="mt-3 text-sm text-neutral-600">
                        {cita.fecha} · {cita.hora}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">{cita.clienteNombre}</p>
                      {cita.notasCliente && (
                        <p className="mt-2 text-xs italic text-neutral-400">“{cita.notasCliente}”</p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3">
                      <a
                        href={calUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" />
                        Calendar
                      </a>
                      <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-400">Cabina</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate('/mi-burbuja/skincare')}
            className="text-xs font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline"
          >
            Ver rutina y progreso
          </button>
        </div>
      )}

      {activeTab === 'reservas' && (
        <div className="space-y-6">
          <p className="border border-neutral-200 bg-[#f6f6f6] p-4 text-sm text-neutral-600">
            Los productos en tránsito se apartan sin costo inicial. Te avisamos por WhatsApp al ingresar a inventario.
          </p>
          <div className="grid grid-cols-2 items-stretch gap-x-4 gap-y-10 md:grid-cols-3">
            {productosEnCamino.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickBuy={handleQuickBuy}
                onOpen={() => navigate('/tienda?filtro=en-camino')}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'perfil' && (
        <div className="max-w-2xl space-y-6 border border-neutral-200 p-6 sm:p-8">
          <div className="border-b border-neutral-200 pb-4">
            <h3 className="text-xl font-medium">Ficha clínica</h3>
            <p className="mt-1 text-sm text-neutral-500">
              {ficha
                ? 'Publicada por el equipo desde tu ficha CRM: facial, corporal y bienestar.'
                : 'Aún no hay una ficha asociada a tu cuenta. Se completa tras tu valoración en cabina.'}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fichaCampos.map(([label, value]) => (
              <div key={label} className="border border-neutral-200 p-4">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{label}</span>
                <p className="mt-2 text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>
          {canEditFicha && ficha && (
            <button
              type="button"
              onClick={() => openFicha(ficha)}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline"
            >
              Editar esta ficha
            </button>
          )}
        </div>
      )}
    </div>
  );
}
