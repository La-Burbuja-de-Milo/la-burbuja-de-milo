// /services/validator.js
// Lógica del "Semáforo Ético" para la validación de ingredientes

// Blacklist de ejemplo (la expandiremos más adelante con el conocimiento de tu esposa)
const INGREDIENTES_PROHIBIDOS = [
  'paraben',      // Coincide con methylparaben, propylparaben, etc.
  'fragrance',    // Fragancias sintéticas
  'parfum',       // Perfume
  'sls',          // Sodium Lauryl Sulfate
  'sles',         // Sodium Laureth Sulfate
  'phthalate',    // Ftalatos
];

/**
 * Valida un array de ingredientes contra una blacklist.
 * Espera recibir un array de strings (gracias a la estructura JSONB / TEXT[] en DB).
 * 
 * @param {string[]} ingredientes - Array de ingredientes del producto.
 * @returns {Object} - Resultado de la evaluación.
 */
export function evaluarSemaforoEtico(ingredientes) {
  if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
    return {
      estado: 'GRIS', // Sin datos
      mensaje: 'No se proporcionaron ingredientes para evaluar.',
      alertas: []
    };
  }

  const alertas = [];

  // Normalizamos y evaluamos cada ingrediente
  ingredientes.forEach(ingrediente => {
    const ingNormalizado = ingrediente.toLowerCase().trim();
    
    // Verificamos si algún término de la blacklist está presente en el ingrediente
    INGREDIENTES_PROHIBIDOS.forEach(prohibido => {
      if (ingNormalizado.includes(prohibido.toLowerCase())) {
        alertas.push({
          ingrediente_original: ingrediente,
          motivo: `Contiene componente restringido: ${prohibido}`
        });
      }
    });
  });

  if (alertas.length > 0) {
    return {
      estado: 'ROJO', // Contiene ingredientes prohibidos
      mensaje: 'El producto no cumple con el estándar ético.',
      alertas
    };
  }

  return {
    estado: 'VERDE', // Seguro
    mensaje: 'El producto es seguro y cumple con los estándares éticos.',
    alertas: []
  };
}
