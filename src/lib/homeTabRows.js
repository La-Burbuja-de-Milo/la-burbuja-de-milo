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

export function normalizeHomeTabRow(value, defaults, fallbackAlign = 'center') {
  const src = value && typeof value === 'object' ? value : {};
  return {
    align: normalizeAlign(src.align, fallbackAlign),
    tabs: normalizeTabList(src.tabs, defaults)
  };
}

export function withHomeTabRows(value = {}) {
  const raw = value && typeof value === 'object' ? value : {};
  const src = raw.homeTabRows && typeof raw.homeTabRows === 'object'
    ? raw.homeTabRows
    : raw;
  return {
    products: normalizeHomeTabRow(src.products, DEFAULT_PRODUCT_TABS, 'center'),
    picks: normalizeHomeTabRow(src.picks, DEFAULT_PICKS_TABS, 'center')
  };
}

export function homeTabRowActionClass(align) {
  if (align === 'center') return 'self-center sm:self-auto';
  if (align === 'end') return 'self-end sm:self-auto';
  return 'self-start sm:self-auto';
}
