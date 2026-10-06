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
