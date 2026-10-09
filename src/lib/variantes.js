import { toCopAmount } from './money';

export function hasNamedVariantes(product) {
  return (product?.variantes || []).filter((item) => String(item.nombre || '').trim()).length > 1;
}

export function pickVarianteId(product, varianteId = '') {
  return varianteId
    || (product?.variantes || []).find((item) => product.enCamino || Number(item.stock) > 0)?.id
    || product?.variantes?.[0]?.id
    || '';
}

export function findVariante(product, varianteId) {
  const list = product?.variantes || [];
  if (!list.length) return null;
  return list.find((item) => item.id === varianteId) || list[0];
}

export function etiquetaVariante(variante) {
  return String(variante?.nombre || '').trim();
}

export function esStockGenerico(product) {
  return product?.stockReal === false;
}

export function etiquetaVitrina(nombre) {
  const raw = String(nombre || '').trim();
  if (!raw) return '';
  const stripped = raw.replace(/^x\s*/i, '').replace(/\s+/g, ' ');
  if (/^\d/.test(stripped) && /(sobre|cápsula|capsula|unidad|\bund\b)/i.test(stripped)) {
    return `x${stripped}`;
  }
  return raw;
}

export function stockEstado(product, variante) {
  if (product?.enCamino) return 'preventa';
  if (variante) {
    const stock = Number(variante.stock) || 0;
    const minimo = Number(variante.stockMinimo) || 0;
    if (stock <= 0) return 'agotado';
    if (stock <= minimo) return 'bajo';
    return 'ok';
  }
  const list = product?.variantes || [];
  if (list.length) {
    const estados = list.map((item) => stockEstado(product, item));
    if (estados.every((estado) => estado === 'agotado')) return 'agotado';
    if (estados.some((estado) => estado === 'agotado' || estado === 'bajo')) return 'bajo';
    return 'ok';
  }
  const stock = Number(product?.stock) || 0;
  const minimo = Number(product?.stockMinimo) || 0;
  if (stock <= 0) return 'agotado';
  if (stock <= minimo) return 'bajo';
  return 'ok';
}

export function normalizeVariante(productId, variante, index, moneda) {
  const minimo = Number(variante?.stockMinimo);
  const rawId = String(variante?.id || '');
  return {
    id: !rawId || rawId.startsWith('tmp_') ? `${productId}_v${index + 1}` : rawId,
    nombre: String(variante?.nombre || '').trim(),
    precio: toCopAmount(variante?.precio, moneda),
    stock: Number(variante?.stock) || 0,
    stockMinimo: Number.isFinite(minimo) && minimo >= 0 ? minimo : 3
  };
}

export function withVariantes(product) {
  if (!product) return product;
  const id = product.id || 'p';
  let variantes = Array.isArray(product.variantes) ? product.variantes : [];
  if (!variantes.length) {
    variantes = [{
      id: `${id}_std`,
      nombre: '',
      precio: product.precio,
      stock: product.stock,
      stockMinimo: product.stockMinimo
    }];
  }
  variantes = variantes.map((item, index) => normalizeVariante(id, item, index, product.moneda));
  const stock = variantes.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
  const prices = variantes.map((item) => Number(item.precio) || 0);
  const minimo = Math.min(...variantes.map((item) => Number(item.stockMinimo) || 0));
  const stockReal = product.stockReal === false || variantes.some((item) => item.stockReal === false)
    ? false
    : true;
  return {
    ...product,
    variantes: stockReal
      ? variantes.map(({ stockReal: _ignored, ...item }) => item)
      : variantes.map((item) => ({ ...item, stockReal: false })),
    stock,
    precio: prices.length ? Math.min(...prices) : Number(product.precio) || 0,
    stockMinimo: Number.isFinite(minimo) ? minimo : 3,
    stockReal
  };
}

export function filasInventario(productos) {
  return (productos || [])
    .filter((product) => !product.enCamino && !esStockGenerico(product))
    .flatMap((product) => (product.variantes || []).map((variante) => ({
      producto: product,
      variante,
      key: `${product.id}:${variante.id}`,
      estado: stockEstado(product, variante)
    })));
}
