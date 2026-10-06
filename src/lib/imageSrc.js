export function isPngSource(src) {
  const value = String(src || '').trim();
  if (!value) return false;
  if (/^data:image\/png/i.test(value)) return true;
  if (/^data:image\//i.test(value)) return false;
  const path = value.split('?')[0].split('#')[0];
  return /\.png$/i.test(path);
}
