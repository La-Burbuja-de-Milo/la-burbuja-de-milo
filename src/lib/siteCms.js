import { normalizeSiteLogo } from './categoryCircles';
import { withHomeTabRows } from './homeTabRows';
import { withHomeStory } from './homeStory';
import { withMediaCrops } from './mediaCrop';
import { normalizeRewardsStrip } from './rewardsStrip';
import { withTiendaPage } from './tiendaPage';

export function siteCmsFromAjustes(ajustes = {}) {
  return {
    rewardsStrip: normalizeRewardsStrip(ajustes.rewardsStrip),
    homeTabRows: withHomeTabRows(ajustes),
    homeStory: withHomeStory(ajustes),
    mediaCrops: withMediaCrops(ajustes),
    tiendaPage: withTiendaPage(ajustes)
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
