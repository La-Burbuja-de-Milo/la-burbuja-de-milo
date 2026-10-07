export const DEFAULT_TIENDA_PAGE = {
  title: 'Tienda',
  description: 'Salud estética para rostro, cuerpo y bienestar. Marcas como fuXion, Riman y fórmulas de cabina.'
};

function textOr(value, fallback) {
  const next = String(value ?? '').trim();
  return next || fallback;
}

export function withTiendaPage(value = {}) {
  const raw = value && typeof value === 'object' ? value : {};
  const src = raw.tiendaPage && typeof raw.tiendaPage === 'object'
    ? raw.tiendaPage
    : raw;
  return {
    title: textOr(src.title, DEFAULT_TIENDA_PAGE.title),
    description: textOr(src.description, DEFAULT_TIENDA_PAGE.description)
  };
}
