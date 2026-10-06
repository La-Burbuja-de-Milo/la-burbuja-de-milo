export const COP_CODE = 'COP';

export function formatCOP(value) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

export function toCopAmount(value, moneda) {
  const amount = Number(value) || 0;
  if (String(moneda || '').toUpperCase() === COP_CODE && amount >= 1000) return amount;
  if (amount >= 1000) return amount;
  return Math.round(amount * 4000);
}
