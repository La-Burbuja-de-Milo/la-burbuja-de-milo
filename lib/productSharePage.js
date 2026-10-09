import { isSupabaseConfigured, supabase } from './supabaseClient.js';

export const SITE_NAME = 'La Burbuja de Milo';
const FALLBACK_HOST = 'la-burbuja-de-milo.vercel.app';

export function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function requestOrigin(req) {
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim() || 'https';
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || FALLBACK_HOST)
    .split(',')[0]
    .trim() || FALLBACK_HOST;
  return `${proto}://${host}`;
}

export function shopProductPath(id) {
  const safe = encodeURIComponent(String(id || '').trim());
  return safe ? `/tienda?producto=${safe}` : '/tienda';
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

function isDataImage(value) {
  return /^data:image\//i.test(String(value || '').trim());
}

export function parseDataImage(value) {
  const match = String(value || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match) return null;
  try {
    return {
      mime: match[1],
      buffer: Buffer.from(match[2].replace(/\s/g, ''), 'base64')
    };
  } catch {
    return null;
  }
}

export async function loadShareProduct(id) {
  const productId = String(id || '').trim();
  if (!productId) return null;
  if (!isSupabaseConfigured || !supabase) return { id: productId };

  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, marca, descripcion, imagen, tag')
    .eq('id', productId)
    .maybeSingle();

  if (error) {
    console.warn('No se pudo leer el producto para compartir:', error.message || error);
    return { id: productId };
  }
  return data || { id: productId };
}

export function shareCopy(product) {
  const nombre = String(product?.nombre || 'Producto').trim() || 'Producto';
  const marca = String(product?.marca || '').trim();
  const descripcion = String(product?.descripcion || '').replace(/\s+/g, ' ').trim();
  const title = marca ? `${nombre} · ${marca}` : nombre;
  const description = descripcion || [marca, SITE_NAME].filter(Boolean).join(' · ');
  return {
    nombre,
    marca,
    title,
    description: description.slice(0, 180)
  };
}

export function publicShareImage(product, origin, id) {
  const src = String(product?.imagen || '').trim();
  if (isHttpUrl(src)) return src;
  if (isDataImage(src)) return `${origin}/api/p/${encodeURIComponent(id)}/img`;
  return '';
}
