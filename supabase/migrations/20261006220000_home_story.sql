-- Bloques editables de Inicio: Pasillos de la casa, Marcas en vitrina y Estética y bienestar.
alter table public.ajustes
  add column if not exists home_story jsonb;
