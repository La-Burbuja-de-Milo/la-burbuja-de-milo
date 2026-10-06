-- Transición de entrada de las fotos del banner.

alter table public.banners
  add column if not exists transicion text not null default 'fundido';
