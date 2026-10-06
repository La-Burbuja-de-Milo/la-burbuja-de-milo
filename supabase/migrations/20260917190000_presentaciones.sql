-- Presentaciones de una misma línea: 7/28 sobres, 250/500 ml, etc.

alter table public.productos
  add column if not exists variantes jsonb not null default '[]'::jsonb;

alter table public.inventario_movimientos
  add column if not exists variante_id text;

alter table public.inventario_movimientos
  add column if not exists variante_nombre text;
