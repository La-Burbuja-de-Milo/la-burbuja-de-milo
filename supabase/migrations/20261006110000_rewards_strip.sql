-- Franja Rewards de Inicio: texto enriquecido, tamaño y espacio.
alter table public.ajustes
  add column if not exists rewards_strip jsonb;
