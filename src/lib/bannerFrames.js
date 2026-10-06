import {
  CIRCLE_ZOOM_MAX,
  CIRCLE_ZOOM_MIN,
  clampCircleValue,
  normalizeRotate
} from './categoryCircles';
import { isPngSource } from './imageSrc';

export const BANNER_STAGE_CLASS = 'relative h-full w-full min-h-0 overflow-hidden';
export const BANNER_PHOTO_SLOT_CLASS =
  'relative h-[48vh] w-full overflow-hidden lg:h-[72vh]';
export const BANNER_MAT_DEFAULT = 'bg-[#efeae2]';
export const BANNER_MAT_PNG = 'bg-white';

export function bannerMatClass(bannerOrFotos) {
  const fotos = Array.isArray(bannerOrFotos) ? bannerOrFotos : bannerFotos(bannerOrFotos);
  return fotos.some((item) => isPngSource(item?.src)) ? BANNER_MAT_PNG : BANNER_MAT_DEFAULT;
}
export const BANNER_HERO_MAX_WIDTH = 1440;
export const BANNER_HERO_LG = 1024;
export const BANNER_PHOTO_MOBILE_VH = 0.48;
export const BANNER_PHOTO_DESKTOP_VH = 0.72;

export function measureBannerPhotoBox(view = typeof window === 'undefined' ? null : window) {
  const vw = view?.innerWidth || 1280;
  const vh = view?.innerHeight || 800;
  const desktop = vw >= BANNER_HERO_LG;
  return {
    width: desktop ? Math.min(vw, BANNER_HERO_MAX_WIDTH) / 2 : vw,
    height: vh * (desktop ? BANNER_PHOTO_DESKTOP_VH : BANNER_PHOTO_MOBILE_VH),
    desktop
  };
}

export const BANNER_LAYOUTS = [
  { id: 'unica', label: 'Una foto', hint: 'Portaretrato a sangre', slots: 1 },
  { id: 'paralela', label: 'Paralela', hint: 'Dos fotos lado a lado', slots: 2 },
  { id: 'asimetrica', label: 'Asimétrica', hint: 'Ancha y estrecha', slots: 2 },
  { id: 'vertical', label: 'Vertical', hint: 'Dos fotos apiladas', slots: 2 },
  { id: 'diagonal', label: 'Diagonal', hint: 'Corte de esquina a esquina', slots: 2 },
  { id: 'diagonal-inv', label: 'Diagonal inversa', hint: 'Corte al otro sentido', slots: 2 },
  { id: 'trio', label: 'Tríptico', hint: 'Una grande y dos pequeñas', slots: 3 },
  { id: 'columnas', label: 'Columnas', hint: 'Tres franjas verticales', slots: 3 },
  { id: 'mosaico', label: 'Mosaico', hint: 'Cuatro recuadros', slots: 4 },
  { id: 'escalon', label: 'Escalonada', hint: 'Marcos superpuestos', slots: 3 },
  { id: 'personalizado', label: 'A medida', hint: 'Las fotos que quieras', slots: 0 }
];

export const BANNER_ESTILOS = [
  { id: 'lleno', label: 'A sangre' },
  { id: 'galeria', label: 'Galería' },
  { id: 'polaroid', label: 'Polaroid' },
  { id: 'filo', label: 'Filo' },
  { id: 'dorado', label: 'Dorado' },
  { id: 'redondeado', label: 'Redondeado' },
  { id: 'sombra', label: 'Sombra' }
];

export function findBannerLayout(id) {
  return BANNER_LAYOUTS.find((item) => item.id === id) || BANNER_LAYOUTS[0];
}

export function findBannerEstilo(id) {
  return BANNER_ESTILOS.find((item) => item.id === id) || BANNER_ESTILOS[0];
}

export const BANNER_TRANSICIONES = [
  { id: 'fundido', label: 'Fundido', hint: 'Aparece suavemente' },
  { id: 'deslizar', label: 'Deslizar', hint: 'Entra desde la derecha' },
  { id: 'subir', label: 'Subir', hint: 'Entra desde abajo' },
  { id: 'zoom', label: 'Zoom', hint: 'Se acerca al recuadro' },
  { id: 'cascada', label: 'Cascada', hint: 'Las fotos entran una a una' },
  { id: 'revelar', label: 'Revelar', hint: 'Se descubre de lado a lado' },
  { id: 'instantaneo', label: 'Instantáneo', hint: 'Sin animación' }
];

export function findBannerTransicion(id) {
  return BANNER_TRANSICIONES.find((item) => item.id === id) || BANNER_TRANSICIONES[0];
}

export function bannerFotoSrc(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return String(item.src || item.imagen || '');
}

export function normalizeBannerFoto(item) {
  const src = bannerFotoSrc(item);
  const raw = item && typeof item === 'object' ? item : {};
  return {
    id: raw.id || '',
    src,
    posX: clampCircleValue(raw.posX, 0, 100, 50),
    posY: clampCircleValue(raw.posY, 0, 100, 50),
    zoom: clampCircleValue(raw.zoom, CIRCLE_ZOOM_MIN, CIRCLE_ZOOM_MAX, 1),
    flipX: Boolean(raw.flipX),
    flipY: Boolean(raw.flipY),
    rotate: normalizeRotate(raw.rotate)
  };
}

export function cloneBannerFoto(item) {
  if (typeof item === 'string') return item;
  if (!item || typeof item !== 'object') return item;
  return { ...item };
}

export function cloneBanner(banner = {}) {
  if (!banner || typeof banner !== 'object') return {};
  const imagenes = Array.isArray(banner.imagenes)
    ? banner.imagenes.map(cloneBannerFoto)
    : [];
  return {
    ...banner,
    imagenes,
    imagen: typeof banner.imagen === 'string' ? banner.imagen : (banner.imagen || '')
  };
}

export function bannerDraft(banner = {}) {
  const cloned = cloneBanner(banner);
  const imagenes = (cloned.imagenes.length ? cloned.imagenes : (cloned.imagen ? [cloned.imagen] : []))
    .map((item, index) => {
      const foto = normalizeBannerFoto(item);
      const sourceId = typeof item === 'object' && item?.id ? item.id : foto.id;
      return {
        ...foto,
        id: sourceId || `${cloned.id || 'nuevo'}-foto-${index}`
      };
    });
  return {
    tag: cloned.tag || '',
    titulo: cloned.titulo || '',
    descripcion: cloned.descripcion || '',
    botonTexto: cloned.botonTexto || 'Agendar cita',
    botonEnlace: cloned.botonEnlace || '/citas',
    botonSecundarioTexto: cloned.botonSecundarioTexto || 'Ver tienda',
    botonSecundarioEnlace: cloned.botonSecundarioEnlace || '/tienda',
    activo: cloned.activo !== false,
    imagen: cloned.imagen || '',
    imagenes: imagenes.length ? imagenes : [{ ...normalizeBannerFoto(''), id: `${cloned.id || 'nuevo'}-foto-0` }],
    marcoLayout: cloned.marcoLayout || '',
    marcoEstilo: cloned.marcoEstilo || '',
    transicion: cloned.transicion || '',
    gradiente: cloned.gradiente || ''
  };
}

export function bannerPersistPayload(banner = {}) {
  const cloned = cloneBanner(banner);
  const imagenes = bannerFotos(cloned).map((foto, index) => ({
    ...foto,
    id: foto.id || `${cloned.id || 'banner'}-foto-${index}`
  }));
  return {
    tag: cloned.tag || '',
    titulo: cloned.titulo || '',
    descripcion: cloned.descripcion || '',
    botonTexto: cloned.botonTexto || '',
    botonEnlace: cloned.botonEnlace || '',
    botonSecundarioTexto: cloned.botonSecundarioTexto || '',
    botonSecundarioEnlace: cloned.botonSecundarioEnlace || '',
    activo: cloned.activo !== false,
    imagenes,
    imagen: imagenes[0]?.src || '',
    marcoLayout: cloned.marcoLayout || 'unica',
    marcoEstilo: cloned.marcoEstilo || 'lleno',
    transicion: cloned.transicion || 'fundido',
    gradiente: cloned.gradiente || ''
  };
}

export function bannerFotos(banner) {
  const list = Array.isArray(banner?.imagenes) ? banner.imagenes : [];
  const raw = list.length ? list : (banner?.imagen ? [banner.imagen] : []);
  return raw.map(normalizeBannerFoto).filter((item) => item.src);
}

export function moveBannerFoto(fotos, fromIndex, toIndex) {
  const list = Array.isArray(fotos) ? [...fotos] : [];
  const from = Math.max(0, Math.min(list.length - 1, Number(fromIndex)));
  const to = Math.max(0, Math.min(list.length - 1, Number(toIndex)));
  if (from === to) return list;
  const [item] = list.splice(from, 1);
  list.splice(to, 0, item);
  return list;
}

export function withBannerFrames(banner) {
  if (!banner) return banner;
  const imagenes = bannerFotos(banner);
  return {
    ...banner,
    imagen: imagenes[0]?.src || '',
    imagenes,
    marcoLayout: banner.marcoLayout || 'unica',
    marcoEstilo: banner.marcoEstilo || 'lleno',
    transicion: banner.transicion || 'fundido'
  };
}

export function slotCountForLayout(layoutId, currentCount = 0) {
  const layout = findBannerLayout(layoutId);
  if (layout.id === 'personalizado') {
    return Math.min(6, Math.max(2, Number(currentCount) || 2));
  }
  return layout.slots;
}
