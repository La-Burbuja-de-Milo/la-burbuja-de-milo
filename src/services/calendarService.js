/**
 * Servicio para integración con Google Calendar y calendarios estándar (.ics)
 */

/**
 * Genera el enlace directo a Google Calendar para agendar el recordatorio
 * @param {Object} cita - Datos de la cita
 * @param {string} cita.titulo - Título del evento
 * @param {string} cita.descripcion - Descripción o instrucciones previas
 * @param {string} cita.ubicacion - Ubicación física o enlace virtual
 * @param {string} cita.fecha - Fecha en formato YYYY-MM-DD
 * @param {string} cita.hora - Hora en formato HH:MM (24h)
 * @param {number} [cita.duracionMinutos=60] - Duración del tratamiento en minutos
 * @returns {string} URL para Google Calendar
 */
export function generateGoogleCalendarUrl({
  titulo = 'Cita - La Burbuja de Milo',
  descripcion = 'Valoración o tratamiento estético en La Burbuja de Milo.',
  ubicacion = 'La Burbuja de Milo - Cabina Estética & Spa',
  fecha,
  hora = '10:00',
  duracionMinutos = 60
}) {
  if (!fecha) return '#';

  // Parsear fecha y hora
  const [year, month, day] = fecha.split('-').map(Number);
  const [hours, minutes] = hora.split(':').map(Number);

  const startDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const endDate = new Date(startDate.getTime() + duracionMinutos * 60 * 1000);

  const formatGoogleDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const datesParam = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo,
    dates: datesParam,
    details: `${descripcion}\n\nRecordatorio automático de La Burbuja de Milo ✨`,
    location: ubicacion
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Genera y descarga un archivo .ics para calendarios locales (Apple Calendar, Outlook, etc.)
 */
export function downloadIcsFile({
  titulo = 'Cita - La Burbuja de Milo',
  descripcion = 'Tratamiento estético en La Burbuja de Milo.',
  ubicacion = 'La Burbuja de Milo',
  fecha,
  hora = '10:00',
  duracionMinutos = 60
}) {
  if (!fecha) return;

  const [year, month, day] = fecha.split('-').map(Number);
  const [hours, minutes] = hora.split(':').map(Number);

  const startDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const endDate = new Date(startDate.getTime() + duracionMinutos * 60 * 1000);

  const formatIcsDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//La Burbuja de Milo//Agenda Estetica//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@laburbujademilo.com`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:${titulo}`,
    `DESCRIPTION:${descripcion.replace(/\n/g, '\\n')}`,
    `LOCATION:${ubicacion}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `cita-la-burbuja-de-milo-${fecha}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
