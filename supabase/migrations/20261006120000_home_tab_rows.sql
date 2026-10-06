-- Listados de pestañas de Inicio (Bestsellers / Featured) con alineación.
alter table public.ajustes
  add column if not exists home_tab_rows jsonb;
