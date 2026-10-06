-- Un producto puede aparecer en varios pasillos de la tienda.

alter table public.productos
  add column if not exists pasillos jsonb not null default '[]'::jsonb;
