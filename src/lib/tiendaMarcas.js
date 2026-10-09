import {
  CATEGORY_CIRCLE_ALIGNS,
  CIRCLE_ZOOM_MAX,
  CIRCLE_ZOOM_MIN,
  categoryRowClass,
  clampCircleValue,
  normalizeRotate
} from './categoryCircles';

export { CATEGORY_CIRCLE_ALIGNS as TIENDA_MARCA_ALIGNS, categoryRowClass };

function seedFor(id) {
  return `marca-${id}`;
}

function slugifyMarca(value) {
  const slug = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `marca-${Date.now()}`;
}

export function normalizeTiendaMarca(item, catalogItem) {
  const id = item?.id || catalogItem?.id || '';
  const label = String(item?.label || catalogItem?.nombre || '').trim();
  return {
    id,
    label,
    seed: item?.seed || seedFor(id),
    imagen: item?.imagen || '',
    posX: clampCircleValue(item?.posX, 0, 100, 50),
    posY: clampCircleValue(item?.posY, 0, 100, 50),
    zoom: clampCircleValue(item?.zoom, CIRCLE_ZOOM_MIN, CIRCLE_ZOOM_MAX, 1),
    flipX: Boolean(item?.flipX),
    flipY: Boolean(item?.flipY),
    rotate: normalizeRotate(item?.rotate)
  };
}

export function createTiendaMarca(label, existing = []) {
  const nombre = String(label || '').trim() || 'Nueva marca';
  const used = new Set((Array.isArray(existing) ? existing : []).map((item) => item?.id).filter(Boolean));
  let id = slugifyMarca(nombre);
  if (used.has(id)) id = `${id}-${Date.now()}`;
  return normalizeTiendaMarca({ id, label: nombre });
}

export function withTiendaMarcas(value = {}, catalog = []) {
  const raw = value && typeof value === 'object' ? value : {};
  const packed = raw.tiendaMarcas && typeof raw.tiendaMarcas === 'object'
    ? raw.tiendaMarcas
    : raw;
  const saved = Array.isArray(packed.circles)
    ? packed.circles
    : (Array.isArray(packed) ? packed : []);
  const savedDefined = saved.some((item) => item?.id);
  const catalogList = Array.isArray(catalog) && catalog.length
    ? catalog.filter((item) => item?.id)
    : [];
  const byCatalog = new Map(catalogList.map((item) => [item.id, item]));
  const used = new Set();
  const circles = [];

  saved.forEach((entry) => {
    if (!entry?.id || used.has(entry.id)) return;
    used.add(entry.id);
    circles.push(normalizeTiendaMarca(entry, byCatalog.get(entry.id)));
  });

  if (!savedDefined) {
    catalogList.forEach((item) => {
      if (used.has(item.id)) return;
      used.add(item.id);
      circles.push(normalizeTiendaMarca(saved.find((entry) => entry.id === item.id), item));
    });
  }

  const align = CATEGORY_CIRCLE_ALIGNS.some((item) => item.id === packed.align)
    ? packed.align
    : 'start';
  return { circles, align };
}

export function tiendaMarcasHavePhotos(form) {
  return (form?.circles || []).some((item) => String(item?.imagen || '').length > 20);
}

export function tiendaMarcasHaveInlinePhotos(form) {
  return (form?.circles || []).some((item) => {
    const src = String(item?.imagen || '');
    return src.startsWith('data:') || src.startsWith('blob:');
  });
}
