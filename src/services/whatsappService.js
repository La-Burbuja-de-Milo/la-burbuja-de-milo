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
    `¡Hola ${clienteNombre}! ✨ Te confirmamos tu cita para *${servicio}* en La Burbuja de Milo el próximo *${fecha}* a las *${hora}*.\n\nPor favor asiste con el rostro limpio y 10 minutos antes. ¡Te esperamos para consentir tu piel! 🌸`,

  recordatorioCita: ({ clienteNombre, servicio, fecha, hora }) =>
    `Hola ${clienteNombre} 💖, recordatorio de tu tratamiento de *${servicio}* en La Burbuja de Milo para el día *${fecha}* a las *${hora}*. ¿Confirmas tu asistencia?`,

  productoEnCamino: ({ clienteNombre, producto, fechaEstimada }) =>
    `¡Hola ${clienteNombre}! 📦 Te notificamos sobre tu reserva de *${producto}*. Su arribo está programado para el *${fechaEstimada}*. Te estaremos avisando apenas esté listo para entrega. ¡Gracias por confiar en La Burbuja de Milo! ✨`,

  seguimientoEstetico: ({ clienteNombre, tratamiento }) =>
    `¡Hola ${clienteNombre}! 🧖‍♀️ ¿Cómo ha respondido tu piel tras tu sesión de *${tratamiento}*? Recuerda mantener una buena hidratación y aplicar tu protector solar cada 3-4 horas. Quedamos atentas a cualquier duda.`
};
