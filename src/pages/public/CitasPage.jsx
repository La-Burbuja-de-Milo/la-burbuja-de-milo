import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MiloStore } from '../../services/miloStore';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../../services/calendarService';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import AuroraButton from '../../components/ui/AuroraButton';
import { Calendar, Clock, CheckCircle2, User, Phone, Mail, Sparkles, ArrowRight, Download, CalendarPlus } from 'lucide-react';

const HORARIOS_DISPONIBLES = [
  '09:00', '10:00', '11:15', '14:00', '15:15', '16:30', '17:45'
];

export default function CitasPage() {
  const [searchParams] = useSearchParams();
  const preSelectedSrvId = searchParams.get('servicio');
  const navigate = useNavigate();

  const [servicios, setServicios] = useState([]);
  const [step, setStep] = useState(1); // 1: Servicio, 2: Fecha/Hora, 3: Datos, 4: Confirmado

  const [selectedServicio, setSelectedServicio] = useState(null);
  const [selectedFecha, setSelectedFecha] = useState('');
  const [selectedHora, setSelectedHora] = useState('');

  // Formulario cliente
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [tipoPiel, setTipoPiel] = useState('Mixta');
  const [notasCliente, setNotasCliente] = useState('');

  // Cita creada
  const [citaCreada, setCitaCreada] = useState(null);

  useEffect(() => {
    const list = MiloStore.getServicios();
    setServicios(list);
    if (preSelectedSrvId) {
      const match = list.find(s => s.id === preSelectedSrvId);
      if (match) {
        setSelectedServicio(match);
        setStep(2);
      }
    }
  }, [preSelectedSrvId]);

  // Establecer fecha mínima como hoy
  const hoy = new Date().toISOString().split('T')[0];

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!selectedServicio || !selectedFecha || !selectedHora || !clienteNombre || !clienteTelefono) return;

    const nuevaCita = MiloStore.addCita({
      clienteNombre,
      clienteTelefono,
      clienteEmail,
      tipoPiel,
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
    titulo: `Cita: ${citaCreada.servicioTitulo} ✨ La Burbuja de Milo`,
    descripcion: `Tratamiento estético con La Burbuja de Milo.\nCliente: ${citaCreada.clienteNombre}\nNotas: ${citaCreada.notasCliente || 'Ninguna'}\n¡Te esperamos en cabina!`,
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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <PageHeader 
        title="Agendador de Citas Estéticas" 
        description="Reserva tu valoración facial o tratamiento con recordatorio sincronizado a Google Calendar."
        glow="default"
      />

      {/* Indicador de pasos */}
      <div className="flex items-center justify-between px-2 sm:px-6">
        {[
          { num: 1, label: 'Servicio' },
          { num: 2, label: 'Fecha & Hora' },
          { num: 3, label: 'Tus Datos' },
          { num: 4, label: 'Confirmación' }
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div 
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s.num
                  ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                  : step > s.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-500'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-gray-600 dark:text-gray-400">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* PASO 1: SELECCIÓN DE SERVICIO */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            1. Elige tu tratamiento o valoración
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {servicios.map((srv) => {
              const isSelected = selectedServicio?.id === srv.id;
              return (
                <GlassCard
                  key={srv.id}
                  onClick={() => {
                    setSelectedServicio(srv);
                  }}
                  className={`p-5 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-pink-500 ring-2 ring-pink-500/20 shadow-lg'
                      : 'hover:border-gray-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                      {srv.categoria}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {srv.duracionMinutos} min
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    {srv.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">
                    {srv.descripcion}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      ${srv.precio.toFixed(2)} USD
                    </span>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-pink-500' : 'text-gray-400'}`}>
                      {isSelected ? 'Seleccionado ✓' : 'Elegir'}
                    </span>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <AuroraButton
              disabled={!selectedServicio}
              onClick={() => setStep(2)}
              className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2 ${
                !selectedServicio ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>Continuar con Fecha y Hora</span>
              <ArrowRight className="w-4 h-4" />
            </AuroraButton>
          </div>
        </div>
      )}

      {/* PASO 2: SELECCIÓN DE FECHA Y HORARIO */}
      {step === 2 && (
        <GlassCard className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                2. Selecciona Fecha y Hora
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Servicio: <strong>{selectedServicio?.titulo}</strong> ({selectedServicio?.duracionMinutos} min)
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-pink-600 dark:text-pink-400 hover:underline"
            >
              Cambiar servicio
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Selector de fecha */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-500" />
                Fecha de la Cita
              </label>
              <input
                type="date"
                min={hoy}
                value={selectedFecha}
                onChange={(e) => setSelectedFecha(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-400">
                Atención de Lunes a Sábado en cabina estética y virtual.
              </p>
            </div>

            {/* Selector de franja horaria */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-pink-500" />
                Horarios Disponibles
              </label>
              <div className="grid grid-cols-3 gap-2">
                {HORARIOS_DISPONIBLES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSelectedHora(h)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      selectedHora === h
                        ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              Atrás
            </button>
            <AuroraButton
              disabled={!selectedFecha || !selectedHora}
              onClick={() => setStep(3)}
              className={`px-8 py-2.5 text-sm font-semibold flex items-center gap-2 ${
                !selectedFecha || !selectedHora ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>Continuar con mis Datos</span>
              <ArrowRight className="w-4 h-4" />
            </AuroraButton>
          </div>
        </GlassCard>
      )}

      {/* PASO 3: DATOS DEL CLIENTE */}
      {step === 3 && (
        <GlassCard className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-gray-100 dark:border-white/5 pb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              3. Datos de contacto y preferencias
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedServicio?.titulo} — {selectedFecha} a las {selectedHora}
            </p>
          </div>

          <form onSubmit={handleConfirmBooking} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-pink-500" />
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Camila Morales"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-pink-500" />
                  WhatsApp / Celular *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="ej. 3001234567"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-pink-500" />
                  Correo Electrónico (para confirmación)
                </label>
                <input
                  type="email"
                  placeholder="ej. camila@ejemplo.com"
                  value={clienteEmail}
                  onChange={(e) => setClienteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Tipo de Piel Principal
                </label>
                <select
                  value={tipoPiel}
                  onChange={(e) => setTipoPiel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="Mixta">Mixta</option>
                  <option value="Grasa / Con tendencia acneica">Grasa / Con tendencia acneica</option>
                  <option value="Seca / Deshidratada">Seca / Deshidratada</option>
                  <option value="Sensible / Reactiva con rojeces">Sensible / Reactiva con rojeces</option>
                  <option value="Madura / Líneas finas">Madura / Líneas finas</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Notas, alergias o preocupaciones estéticas
              </label>
              <textarea
                rows={3}
                placeholder="Indícanos si tienes alergia a algún activo, si usas retinol, o cuál es tu principal objetivo para esta cita..."
                value={notasCliente}
                onChange={(e) => setNotasCliente(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 apple-scroll"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                Atrás
              </button>
              <AuroraButton type="submit" className="px-8 py-2.5 text-sm font-semibold">
                Confirmar y Apartar Cita ✨
              </AuroraButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* PASO 4: CONFIRMACIÓN Y BOTÓN GOOGLE CALENDAR */}
      {step === 4 && citaCreada && (
        <GlassCard className="p-8 sm:p-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Cita Agendada Exitosamente!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Te esperamos en cabina para tu sesión de <strong>{citaCreada.servicioTitulo}</strong> con tu Skin-Concierge.
            </p>
          </div>

          {/* Tarjeta resumen de la cita */}
          <div className="w-full max-w-md p-4 rounded-2xl bg-gray-100/70 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Cliente:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{citaCreada.clienteNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha y Hora:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{citaCreada.fecha} a las {citaCreada.hora}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duración:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{citaCreada.duracionMinutos} minutos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estado:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {citaCreada.estado}
              </span>
            </div>
          </div>

          {/* BOTÓN GOOGLE CALENDAR DESTACADO */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <a
              href={googleCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:opacity-95 active:scale-98 transition-all"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Añadir a Google Calendar</span>
            </a>

            <button
              onClick={handleDownloadIcs}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-white/20 active:scale-98 transition-all"
              title="Descargar archivo .ics para Apple Calendar o Outlook"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .ICS</span>
            </button>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5 text-xs">
            <button
              onClick={() => navigate('/mi-burbuja')}
              className="text-pink-600 dark:text-pink-400 font-semibold hover:underline"
            >
              Ver en Mi Burbuja (Panel de Citas)
            </button>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <button
              onClick={() => navigate('/tienda')}
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              Seguir explorando la Tienda
            </button>
          </div>
        </GlassCard>
      )}

    </div>
  );
}
