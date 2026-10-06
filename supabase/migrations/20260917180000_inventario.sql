-- Inventario de cabina: stock mínimo y kardex de movimientos.

alter table public.productos
  add column if not exists stock_minimo integer not null default 3;

create table if not exists public.inventario_movimientos (
  id text primary key,
  producto_id text not null,
  producto_nombre text,
  tipo text not null check (tipo in ('entrada', 'salida', 'venta', 'ajuste')),
  cantidad integer not null default 0,
  delta integer not null default 0,
  stock_antes integer not null default 0,
  stock_despues integer not null default 0,
  motivo text,
  nota text,
  origen text,
  fecha timestamptz not null default now()
);

create index if not exists inventario_movimientos_producto_idx
  on public.inventario_movimientos (producto_id, fecha desc);

alter table public.inventario_movimientos enable row level security;

drop policy if exists "inventario_gerente_all" on public.inventario_movimientos;
create policy "inventario_gerente_all" on public.inventario_movimientos
  for all using (public.es_admin()) with check (public.es_admin());
