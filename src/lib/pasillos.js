export const CABINA_PASILLO_ID = 'tratamientos';

const PASILLO_RENAMES = {
  skincare: {
    from: ['Facial', 'Estética facial'],
    to: 'Cosmética facial'
  },
  corporal: {
    from: ['Corporal', 'Estética corporal'],
    to: 'Cosmética corporal'
  }
};

export function withPasilloNames(list = []) {
  return (Array.isArray(list) ? list : []).map((item) => {
    const rule = PASILLO_RENAMES[item?.id];
    if (!rule) return item;
    if (!item.nombre || rule.from.includes(item.nombre)) {
      return { ...item, nombre: rule.to };
    }
    return item;
  });
}

export function movePasillo(list = [], fromId, toIndex) {
  const next = Array.isArray(list) ? [...list] : [];
  const from = next.findIndex((item) => item.id === fromId);
  if (from < 0) return next;
  const target = Math.max(0, Math.min(next.length - 1, Number(toIndex)));
  if (from === target) return next;
  const [item] = next.splice(from, 1);
  next.splice(target, 0, item);
  return next;
}

export function shopPasillos(list = []) {
  return (Array.isArray(list) ? list : []).filter((item) => item?.id && item.id !== CABINA_PASILLO_ID);
}

export function productPasillos(product) {
  const list = Array.isArray(product?.pasillos) ? product.pasillos.filter(Boolean) : [];
  if (list.length) return [...new Set(list)];
  return product?.pasillo ? [product.pasillo] : [];
}

export function withProductPasillos(product) {
  if (!product) return product;
  const pasillos = productPasillos(product);
  return {
    ...product,
    pasillo: pasillos[0] || 'skincare',
    pasillos: pasillos.length ? pasillos : ['skincare']
  };
}

export function productInPasillo(product, pasilloId) {
  if (!pasilloId || pasilloId === 'todos') return true;
  return productPasillos(product).includes(pasilloId);
}

export function pasilloLabels(product, catalog = []) {
  return productPasillos(product).map((id) => (
    catalog.find((item) => item.id === id)?.nombre || id
  ));
}
