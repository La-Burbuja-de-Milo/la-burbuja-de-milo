import { normalizeSiteLogo } from './categoryCircles';
import { withHomeTabRows } from './homeTabRows';
import { withHomeStory } from './homeStory';
import { withMediaCrops } from './mediaCrop';
import { normalizeRewardsStrip } from './rewardsStrip';
import { withTiendaPage } from './tiendaPage';
import { withTiendaMarcas } from './tiendaMarcas';
import { withTiendaFeed } from './tiendaFeed';

export function asShopList(value) {
  const list = Array.isArray(value)
    ? value
    : (Array.isArray(value?.items) ? value.items : []);
  return list
    .filter((item) => item?.id && (item.nombre || item.label))
    .map((item) => ({
      id: item.id,
      nombre: String(item.nombre || item.label || '').trim(),
      ...(item.icon ? { icon: item.icon } : {})
    }))
    .filter((item) => item.nombre);
}

export function siteCmsFromAjustes(ajustes = {}) {
  const tiendaMarcas = withTiendaMarcas(ajustes);
  const shopMarcas = asShopList(ajustes.shopMarcas);
  return {
    rewardsStrip: normalizeRewardsStrip(ajustes.rewardsStrip),
    homeTabRows: withHomeTabRows(ajustes),
    homeStory: withHomeStory(ajustes),
    mediaCrops: withMediaCrops(ajustes),
    tiendaPage: withTiendaPage(ajustes),
    tiendaFeed: withTiendaFeed(ajustes),
    tiendaMarcas,
    shopPasillos: asShopList(ajustes.shopPasillos),
    shopMarcas: shopMarcas.length
      ? shopMarcas
      : tiendaMarcas.circles.map((item) => ({ id: item.id, nombre: item.label })),
    shopEtiquetas: asShopList(ajustes.shopEtiquetas)
  };
}

export function siteCmsFromLogo(logo) {
  const raw = logo && typeof logo === 'object' ? logo : {};
  return raw.cms && typeof raw.cms === 'object' ? raw.cms : {};
}

export function logoWithCms(logo, cms) {
  return {
    ...normalizeSiteLogo(logo),
    cms: cms && typeof cms === 'object' ? cms : siteCmsFromAjustes({})
  };
}

export function pickCmsValue(columnValue, packedValue) {
  const column = columnValue && typeof columnValue === 'object' ? columnValue : null;
  const packed = packedValue && typeof packedValue === 'object' ? packedValue : null;
  if (column && Object.keys(column).length) return column;
  if (packed && Object.keys(packed).length) return packed;
  return column || packed || {};
}

export function pickCmsList(columnValue, packedValue) {
  const column = asShopList(columnValue);
  if (column.length) return column;
  return asShopList(packedValue);
}

export function marcasFromSiteCms(ajustes = {}) {
  const packed = asShopList(ajustes.shopMarcas);
  if (packed.length) return packed;
  return withTiendaMarcas(ajustes).circles
    .map((item) => ({ id: item.id, nombre: item.label }))
    .filter((item) => item.id && item.nombre);
}
