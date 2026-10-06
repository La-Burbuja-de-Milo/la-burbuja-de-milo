/**
 * Servicio de mensajería y enlace directo con WhatsApp para CRM de La Burbuja de Milo
 */

/**
 * Limpia y normaliza el número de teléfono para WhatsApp
 * @param {string} phone 
 * @returns {string} Teléfono con formato numérico internacional (default Colombia/57 si tiene 10 dígitos)
 */
export function normalizePhone(phone = '') {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 10 && !cleaned.startsWith('57')) {
    cleaned = `57${cleaned}`; // Prefijo por defecto para CO si aplica
  }
  return cleaned;
}

/**
 * Genera el enlace wa.me para abrir la conversación en WhatsApp con mensaje prediseñado
 */
export function generateWhatsAppUrl({ phone, message }) {
  const cleanNum = normalizePhone(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanNum}?text=${encodedText}`;
}

/**
 * Plantillas rápidas de mensajes para el CRM
 */
export const WhatsAppTemplates = {
  confirmacionCita: ({ clienteNombre, servicio, fecha, hora }) => 
    `¡Hola ${clienteNombre}! ✨ Te confirmamos tu cita para *${servicio}* en La Burbuja de Milo el próximo *${fecha}* a las *${hora}*.\n\nLlega 10 minutos antes. Si es facial, asiste con el rostro limpio. ¡Te esperamos!`,

  recordatorioCita: ({ clienteNombre, servicio, fecha, hora }) =>
    `Hola ${clienteNombre} 💖, recordatorio de tu tratamiento de *${servicio}* en La Burbuja de Milo para el día *${fecha}* a las *${hora}*. ¿Confirmas tu asistencia?`,

  productoEnCamino: ({ clienteNombre, producto, fechaEstimada }) =>
    `¡Hola ${clienteNombre}! 📦 Te notificamos sobre tu reserva de *${producto}*. Su arribo está programado para el *${fechaEstimada}*. Te estaremos avisando apenas esté listo para entrega. ¡Gracias por confiar en La Burbuja de Milo! ✨`,

  seguimientoEstetico: ({ clienteNombre, tratamiento }) =>
    `¡Hola ${clienteNombre}! ¿Cómo te has sentido tras tu sesión de *${tratamiento}*? Recuerda la rutina que te dejamos en casa y escríbenos si tienes dudas.`
};
