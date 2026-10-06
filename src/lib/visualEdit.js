export function hasEditParam(search = '') {
  const value = String(search).startsWith('?') ? search.slice(1) : search;
  return new URLSearchParams(value).get('editar') === '1';
}

export function withEditParam(to) {
  const [path, query = ''] = String(to).split('?');
  const params = new URLSearchParams(query);
  params.set('editar', '1');
  return `${path}?${params.toString()}`;
}

export function withoutEditParam(to) {
  const [path, query = ''] = String(to).split('?');
  const params = new URLSearchParams(query);
  params.delete('editar');
  const next = params.toString();
  return next ? `${path}?${next}` : path;
}

export function navHrefForStaff({ to, fromAdmin, alreadyEditing, gerente }) {
  if (!fromAdmin && !alreadyEditing) return to;
  if (!gerente && !String(to).startsWith('/mi-burbuja')) return to;
  return withEditParam(to);
}
