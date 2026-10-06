-- Composiciones y marcos del portaretrato en banners.

alter table public.banners
  add column if not exists imagenes jsonb not null default '[]'::jsonb;

alter table public.banners
  add column if not exists marco_layout text not null default 'unica';

alter table public.banners
  add column if not exists marco_estilo text not null default 'lleno';
