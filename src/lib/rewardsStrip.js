const ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR']);

export const DEFAULT_REWARDS_HTML =
  '<strong>Únete a Milo Rewards</strong>. Acceso a preventas y 5% de retorno en cada compra.';

export const DEFAULT_REWARDS_STRIP = {
  visible: true,
  html: DEFAULT_REWARDS_HTML,
  fontSize: 11,
  fontSizeLg: 16,
  paddingY: 10,
  paddingYLg: 32,
  buttonText: 'Join now',
  buttonHref: '/login'
};

function clamp(value, min, max, fallback) {
  const next = Number(value);
  if (!Number.isFinite(next)) return fallback;
  return Math.min(max, Math.max(min, Math.round(next)));
}

function flattenCopy(source, target) {
  [...source.childNodes].forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      target.appendChild(document.createTextNode(child.textContent));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const tag = child.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE') return;
    if (tag === 'BR') {
      target.appendChild(document.createElement('br'));
      return;
    }
    if (tag === 'DIV' || tag === 'P') {
      if (target.childNodes.length) target.appendChild(document.createElement('br'));
      flattenCopy(child, target);
      return;
    }
    if (tag === 'SPAN') {
      flattenCopy(child, target);
      return;
    }
    if (!ALLOWED_TAGS.has(tag)) {
      flattenCopy(child, target);
      return;
    }
    const nextTag = tag === 'B' ? 'strong' : tag === 'I' ? 'em' : tag.toLowerCase();
    const wrap = document.createElement(nextTag);
    flattenCopy(child, wrap);
    target.appendChild(wrap);
  });
}

export function sanitizeRewardsHtml(input) {
  const raw = String(input || '');
  if (!raw.trim() || typeof document === 'undefined' || typeof DOMParser === 'undefined') {
    return raw.replace(/<[^>]*>/g, '').trim();
  }
  const parsed = new DOMParser().parseFromString(`<div>${raw}</div>`, 'text/html');
  const root = parsed.body?.firstElementChild;
  if (!root) return '';
  const out = document.createElement('div');
  flattenCopy(root, out);
  return out.innerHTML
    .replace(/(<br\s*\/?>\s*)+$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function rewardsPlainText(html) {
  if (typeof document === 'undefined') {
    return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const box = document.createElement('div');
  box.innerHTML = sanitizeRewardsHtml(html);
  return (box.textContent || '').replace(/\s+/g, ' ').trim();
}

export function normalizeRewardsStrip(value) {
  const src = value && typeof value === 'object' ? value : {};
  const html = sanitizeRewardsHtml(src.html || DEFAULT_REWARDS_HTML) || DEFAULT_REWARDS_HTML;
  return {
    visible: src.visible !== false,
    html,
    fontSize: clamp(src.fontSize, 8, 22, DEFAULT_REWARDS_STRIP.fontSize),
    fontSizeLg: clamp(src.fontSizeLg, 10, 32, DEFAULT_REWARDS_STRIP.fontSizeLg),
    paddingY: clamp(src.paddingY, 4, 48, DEFAULT_REWARDS_STRIP.paddingY),
    paddingYLg: clamp(src.paddingYLg, 8, 80, DEFAULT_REWARDS_STRIP.paddingYLg),
    buttonText: String(src.buttonText ?? DEFAULT_REWARDS_STRIP.buttonText).trim() || DEFAULT_REWARDS_STRIP.buttonText,
    buttonHref: String(src.buttonHref ?? DEFAULT_REWARDS_STRIP.buttonHref).trim() || DEFAULT_REWARDS_STRIP.buttonHref
  };
}

export function rewardsStripVars(strip) {
  const cfg = normalizeRewardsStrip(strip);
  return {
    '--rewards-size': `${cfg.fontSize}px`,
    '--rewards-size-lg': `${cfg.fontSizeLg}px`,
    '--rewards-pad': `${cfg.paddingY}px`,
    '--rewards-pad-lg': `${cfg.paddingYLg}px`
  };
}
