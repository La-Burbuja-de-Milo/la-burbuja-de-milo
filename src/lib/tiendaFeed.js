import { CIRCLE_ZOOM_MAX, CIRCLE_ZOOM_MIN, clampCircleValue } from './categoryCircles';
import { isPngSource } from './imageSrc';
import { productInPasillo } from './pasillos';

export const TIENDA_FEED_ROWS = 4;
export const TIENDA_FEED_INTERVAL = TIENDA_FEED_ROWS;
export const TIENDA_HERO_RATIO = 16 / 9;
export const TIENDA_BANNER_FRAME = 'overflow-hidden rounded-xl';
export const TIENDA_BANNER_HEIGHT = 'h-[min(46vw,15rem)] sm:h-[min(34vw,17rem)] lg:h-[min(22vw,18rem)] max-h-[min(70vw,24rem)]';

export const TIENDA_INSERT_TYPES = [
  { id: 'random', label: 'Productos al azar' },
  { id: 'circles', label: 'Círculos personalizados' },
  { id: 'pasillos', label: 'Pasillos' },
  { id: 'peek', label: 'Banner' }
];

export const TIENDA_HERO_SHAPES = [
  { id: 'islas', label: 'Islas superpuestas' },
  { id: 'organico', label: 'Órgano irregular' },
  { id: 'diagonal', label: 'Corte diagonal' },
  { id: 'cinta', label: 'Cinta redonda' }
];

export const TIENDA_SUGGEST_SHAPES = [
  { id: 'circle', label: 'Círculo', className: 'rounded-full' },
  { id: 'squircle', label: 'Suave', className: 'rounded-[1.7rem]' },
  { id: 'oval', label: 'Óvalo', className: 'rounded-full', frame: 'aspect-[3/4] w-[3.35rem] sm:w-[3.85rem]' },
  { id: 'soft', label: 'Orgánico', className: 'rounded-[2.1rem_0.65rem_2.1rem_0.85rem]' }
];

function trim(value) {
  return String(value ?? '').trim();
}

const SMALL_WORDS = new Set(['de', 'del', 'y', 'o', 'en', 'la', 'el', 'los', 'las', 'un', 'una', 'a', 'al']);

export function toCapitalCase(value) {
  const words = trim(value).split(/\s+/).filter(Boolean);
  return words.map((word, index) => {
    const lower = word.toLocaleLowerCase('es');
    if (index > 0 && SMALL_WORDS.has(lower)) return lower;
    return lower.charAt(0).toLocaleUpperCase('es') + lower.slice(1);
  }).join(' ');
}

export function tiendaFeedColumns(width = typeof window === 'undefined' ? 0 : window.innerWidth) {
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  return 2;
}

export function tiendaFeedStep(rows = TIENDA_FEED_ROWS, columns = 2) {
  return Math.max(2, Number(rows) || TIENDA_FEED_ROWS) * Math.max(2, Number(columns) || 2);
}

function normalizeFeedRows(value) {
  const n = Math.round(Number(value) || TIENDA_FEED_ROWS);
  if (n === 8) return TIENDA_FEED_ROWS;
  return Math.max(2, Math.min(8, n));
}

function num(value, fallback, min, max) {
  return clampCircleValue(value, min, max, fallback);
}

function cropOf(item = {}) {
  return {
    posX: num(item.posX, 50, 0, 100),
    posY: num(item.posY, 50, 0, 100),
    zoom: num(item.zoom, 1, CIRCLE_ZOOM_MIN, CIRCLE_ZOOM_MAX),
    flipX: Boolean(item.flipX),
    flipY: Boolean(item.flipY),
    rotate: ((Number(item.rotate) || 0) % 360 + 360) % 360
  };
}

export function tiendaFeedPhotoStyle(item) {
  const crop = cropOf(item);
  const png = isPngSource(item.imagen);
  return {
    objectFit: png ? 'contain' : 'cover',
    objectPosition: `${crop.posX}% ${crop.posY}%`,
    transform: `scale(${crop.zoom}) scaleX(${crop.flipX ? -1 : 1}) scaleY(${crop.flipY ? -1 : 1}) rotate(${crop.rotate}deg)`,
    transformOrigin: `${crop.posX}% ${crop.posY}%`
  };
}

export function suggestShapeClass(shapeId, index = 0) {
  const wanted = shapeId && shapeId !== 'mix'
    ? shapeId
    : TIENDA_SUGGEST_SHAPES[index % TIENDA_SUGGEST_SHAPES.length].id;
  return TIENDA_SUGGEST_SHAPES.find((item) => item.id === wanted) || TIENDA_SUGGEST_SHAPES[0];
}

export function pasilloFromHref(href) {
  const to = trim(href);
  const query = to.includes('?') ? to.slice(to.indexOf('?') + 1) : '';
  const params = new URLSearchParams(query);
  return params.get('pasillo') || '';
}

export function marcaFromHref(href) {
  const to = trim(href);
  const query = to.includes('?') ? to.slice(to.indexOf('?') + 1) : '';
  return new URLSearchParams(query).get('marca') || '';
}

function migrateInsertType(type) {
  if (type === 'banner' || type === 'offers') return type === 'banner' ? 'peek' : 'random';
  if (TIENDA_INSERT_TYPES.some((item) => item.id === type)) return type;
  return 'random';
}

export function createFeedCircle(partial = {}, index = 0) {
  const kind = ['custom', 'product', 'pasillo', 'marca'].includes(partial.kind) ? partial.kind : 'custom';
  return {
    id: trim(partial.id) || `circle-${Date.now().toString(36)}-${index}`,
    kind,
    label: trim(partial.label) || 'Sugerencia',
    refId: trim(partial.refId),
    to: trim(partial.to) || '/tienda',
    imagen: trim(partial.imagen || partial.photo),
    shape: TIENDA_SUGGEST_SHAPES.some((item) => item.id === partial.shape) ? partial.shape : 'circle',
    ...cropOf(partial)
  };
}

export function createTiendaHeroSlide(partial = {}, index = 0) {
  const shape = TIENDA_HERO_SHAPES.some((item) => item.id === partial.shape)
    ? partial.shape
    : TIENDA_HERO_SHAPES[index % TIENDA_HERO_SHAPES.length].id;
  return {
    id: trim(partial.id) || `hero-${Date.now().toString(36)}`,
    tag: trim(partial.tag),
    title: trim(partial.title) || 'Nueva pieza para tu rutina',
    copy: trim(partial.copy),
    button: trim(partial.button) || 'Ver',
    to: trim(partial.to) || '/tienda',
    imagen: trim(partial.imagen || partial.photo),
    shape,
    ...cropOf(partial),
    active: partial.active !== false
  };
}

export function createTiendaInsert(partial = {}) {
  const type = migrateInsertType(partial.type);
  const circles = Array.isArray(partial.circles)
    ? partial.circles.map((item, index) => createFeedCircle(item, index)).filter((item) => item.id)
    : [];
  return {
    id: trim(partial.id) || `insert-${Date.now().toString(36)}`,
    type,
    after: Math.max(1, Math.round(Number(partial.after) || TIENDA_FEED_INTERVAL)),
    title: trim(partial.title),
    to: trim(partial.to) || '/tienda',
    imagen: trim(partial.imagen || partial.photo),
    count: Math.max(3, Math.min(8, Math.round(Number(partial.count) || 5))),
    sourcePasillo: trim(partial.sourcePasillo),
    enCamino: Boolean(partial.enCamino),
    inStock: partial.inStock !== false,
    shape: trim(partial.shape) || 'mix',
    ...cropOf(partial),
    circles,
    active: partial.active !== false
  };
}

export function defaultTiendaFeed() {
  return {
    interval: TIENDA_FEED_ROWS,
    hero: [
      createTiendaHeroSlide({
        id: 'hero-facial',
        tag: 'Cosmética facial',
        title: 'Rituales de piel',
        button: 'Facial',
        to: '/tienda?pasillo=skincare',
        shape: 'islas',
        posY: 42
      }, 0),
      createTiendaHeroSlide({
        id: 'hero-corporal',
        tag: 'Cosmética corporal',
        title: 'Cuerpo y textura',
        button: 'Corporal',
        to: '/tienda?pasillo=corporal',
        shape: 'organico',
        posY: 55
      }, 1),
      createTiendaHeroSlide({
        id: 'hero-camino',
        tag: 'En camino',
        title: 'Piezas que llegan',
        button: 'Reservar',
        to: '/tienda?pasillo=en-camino',
        shape: 'diagonal',
        posY: 48
      }, 2)
    ],
    inserts: [
      createTiendaInsert({
        id: 'insert-random',
        type: 'random',
        after: 4,
        title: 'También en vitrina',
        count: 5,
        shape: 'circle'
      }),
      createTiendaInsert({
        id: 'insert-pasillos',
        type: 'pasillos',
        after: 8,
        title: 'Otros pasillos',
        shape: 'circle'
      }),
      createTiendaInsert({
        id: 'insert-camino',
        type: 'random',
        after: 12,
        title: 'Por llegar',
        count: 5,
        enCamino: true,
        to: '/tienda?pasillo=en-camino',
        shape: 'circle'
      }),
      createTiendaInsert({
        id: 'insert-peek',
        type: 'peek',
        after: 16,
        title: 'Corporal',
        to: '/tienda?pasillo=corporal',
        shape: 'circle'
      })
    ]
  };
}

export function withTiendaFeed(saved) {
  const seed = defaultTiendaFeed();
  const raw = saved?.tiendaFeed && typeof saved.tiendaFeed === 'object'
    ? saved.tiendaFeed
    : (saved && typeof saved === 'object' && (saved.hero || saved.inserts) ? saved : null);
  if (!raw) return seed;
  const hero = Array.isArray(raw.hero) ? raw.hero.map((item, index) => createTiendaHeroSlide(item, index)).filter((item) => item.id) : seed.hero;
  const inserts = Array.isArray(raw.inserts) ? raw.inserts.map((item) => createTiendaInsert(item)).filter((item) => item.id) : seed.inserts;
  return {
    interval: normalizeFeedRows(raw.interval ?? seed.interval),
    hero: hero.length ? hero : seed.hero,
    inserts
  };
}

export function tiendaFeedHavePhotos(feed) {
  const data = withTiendaFeed({ tiendaFeed: feed });
  return data.hero.some((item) => item.imagen)
    || data.inserts.some((item) => item.imagen || item.circles.some((circle) => circle.imagen));
}

export function tiendaFeedHaveInlinePhotos(feed) {
  const data = withTiendaFeed({ tiendaFeed: feed });
  const inline = (src) => {
    const value = String(src || '');
    return value.startsWith('data:') || value.startsWith('blob:');
  };
  return data.hero.some((item) => inline(item.imagen))
    || data.inserts.some((item) => inline(item.imagen) || item.circles.some((circle) => inline(circle.imagen)));
}

function hashSeed(value) {
  return String(value).split('').reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 7);
}

function seededShuffle(list, seed) {
  const arr = [...list];
  let h = hashSeed(seed) >>> 0;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    const j = h % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickRandomStock(products, options = {}) {
  const {
    count = 5,
    excludeIds = [],
    excludePasillo = '',
    pasillo = '',
    enCamino = null,
    inStock = true,
    seed = 'feed'
  } = options;
  const skip = new Set((excludeIds || []).map(String));
  let pool = (Array.isArray(products) ? products : []).filter((item) => item?.id && !skip.has(String(item.id)));
  if (pasillo && pasillo !== 'todos') {
    pool = pool.filter((item) => productInPasillo(item, pasillo));
  }
  if (excludePasillo && excludePasillo !== 'todos') {
    const away = pool.filter((item) => !productInPasillo(item, excludePasillo));
    if (away.length >= Math.min(count, 3)) pool = away;
  }
  if (enCamino === true) pool = pool.filter((item) => item.enCamino);
  if (enCamino === false) pool = pool.filter((item) => !item.enCamino);
  if (inStock) {
    const stocked = pool.filter((item) => item.enCamino || Number(item.stock) > 0);
    if (stocked.length) pool = stocked;
  }
  return seededShuffle(pool, seed).slice(0, Math.max(1, Number(count) || 5));
}

function productToSuggestion(product, index, shape) {
  const circle = !shape || shape === 'mix' || shape === 'soft' ? 'circle' : shape;
  return {
    id: product.id,
    kind: 'product',
    label: product.nombre,
    product,
    to: '',
    shape: suggestShapeClass(circle, index).id,
    imagen: product.imagen || '',
    ...cropOf(product)
  };
}

export function resolveInsertSuggestions(insert, { products = [], pasillos = [], currentPasillo = '', excludeIds = [], seed } = {}) {
  const data = createTiendaInsert(insert || {});
  const mix = data.shape || 'mix';
  if (data.type === 'pasillos') {
    return pasillos
      .filter((item) => item.id && item.id !== 'todos' && item.id !== 'tratamientos' && item.id !== currentPasillo)
      .slice(0, data.count)
      .map((item, index) => ({
        id: item.id,
        kind: 'pasillo',
        label: item.nombre,
        to: `/tienda?pasillo=${item.id}`,
        shape: 'circle',
        imagen: '',
        seed: `pasillo-${item.id}`
      }));
  }
  if (data.type === 'circles') {
    return data.circles.map((circle, index) => ({
      ...circle,
      shape: suggestShapeClass(circle.shape || mix, index).id
    }));
  }
  if (data.type === 'peek') return [];
  const picked = pickRandomStock(products, {
    count: data.count,
    excludeIds,
    excludePasillo: currentPasillo,
    pasillo: data.sourcePasillo,
    enCamino: data.enCamino || null,
    inStock: data.inStock,
    seed: seed || data.id
  });
  return picked.map((product, index) => productToSuggestion(product, index, mix));
}

function fallbackInsert(type, after) {
  if (type === 'pasillos') {
    return createTiendaInsert({ id: `auto-pasillos-${after}`, type: 'pasillos', after, title: 'Otros pasillos', shape: 'circle' });
  }
  if (type === 'peek') {
    return createTiendaInsert({ id: `auto-peek-${after}`, type: 'peek', after, title: 'Mira esto', to: '/tienda', shape: 'circle' });
  }
  return createTiendaInsert({
    id: `auto-random-${after}`,
    type: 'random',
    after,
    title: 'También en vitrina',
    count: 5,
    shape: 'circle'
  });
}

export function resolveTiendaInserts(productCount, feed, columns = 2) {
  const data = withTiendaFeed({ tiendaFeed: feed });
  const step = tiendaFeedStep(data.interval, columns);
  const templates = data.inserts.filter((item) => item.active).sort((a, b) => a.after - b.after || a.id.localeCompare(b.id));
  const circles = templates.filter((item) => item.type !== 'peek');
  const banners = templates.filter((item) => item.type === 'peek');
  const mixed = [];
  let circleAt = 0;
  let bannerAt = 0;
  let wantCircle = true;
  while (mixed.length < templates.length) {
    if (wantCircle && circleAt < circles.length) {
      mixed.push(circles[circleAt]);
      circleAt += 1;
      wantCircle = false;
    } else if (bannerAt < banners.length) {
      mixed.push(banners[bannerAt]);
      bannerAt += 1;
      wantCircle = true;
    } else if (circleAt < circles.length) {
      mixed.push(circles[circleAt]);
      circleAt += 1;
    } else {
      break;
    }
  }
  const cycle = mixed.length
    ? mixed
    : ['random', 'peek', 'pasillos'].map((type) => fallbackInsert(type, 0));
  const placed = [];
  let index = 0;
  for (let after = step; after < productCount; after += step) {
    const template = cycle[index % cycle.length];
    placed.push({ ...template, after, id: `${template.id}@${after}` });
    index += 1;
  }
  return placed;
}

export function groupTiendaFeed(products, feed, columns = 2) {
  const list = Array.isArray(products) ? products : [];
  const inserts = resolveTiendaInserts(list.length, feed, columns);
  const groups = [];
  let batch = [];
  let shown = 0;
  let insertAt = 0;

  const flush = () => {
    if (!batch.length) return;
    groups.push({ kind: 'products', products: batch });
    batch = [];
  };

  const pushInserts = () => {
    while (insertAt < inserts.length && inserts[insertAt].after <= shown) {
      flush();
      groups.push({ kind: 'insert', insert: inserts[insertAt] });
      insertAt += 1;
    }
  };

  list.forEach((product) => {
    batch.push(product);
    shown += 1;
    pushInserts();
  });
  flush();
  return groups;
}

export function goTiendaHref(href, navigate) {
  const to = trim(href) || '/tienda';
  if (/^https?:/i.test(to)) {
    window.location.assign(to);
    return;
  }
  navigate(to.startsWith('/') ? to : `/${to}`);
}
