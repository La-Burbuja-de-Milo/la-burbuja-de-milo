export const DEFAULT_CATEGORY_CIRCLES = [
  { id: 'facial', label: 'Facial', to: '/tienda?pasillo=skincare', seed: 'cat-skin' },
  { id: 'corporal', label: 'Corporal', to: '/tienda?pasillo=corporal', seed: 'cat-body' },
  { id: 'bienestar', label: 'Bienestar', to: '/tienda?pasillo=bienestar', seed: 'cat-well' },
  { id: 'cabina', label: 'Cabina', to: '/citas', seed: 'cat-cabina' },
  { id: 'capilar', label: 'Capilar', to: '/tienda?pasillo=capilar', seed: 'cat-hair' },
  { id: 'marcas', label: 'Marcas', to: '/tienda?marca=fuxion', seed: 'cat-brands' }
];

export const CATEGORY_CIRCLE_ALIGNS = [
  { id: 'start', label: 'Izquierda' },
  { id: 'center', label: 'Centro' },
  { id: 'end', label: 'Derecha' },
  { id: 'evenly', label: 'Distribuir' }
];

export const CIRCLE_ZOOM_MIN = 1;
export const CIRCLE_ZOOM_MAX = 3.5;

export function normalizeRotate(value) {
  const next = ((Number(value) || 0) % 360 + 360) % 360;
  return next === 90 || next === 180 || next === 270 ? next : 0;
}

export function circleImageTransform(circle = {}) {
  const sx = circle.flipX ? -1 : 1;
  const sy = circle.flipY ? -1 : 1;
  return `rotate(${normalizeRotate(circle.rotate)}deg) scale(${sx}, ${sy})`;
}

export function mapPointerDelta(dx, dy, circle = {}) {
  const rotate = normalizeRotate(circle.rotate);
  let x = dx;
  let y = dy;
  if (rotate === 90) {
    x = dy;
    y = -dx;
  } else if (rotate === 180) {
    x = -dx;
    y = -dy;
  } else if (rotate === 270) {
    x = -dy;
    y = dx;
  }
  if (circle.flipX) x = -x;
  if (circle.flipY) y = -y;
  return { dx: x, dy: y };
}

export function clampCircleValue(value, min, max, fallback) {
  const next = Number(value);
  if (!Number.isFinite(next)) return fallback;
  return Math.min(max, Math.max(min, next));
}

export function imageCoverSize(ratio, zoom = 1, containerRatio = 1) {
  const scale = clampCircleValue(zoom, CIRCLE_ZOOM_MIN, CIRCLE_ZOOM_MAX, 1);
  const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
  const box = Number.isFinite(containerRatio) && containerRatio > 0 ? containerRatio : 1;
  return {
    widthPct: Math.max(scale, scale * (safeRatio / box)) * 100,
    heightPct: Math.max(scale, scale * (box / safeRatio)) * 100
  };
}

export function imageCropOffset(posX, posY, widthPct, heightPct) {
  const x = clampCircleValue(posX, 0, 100, 50);
  const y = clampCircleValue(posY, 0, 100, 50);
  const overflowX = Math.max(0, widthPct - 100);
  const overflowY = Math.max(0, heightPct - 100);
  return {
    leftPct: overflowX ? -(x / 100) * overflowX : 0,
    topPct: overflowY ? -(y / 100) * overflowY : 0
  };
}

export function panCropPosition({ posX, posY, dxPct, dyPct, widthPct, heightPct }) {
  const overflowX = Math.max(0, widthPct - 100);
  const overflowY = Math.max(0, heightPct - 100);
  const start = imageCropOffset(posX, posY, widthPct, heightPct);
  const leftPct = start.leftPct + dxPct;
  const topPct = start.topPct + dyPct;
  return {
    posX: overflowX ? clampCircleValue((-leftPct / overflowX) * 100, 0, 100, 50) : 50,
    posY: overflowY ? clampCircleValue((-topPct / overflowY) * 100, 0, 100, 50) : 50
  };
}

export function normalizeSiteLogo(value) {
  const raw = typeof value === 'string' ? { imagen: value } : (value && typeof value === 'object' ? value : {});
  return {
    imagen: raw.imagen || '',
    posX: clampCircleValue(raw.posX, 0, 100, 50),
    posY: clampCircleValue(raw.posY, 0, 100, 50),
    zoom: clampCircleValue(raw.zoom, CIRCLE_ZOOM_MIN, CIRCLE_ZOOM_MAX, 1),
    flipX: Boolean(raw.flipX),
    flipY: Boolean(raw.flipY),
    rotate: normalizeRotate(raw.rotate)
  };
}

export function normalizeCategoryCircle(item, fallback) {
  const base = fallback || DEFAULT_CATEGORY_CIRCLES[0];
  return {
    id: base.id,
    label: item?.label || base.label,
    to: item?.to || base.to,
    seed: base.seed,
    imagen: item?.imagen || '',
    posX: clampCircleValue(item?.posX, 0, 100, 50),
    posY: clampCircleValue(item?.posY, 0, 100, 50),
    zoom: clampCircleValue(item?.zoom, CIRCLE_ZOOM_MIN, CIRCLE_ZOOM_MAX, 1),
    flipX: Boolean(item?.flipX),
    flipY: Boolean(item?.flipY),
    rotate: normalizeRotate(item?.rotate)
  };
}

export function withCategoryCircles(ajustes = {}) {
  const saved = Array.isArray(ajustes.categoryCircles)
    ? ajustes.categoryCircles
    : (Array.isArray(ajustes.categoryCircles?.circles) ? ajustes.categoryCircles.circles : []);
  const byId = new Map(DEFAULT_CATEGORY_CIRCLES.map((item) => [item.id, item]));
  const used = new Set();
  const circles = [];
  saved.forEach((entry) => {
    const base = byId.get(entry?.id);
    if (!base || used.has(base.id)) return;
    used.add(base.id);
    circles.push(normalizeCategoryCircle(entry, base));
  });
  DEFAULT_CATEGORY_CIRCLES.forEach((item) => {
    if (used.has(item.id)) return;
    circles.push(normalizeCategoryCircle(saved.find((entry) => entry.id === item.id), item));
  });
  const align = CATEGORY_CIRCLE_ALIGNS.some((item) => item.id === ajustes.categoryCirclesAlign)
    ? ajustes.categoryCirclesAlign
    : 'start';
  return { circles, align };
}

export function moveCircle(circles, fromId, toIndex) {
  const list = Array.isArray(circles) ? circles : [];
  const from = list.findIndex((item) => item.id === fromId);
  if (from < 0) return list;
  const nextIndex = Math.max(0, Math.min(list.length - 1, Number(toIndex)));
  if (from === nextIndex) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

export function categoryCircleImageStyle(circle, ratio, containerRatio = 1) {
  const zoom = clampCircleValue(circle?.zoom, CIRCLE_ZOOM_MIN, CIRCLE_ZOOM_MAX, 1);
  const posX = clampCircleValue(circle?.posX, 0, 100, 50);
  const posY = clampCircleValue(circle?.posY, 0, 100, 50);
  const box = Number.isFinite(containerRatio) && containerRatio > 0 ? containerRatio : 1;
  if (!ratio) {
    return {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: `${posX}% ${posY}%`
    };
  }
  const { widthPct, heightPct } = imageCoverSize(ratio, zoom, box);
  const { leftPct, topPct } = imageCropOffset(posX, posY, widthPct, heightPct);
  const imageWider = ratio >= box;
  return {
    position: 'absolute',
    width: imageWider ? `${widthPct}%` : 'auto',
    height: imageWider ? 'auto' : `${heightPct}%`,
    aspectRatio: String(ratio),
    maxWidth: 'none',
    maxHeight: 'none',
    objectFit: 'cover',
    left: `${leftPct}%`,
    top: `${topPct}%`
  };
}

export function categoryRowClass(align) {
  if (align === 'center') return 'justify-center';
  if (align === 'end') return 'justify-end';
  if (align === 'evenly') return 'justify-evenly';
  return 'justify-start';
}
