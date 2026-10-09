export function productPermalink(product) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = new URL('/tienda', origin || 'https://la-burbuja-de-milo.vercel.app');
  if (product?.id) url.searchParams.set('producto', product.id);
  return url.toString();
}

export function productShareText(product) {
  const nombre = String(product?.nombre || 'Producto').trim();
  const marca = String(product?.marca || '').trim();
  return [nombre, marca, 'La Burbuja de Milo'].filter(Boolean).join(' · ');
}

export function productRating(product) {
  const explicit = Number(product?.rating);
  if (Number.isFinite(explicit) && explicit > 0) {
    return Math.min(5, Math.round(explicit * 10) / 10);
  }

  const seed = String(product?.id || product?.nombre || 'milo');
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const fraction = (hash >>> 0) % 9;
  const tag = String(product?.tag || '').toLowerCase();
  let value = 4.1 + fraction / 10;
  if (tag.includes('bestseller')) value += 0.3;
  else if (tag.includes('favorito')) value += 0.2;
  else if (tag.includes('esencial')) value += 0.15;
  else if (tag.includes('popular')) value += 0.1;
  return Math.min(5, Math.round(value * 10) / 10);
}

export async function shareProductNative(product) {
  const url = productPermalink(product);
  const title = String(product?.nombre || 'La Burbuja de Milo');
  const text = productShareText(product);
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return { ok: false, url, title, text };
  }
  try {
    await navigator.share({ title, text, url });
    return { ok: true, url, title, text };
  } catch (error) {
    if (error?.name === 'AbortError') return { ok: true, aborted: true, url, title, text };
    return { ok: false, url, title, text };
  }
}

export function shareChannels(product) {
  const url = productPermalink(product);
  const text = productShareText(product);
  const encodedText = encodeURIComponent(`${text}\n${url}`);
  const encodedUrl = encodeURIComponent(url);
  return [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedText}`,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];
}
