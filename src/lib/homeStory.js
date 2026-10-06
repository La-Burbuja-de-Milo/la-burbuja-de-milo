import {
  CIRCLE_ZOOM_MAX,
  CIRCLE_ZOOM_MIN,
  clampCircleValue,
  normalizeRotate
} from './categoryCircles';

export const DEFAULT_HOME_PASILLOS = {
  title: 'Pasillos de la casa',
  actionLabel: 'Ver tienda',
  actionTo: '/tienda',
  items: [
    {
      id: 'facial',
      title: 'Estética facial',
      copy: 'Limpieza, sérums, K-beauty Riman y protocolos de cabina para el rostro.',
      to: '/tienda?pasillo=skincare',
      seed: 'brand-skin'
    },
    {
      id: 'corporal',
      title: 'Estética corporal',
      copy: 'Reafirmación, drenaje, aceites de masaje y cuidado corporal Botalab.',
      to: '/tienda?pasillo=corporal',
      seed: 'brand-body'
    },
    {
      id: 'bienestar',
      title: 'Bienestar y nutrición',
      copy: 'fuXion, Lifening y nutricosméticos para sostener resultados desde adentro.',
      to: '/tienda?pasillo=bienestar',
      seed: 'brand-well'
    }
  ]
};

export const DEFAULT_HOME_MARCAS = {
  title: 'Marcas en vitrina',
  actionLabel: 'Ver tienda',
  actionTo: '/tienda',
  items: [
    {
      id: 'fuxion',
      title: 'fuXion',
      copy: 'Nutrición funcional para energía, tránsito y vitalidad. Cafezzino, Prunex1 y VitaXion entran al protocolo de bienestar.',
      to: '/tienda?marca=fuxion',
      cta: 'Shop now',
      seed: 'brand-fuxion'
    },
    {
      id: 'riman',
      title: 'Riman',
      copy: 'K-beauty y wellness: Incellderm para el rostro, Botalab para el cuerpo y Lifening para colágeno de adentro hacia afuera.',
      to: '/tienda?marca=riman',
      cta: 'Shop now',
      seed: 'brand-riman'
    }
  ]
};

export const DEFAULT_HOME_ESTETICA = {
  tag: 'Estética y bienestar',
  title: 'Un centro, cuatro capas',
  copy: 'Facial, corporal, bienestar y tienda. Elegimos marcas como fuXion y Riman según tu valoración, no por catálogo genérico.'
};

function textOr(value, fallback) {
  const next = String(value ?? '').trim();
  return next || fallback;
}

function normalizeCard(item, fallback) {
  const src = item && typeof item === 'object' ? item : {};
  return {
    id: fallback.id,
    title: textOr(src.title, fallback.title),
    copy: String(src.copy ?? fallback.copy),
    to: textOr(src.to, fallback.to),
    cta: String(src.cta ?? fallback.cta ?? '').trim(),
    seed: fallback.seed,
    imagen: src.imagen || '',
    posX: clampCircleValue(src.posX, 0, 100, 50),
    posY: clampCircleValue(src.posY, 0, 100, 50),
    zoom: clampCircleValue(src.zoom, CIRCLE_ZOOM_MIN, CIRCLE_ZOOM_MAX, 1),
    flipX: Boolean(src.flipX),
    flipY: Boolean(src.flipY),
    rotate: normalizeRotate(src.rotate)
  };
}

function normalizeGroup(value, defaults) {
  const src = value && typeof value === 'object' ? value : {};
  const list = Array.isArray(src.items) ? src.items : [];
  const byId = new Map(list.map((item) => [item?.id, item]));
  return {
    title: textOr(src.title, defaults.title),
    actionLabel: textOr(src.actionLabel, defaults.actionLabel),
    actionTo: textOr(src.actionTo, defaults.actionTo),
    items: defaults.items.map((item) => normalizeCard(byId.get(item.id), item))
  };
}

function normalizeEstetica(value) {
  const src = value && typeof value === 'object' ? value : {};
  return {
    tag: textOr(src.tag, DEFAULT_HOME_ESTETICA.tag),
    title: textOr(src.title, DEFAULT_HOME_ESTETICA.title),
    copy: String(src.copy ?? DEFAULT_HOME_ESTETICA.copy)
  };
}

export function withHomeStory(value = {}) {
  const raw = value && typeof value === 'object' ? value : {};
  const src = raw.homeStory && typeof raw.homeStory === 'object'
    ? raw.homeStory
    : raw;
  return {
    pasillos: normalizeGroup(src.pasillos, DEFAULT_HOME_PASILLOS),
    marcas: normalizeGroup(src.marcas, DEFAULT_HOME_MARCAS),
    estetica: normalizeEstetica(src.estetica)
  };
}

function storyCards(story) {
  const src = withHomeStory(story);
  return [...(src.pasillos.items || []), ...(src.marcas.items || [])];
}

export function storyCardsHavePhotos(story) {
  return storyCards(story).some((item) => String(item?.imagen || '').trim());
}

export function storyCardsHaveInlinePhotos(story) {
  return storyCards(story).some((item) => {
    const src = String(item?.imagen || '');
    return src.startsWith('data:') || src.startsWith('blob:');
  });
}

export function storyCardVisualProps(item = {}) {
  const imagen = item.imagen || '';
  return {
    seed: item.seed || item.id || 'story',
    src: imagen,
    posX: item.posX,
    posY: item.posY,
    zoom: item.zoom,
    flipX: item.flipX,
    flipY: item.flipY,
    rotate: item.rotate,
    focalCrop: Boolean(imagen)
  };
}
