-- Fotografías de vitrina y ficha clínica que el admin publica hacia clientes.

alter table public.productos add column if not exists imagen text;
alter table public.banners add column if not exists imagen text;
alter table public.blog_posts add column if not exists imagen text;
alter table public.servicios add column if not exists imagen text;

alter table public.clientes add column if not exists diagnostico text;
alter table public.clientes add column if not exists activos_recomendados text;
alter table public.clientes add column if not exists proxima_sesion text;
alter table public.clientes add column if not exists skin_concierge text;
