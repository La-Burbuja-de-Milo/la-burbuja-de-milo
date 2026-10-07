import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MiloStore } from '../../services/miloStore';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../../services/calendarService';
import PageHeader from '../../components/ui/PageHeader';
import ProductVisual from '../../components/shop/ProductVisual';
import { Calendar, Clock, CheckCircle2, User, Phone, Mail, ArrowRight, Download, CalendarPlus } from 'lucide-react';
import EditHotspot from '../../components/admin/EditHotspot';
import { useCmsEdit, useVisualEdit } from '../../context/CmsEditContext';
import { formatCOP } from '../../lib/money';
import { visualCropProps } from '../../lib/mediaCrop';

const HORARIOS_DISPONIBLES = [
  '09:00', '10:00', '11:15', '14:00', '15:15', '16:30', '17:45'
];

const inputClass =
  'w-full border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white';
const primaryBtn =
  'inline-flex items-center justify-center gap-2 bg-neutral-900 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900';
const ghostBtn =
  'text-xs font-medium uppercase tracking-[0.14em] text-neutral-500 hover:text-neutral-900';

export default function CitasPage() {
  const [searchParams] = useSearchParams();
  const preSelectedSrvId = searchParams.get('servicio');
  const navigate = useNavigate();
  const { canEditCatalog } = useVisualEdit();
  const { openServicio } = useCmsEdit();

  const [servicios, setServicios] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [selectedFecha, setSelectedFecha] = useState('');
  const [selectedHora, setSelectedHora] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [areaInteres, setAreaInteres] = useState('Integral');
  const [notasCliente, setNotasCliente] = useState('');
  const [citaCreada, setCitaCreada] = useState(null);

  useEffect(() => {
    const loadServicios = () => setServicios(MiloStore.getServicios());
    loadServicios();
    window.addEventListener('milo_store_updated', loadServicios);
    return () => window.removeEventListener('milo_store_updated', loadServicios);
  }, []);

  useEffect(() => {
    if (!preSelectedSrvId) return;
    const match = MiloStore.getServicios().find((s) => s.id === preSelectedSrvId);
    if (match) {
      setSelectedServicio(match);
      setStep(2);
    }
  }, [preSelectedSrvId]);

  const hoy = new Date().toISOString().split('T')[0];

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!selectedServicio || !selectedFecha || !selectedHora || !clienteNombre || !clienteTelefono) return;

    const nuevaCita = MiloStore.addCita({
      clienteNombre,
      clienteTelefono,
      clienteEmail,
      tipoPiel: areaInteres,
      areaInteres,
      servicioId: selectedServicio.id,
      servicioTitulo: selectedServicio.titulo,
      duracionMinutos: selectedServicio.duracionMinutos,
      fecha: selectedFecha,
      hora: selectedHora,
      notasCliente,
      estado: 'Confirmada'
    });

    setCitaCreada(nuevaCita);
    setStep(4);
  };

  const googleCalUrl = citaCreada ? generateGoogleCalendarUrl({
    titulo: `Cita: ${citaCreada.servicioTitulo} — La Burbuja de Milo`,
    descripcion: `Tratamiento estético con La Burbuja de Milo.\nCliente: ${citaCreada.clienteNombre}\nNotas: ${citaCreada.notasCliente || 'Ninguna'}`,
    ubicacion: 'La Burbuja de Milo - Cabina Estética & Spa',
    fecha: citaCreada.fecha,
    hora: citaCreada.hora,
    duracionMinutos: citaCreada.duracionMinutos
  }) : '#';

  const handleDownloadIcs = () => {
    if (!citaCreada) return;
    downloadIcsFile({
      titulo: `Cita: ${citaCreada.servicioTitulo} - La Burbuja de Milo`,
      descripcion: `Tratamiento estético en La Burbuja de Milo para ${citaCreada.clienteNombre}.`,
      ubicacion: 'La Burbuja de Milo - Cabina Estética & Spa',
      fecha: citaCreada.fecha,
      hora: citaCreada.hora,
      duracionMinutos: citaCreada.duracionMinutos
    });
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 bg-white text-neutral-900">
      <PageHeader
        title="Cabina"
        description="Valoración y tratamientos faciales, corporales y de bienestar. Confirmación con recordatorio de calendario."
      />

      <ol className="flex items-center gap-3 border-y border-neutral-200 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
        {[
          { num: 1, label: 'Servicio' },
          { num: 2, label: 'Fecha' },
          { num: 3, label: 'Datos' },
          { num: 4, label: 'Confirmación' }
        ].map((s) => (
          <li key={s.num} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center text-[11px] ${
                step === s.num
                  ? 'bg-neutral-900 text-white'
                  : step > s.num
                  ? 'border border-neutral-900 text-neutral-900'
                  : 'border border-neutral-300'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </span>
            <span className={step === s.num ? 'text-neutral-900' : ''}>{s.label}</span>
          </li>
        ))}
      </ol>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-medium tracking-tight">Elige tu tratamiento</h2>
          <p className="text-sm text-neutral-500">Facial, corporal y bienestar. El concierge ajusta el protocolo en cabina.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {servicios.map((srv) => {
              const isSelected = selectedServicio?.id === srv.id;
              return (
                <EditHotspot key={srv.id} enabled={canEditCatalog} onEdit={() => openServicio(srv)}>
                <button
                  type="button"
                  onClick={() => setSelectedServicio(srv)}
                  className={`flex w-full flex-col overflow-hidden border text-left transition-colors ${
                    isSelected ? 'border-neutral-900' : 'border-neutral-200 hover:border-neutral-900'
                  }`}
                >
                  <ProductVisual {...visualCropProps(srv)} className="h-40 w-full" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                        {srv.categoria}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-neutral-400">
                        <Clock className="h-3 w-3" />
                        {srv.duracionMinutos} min
                      </span>
                    </div>
                    <h3 className="text-base font-medium">{srv.titulo}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{srv.descripcion}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3">
                      <span className="text-sm font-semibold">{formatCOP(srv.precio)}</span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                        {isSelected ? 'Seleccionado' : 'Elegir'}
                      </span>
                    </div>
                  </div>
                </button>
                </EditHotspot>
              );
            })}
          </div>
          <div className="flex justify-end">
            <button type="button" disabled={!selectedServicio} onClick={() => setStep(2)} className={primaryBtn}>
              Continuar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 border border-neutral-200 p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <div>
              <h2 className="text-2xl font-medium tracking-tight">Fecha y hora</h2>
              <p className="mt-1 text-sm text-neutral-500">
                {selectedServicio?.titulo} · {selectedServicio?.duracionMinutos} min
              </p>
            </div>
            <button type="button" onClick={() => setStep(1)} className={ghostBtn}>
              Cambiar servicio
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700">
                <Calendar className="h-4 w-4" />
                Fecha
              </label>
              <input
                type="date"
                min={hoy}
                value={selectedFecha}
                onChange={(e) => setSelectedFecha(e.target.value)}
                className={inputClass}
              />
              <p className="text-[11px] text-neutral-400">Atención de lunes a sábado, en cabina y virtual.</p>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700">
                <Clock className="h-4 w-4" />
                Horarios
              </label>
              <div className="grid grid-cols-3 gap-2">
                {HORARIOS_DISPONIBLES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSelectedHora(h)}
                    className={`py-2 text-xs font-semibold ${
                      selectedHora === h
                        ? 'bg-neutral-900 text-white'
                        : 'border border-neutral-200 text-neutral-700 hover:border-neutral-900'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
            <button type="button" onClick={() => setStep(1)} className={ghostBtn}>Atrás</button>
            <button
              type="button"
              disabled={!selectedFecha || !selectedHora}
              onClick={() => setStep(3)}
              className={primaryBtn}
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 border border-neutral-200 p-6 sm:p-8">
          <div className="border-b border-neutral-200 pb-4">
            <h2 className="text-2xl font-medium tracking-tight">Tus datos</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {selectedServicio?.titulo} — {selectedFecha} a las {selectedHora}
            </p>
          </div>

          <form onSubmit={handleConfirmBooking} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700">
                  <User className="h-3.5 w-3.5" /> Nombre completo *
                </label>
                <input type="text" required placeholder="Camila Morales" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700">
                  <Phone className="h-3.5 w-3.5" /> WhatsApp *
                </label>
                <input type="tel" required placeholder="3001234567" value={clienteTelefono} onChange={(e) => setClienteTelefono(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700">
                  <Mail className="h-3.5 w-3.5" /> Correo
                </label>
                <input type="email" placeholder="camila@ejemplo.com" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700">Área de interés</label>
                <select value={areaInteres} onChange={(e) => setAreaInteres(e.target.value)} className={inputClass}>
                  <option value="Integral">Integral (facial, corporal y bienestar)</option>
                  <option value="Facial">Estética facial</option>
                  <option value="Corporal">Estética corporal</option>
                  <option value="Bienestar">Bienestar y nutrición</option>
                  <option value="Capilar">Cuidado capilar</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700">Notas o alergias</label>
              <textarea rows={3} placeholder="Activos que usas, alergias u objetivo de la cita" value={notasCliente} onChange={(e) => setNotasCliente(e.target.value)} className={`${inputClass} apple-scroll`} />
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
              <button type="button" onClick={() => setStep(2)} className={ghostBtn}>Atrás</button>
              <button type="submit" className={primaryBtn}>Confirmar cita</button>
            </div>
          </form>
        </div>
      )}

      {step === 4 && citaCreada && (
        <div className="flex flex-col items-center space-y-6 border border-neutral-200 px-6 py-12 text-center">
          <CheckCircle2 className="h-10 w-10 text-neutral-900" />
          <div>
            <h2 className="text-3xl font-medium tracking-tight">Cita confirmada</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
              Te esperamos para <strong className="font-medium text-neutral-900">{citaCreada.servicioTitulo}</strong>.
            </p>
          </div>
          <div className="w-full max-w-md space-y-2 border border-neutral-200 p-4 text-left text-sm">
            <div className="flex justify-between"><span className="text-neutral-500">Cliente</span><span>{citaCreada.clienteNombre}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Fecha</span><span>{citaCreada.fecha} · {citaCreada.hora}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Duración</span><span>{citaCreada.duracionMinutos} min</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Estado</span><span className="uppercase tracking-[0.12em]">{citaCreada.estado}</span></div>
          </div>
          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <a href={googleCalUrl} target="_blank" rel="noopener noreferrer" className={`${primaryBtn} w-full sm:flex-1`}>
              <CalendarPlus className="h-4 w-4" /> Google Calendar
            </a>
            <button type="button" onClick={handleDownloadIcs} className="inline-flex w-full items-center justify-center gap-2 border border-neutral-900 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] sm:w-auto">
              <Download className="h-4 w-4" /> .ICS
            </button>
          </div>
          <div className="flex gap-4 pt-2 text-xs uppercase tracking-[0.14em]">
            <button type="button" onClick={() => navigate('/mi-burbuja')} className="underline-offset-4 hover:underline">Mi Burbuja</button>
            <button type="button" onClick={() => navigate('/tienda')} className="text-neutral-500 hover:text-neutral-900">Tienda</button>
          </div>
        </div>
      )}
    </div>
  );
}
