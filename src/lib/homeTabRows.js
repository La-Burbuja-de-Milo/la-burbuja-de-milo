import { CATEGORY_CIRCLE_ALIGNS, categoryRowClass } from './categoryCircles';

export const HOME_TAB_ALIGNS = CATEGORY_CIRCLE_ALIGNS;
export const tabRowClass = categoryRowClass;

export const DEFAULT_PRODUCT_TABS = [
  { id: 'bestsellers', label: 'Bestsellers' },
  { id: 'nuevos', label: 'New arrivals' },
  { id: 'camino', label: 'En camino' }
];

export const DEFAULT_PICKS_TABS = [
  { id: 'cabina', label: 'Featured top picks' },
  { id: 'valor', label: 'Value items' }
];

const FEATURED_CATEGORIAS = ['Diagnóstico', 'Facial', 'Corporal', 'Bienestar'];

function normalizeTabList(saved, defaults) {
  const list = Array.isArray(saved) ? saved : [];
  const byId = new Map(list.map((item) => [item?.id, item]));
  return defaults.map((item) => {
    const match = byId.get(item.id);
    const label = String(match?.label || item.label).trim();
    return { id: item.id, label: label || item.label };
  });
}

function normalizeAlign(value, fallback = 'center') {
  return HOME_TAB_ALIGNS.some((item) => item.id === value) ? value : fallback;
}

function textOr(value, fallback) {
  const next = String(value ?? '').trim();
  return next || fallback;
}

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item || '').trim()).filter(Boolean))].slice(0, 4);
}

export function normalizeHomeTabRow(value, defaults, fallbackAlign = 'center', extras = {}) {
  const src = value && typeof value === 'object' ? value : {};
  const row = {
    align: normalizeAlign(src.align, fallbackAlign),
    tabs: normalizeTabList(src.tabs, defaults),
    actionLabel: textOr(src.actionLabel, extras.actionLabel || 'Ver más'),
    actionTo: textOr(src.actionTo, extras.actionTo || '/')
  };
  if (extras.withServicios) {
    row.servicioIds = normalizeIds(src.servicioIds);
  }
  return row;
}

export function withHomeTabRows(value = {}) {
  const raw = value && typeof value === 'object' ? value : {};
  const src = raw.homeTabRows && typeof raw.homeTabRows === 'object'
    ? raw.homeTabRows
    : raw;
  return {
    products: normalizeHomeTabRow(src.products, DEFAULT_PRODUCT_TABS, 'center', {
      actionLabel: 'Shop all',
      actionTo: '/tienda'
    }),
    picks: normalizeHomeTabRow(src.picks, DEFAULT_PICKS_TABS, 'center', {
      actionLabel: 'Ver agenda',
      actionTo: '/citas',
      withServicios: true
    })
  };
}

export function pickFeaturedServicios(servicios = [], ids = []) {
  const list = Array.isArray(servicios) ? servicios : [];
  const byId = new Map(list.map((item) => [item.id, item]));
  const picked = (Array.isArray(ids) ? ids : []).map((id) => byId.get(id)).filter(Boolean);
  if (picked.length) return picked.slice(0, 4);
  const featured = [];
  FEATURED_CATEGORIAS.forEach((categoria) => {
    const match = list.find((item) => item.categoria === categoria && !featured.includes(item));
    if (match) featured.push(match);
  });
  list.forEach((item) => {
    if (featured.length >= 4 || featured.includes(item)) return;
    featured.push(item);
  });
  return featured.slice(0, 4);
}

export function homeTabRowActionClass(align) {
  if (align === 'center') return 'self-center sm:self-auto';
  if (align === 'end') return 'self-end sm:self-auto';
  return 'self-start sm:self-auto';
}
