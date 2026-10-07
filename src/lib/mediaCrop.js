import {
  CIRCLE_ZOOM_MAX,
  CIRCLE_ZOOM_MIN,
  clampCircleValue,
  normalizeRotate
} from './categoryCircles';

export function mediaCropKey(kind, id) {
  return `${kind}:${id}`;
}

export function normalizeMediaCrop(item = {}) {
  return {
    posX: clampCircleValue(item.posX, 0, 100, 50),
    posY: clampCircleValue(item.posY, 0, 100, 50),
    zoom: clampCircleValue(item.zoom, CIRCLE_ZOOM_MIN, CIRCLE_ZOOM_MAX, 1),
    flipX: Boolean(item.flipX),
    flipY: Boolean(item.flipY),
    rotate: normalizeRotate(item.rotate)
  };
}

export function withMediaCrop(item = {}) {
  return { ...item, ...normalizeMediaCrop(item) };
}

export function overlayMediaCrop(item = {}, packed) {
  return {
    ...item,
    ...normalizeMediaCrop({
      posX: item.posX ?? packed?.posX,
      posY: item.posY ?? packed?.posY,
      zoom: item.zoom ?? packed?.zoom,
      flipX: item.flipX ?? packed?.flipX,
      flipY: item.flipY ?? packed?.flipY,
      rotate: item.rotate ?? packed?.rotate
    })
  };
}

export function withMediaCrops(value = {}) {
  const src = value && typeof value === 'object' ? value : {};
  const crops = src.mediaCrops && typeof src.mediaCrops === 'object' && !Array.isArray(src.mediaCrops)
    ? src.mediaCrops
    : {};
  const next = {};
  Object.entries(crops).forEach(([key, crop]) => {
    if (!key) return;
    next[key] = normalizeMediaCrop(crop);
  });
  return next;
}

export function collectMediaCrops({ productos = [], servicios = [], blog = [] } = {}) {
  const crops = {};
  const collect = (kind, list) => {
    (Array.isArray(list) ? list : []).forEach((item) => {
      if (!item?.id) return;
      crops[mediaCropKey(kind, item.id)] = normalizeMediaCrop(item);
    });
  };
  collect('producto', productos);
  collect('servicio', servicios);
  collect('blog', blog);
  return crops;
}

export function applyMediaCrops(list, kind, crops = {}) {
  return (Array.isArray(list) ? list : []).map((item) => (
    overlayMediaCrop(item, crops[mediaCropKey(kind, item?.id)])
  ));
}

export function visualCropProps(item = {}, extra = {}) {
  const crop = normalizeMediaCrop(item);
  const imagen = item.imagen || extra.src || '';
  return {
    seed: extra.seed || item.id || item.seed || 'foto',
    src: imagen,
    posX: crop.posX,
    posY: crop.posY,
    zoom: crop.zoom,
    flipX: crop.flipX,
    flipY: crop.flipY,
    rotate: crop.rotate,
    focalCrop: extra.focalCrop ?? Boolean(imagen)
  };
}

export function mediaCropsHaveValues(crops) {
  return Boolean(crops && typeof crops === 'object' && Object.keys(crops).length);
}
