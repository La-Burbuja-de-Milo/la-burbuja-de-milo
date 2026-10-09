import { loadShareProduct, parseDataImage } from '../../../lib/productSharePage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end('Método no permitido');
  }

  const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const id = String(rawId || '').trim();
  if (!id) return res.status(404).end();

  const product = await loadShareProduct(id);
  const src = String(product?.imagen || '').trim();
  if (/^https?:\/\//i.test(src)) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Location', src);
    return res.status(302).end();
  }

  const parsed = parseDataImage(src);
  if (!parsed?.buffer?.length) return res.status(404).end();

  res.setHeader('Content-Type', parsed.mime || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.setHeader('Content-Length', String(parsed.buffer.length));
  return res.status(200).end(parsed.buffer);
}
