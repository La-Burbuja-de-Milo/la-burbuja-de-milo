import {
  SITE_NAME,
  escapeHtml,
  loadShareProduct,
  publicShareImage,
  requestOrigin,
  shareCopy,
  shopProductPath
} from '../../lib/productSharePage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end('Método no permitido');
  }

  const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const id = String(rawId || '').trim();
  if (!id) {
    res.setHeader('Location', '/tienda');
    return res.status(302).end();
  }

  const origin = requestOrigin(req);
  const product = await loadShareProduct(id);
  const copy = shareCopy(product);
  const shareUrl = `${origin}/p/${encodeURIComponent(id)}`;
  const shopUrl = `${origin}${shopProductPath(id)}`;
  const image = publicShareImage(product, origin, id);
  const title = escapeHtml(`${copy.title} — ${SITE_NAME}`);
  const description = escapeHtml(copy.description);
  const imageTags = image
    ? `
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(image)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <meta name="twitter:card" content="summary_large_image" />`
    : `
    <meta name="twitter:card" content="summary" />`;

  const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${escapeHtml(shopUrl)}" />
    <meta property="og:locale" content="es_CO" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${escapeHtml(shareUrl)}" />
    ${image ? `<meta property="og:image:alt" content="${title}" />` : ''}
    ${imageTags}
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
  </head>
  <body>
    <p>Abriendo <a href="${escapeHtml(shopUrl)}">${escapeHtml(copy.nombre)}</a>…</p>
    <script>location.replace(${JSON.stringify(shopUrl)});</script>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  return res.status(200).send(html);
}
