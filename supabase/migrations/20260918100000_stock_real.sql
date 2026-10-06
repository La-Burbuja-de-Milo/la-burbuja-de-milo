-- Los productos genéricos se editan con libertad hasta confirmar inventario real.

alter table public.productos
  add column if not exists stock_real boolean not null default true;
