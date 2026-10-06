-- Vitrina en la nube: ajustes (círculos y promo), rol gerente y fotos públicas.

create or replace function public.es_gerente()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.perfiles
    where id = auth.uid()
      and rol in ('gerente', 'admin')
  );
$$;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.es_gerente();
$$;

alter table public.banners add column if not exists imagen text;
alter table public.banners add column if not exists imagenes jsonb not null default '[]'::jsonb;
alter table public.banners add column if not exists marco_layout text not null default 'unica';
alter table public.banners add column if not exists marco_estilo text not null default 'lleno';
alter table public.banners add column if not exists transicion text not null default 'fundido';

drop policy if exists "banners_admin_write" on public.banners;
create policy "banners_admin_write" on public.banners
  for all using (public.es_gerente()) with check (public.es_gerente());

create table if not exists public.ajustes (
  id text primary key default 'site',
  promo_activo boolean not null default true,
  promo_texto text,
  category_circles jsonb not null default '[]'::jsonb,
  category_circles_align text not null default 'start',
  newsletter_emails jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ajustes add column if not exists promo_activo boolean not null default true;
alter table public.ajustes add column if not exists promo_texto text;
alter table public.ajustes add column if not exists category_circles jsonb not null default '[]'::jsonb;
alter table public.ajustes add column if not exists category_circles_align text not null default 'start';
alter table public.ajustes add column if not exists newsletter_emails jsonb not null default '[]'::jsonb;
alter table public.ajustes add column if not exists updated_at timestamptz not null default now();

alter table public.ajustes enable row level security;

drop policy if exists "ajustes_public_read" on public.ajustes;
create policy "ajustes_public_read" on public.ajustes
  for select using (true);

drop policy if exists "ajustes_gerente_write" on public.ajustes;
create policy "ajustes_gerente_write" on public.ajustes
  for all using (public.es_gerente()) with check (public.es_gerente());

drop trigger if exists ajustes_set_updated_at on public.ajustes;
create trigger ajustes_set_updated_at
  before update on public.ajustes
  for each row execute function public.set_updated_at();

insert into public.ajustes (id)
values ('site')
on conflict (id) do nothing;

do $$
begin
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'vitrina',
    'vitrina',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
  on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
exception
  when others then
    raise notice 'No se pudo crear el bucket vitrina: %', sqlerrm;
end $$;

do $$
begin
  execute 'drop policy if exists "vitrina_public_read" on storage.objects';
  execute 'create policy "vitrina_public_read" on storage.objects for select using (bucket_id = ''vitrina'')';
  execute 'drop policy if exists "vitrina_gerente_insert" on storage.objects';
  execute 'create policy "vitrina_gerente_insert" on storage.objects for insert with check (bucket_id = ''vitrina'' and public.es_gerente())';
  execute 'drop policy if exists "vitrina_gerente_update" on storage.objects';
  execute 'create policy "vitrina_gerente_update" on storage.objects for update using (bucket_id = ''vitrina'' and public.es_gerente()) with check (bucket_id = ''vitrina'' and public.es_gerente())';
  execute 'drop policy if exists "vitrina_gerente_delete" on storage.objects';
  execute 'create policy "vitrina_gerente_delete" on storage.objects for delete using (bucket_id = ''vitrina'' and public.es_gerente())';
exception
  when others then
    raise notice 'No se pudieron crear políticas de storage: %', sqlerrm;
end $$;
