-- Roles: gerente (admin), asesor (vendedor), usuario (cliente)
-- Invitaciones para que el gerente cree cuentas del equipo.

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

create or replace function public.es_staff()
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
      and rol in ('gerente', 'asesor', 'admin')
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

alter table public.perfiles drop constraint if exists perfiles_rol_check;

update public.perfiles
set rol = case
  when rol in ('admin', 'gerente') then 'gerente'
  when rol = 'asesor' then 'asesor'
  else 'usuario'
end;

alter table public.perfiles
  alter column rol set default 'usuario';

alter table public.perfiles
  add constraint perfiles_rol_check
  check (rol in ('gerente', 'asesor', 'usuario'));

create table if not exists public.invitaciones (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  nombre text,
  rol text not null check (rol in ('gerente', 'asesor', 'usuario')),
  created_by uuid references public.perfiles (id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.invitaciones enable row level security;

drop policy if exists "invitaciones_gerente_all" on public.invitaciones;
create policy "invitaciones_gerente_all" on public.invitaciones
  for all using (public.es_gerente()) with check (public.es_gerente());

drop policy if exists "clientes_admin_all" on public.clientes;
create policy "clientes_staff_all" on public.clientes
  for all using (public.es_staff()) with check (public.es_staff());

drop policy if exists "citas_owner_or_admin_read" on public.citas;
create policy "citas_owner_or_staff_read" on public.citas
  for select using (
    public.es_staff()
    or auth.uid() = user_id
    or (
      (auth.jwt()->>'email') is not null
      and lower(cliente_email) = lower(auth.jwt()->>'email')
    )
  );

drop policy if exists "citas_admin_update" on public.citas;
create policy "citas_staff_update" on public.citas
  for update using (public.es_staff() or auth.uid() = user_id)
  with check (public.es_staff() or auth.uid() = user_id);

drop policy if exists "perfiles_own_read" on public.perfiles;
create policy "perfiles_own_or_staff_read" on public.perfiles
  for select using (auth.uid() = id or public.es_staff());

drop policy if exists "perfiles_own_update" on public.perfiles;
create policy "perfiles_own_update" on public.perfiles
  for update using (auth.uid() = id or public.es_gerente())
  with check (auth.uid() = id or public.es_gerente());

create or replace function public.proteger_rol_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and new.rol is distinct from old.rol
     and not public.es_gerente() then
    new.rol := old.rol;
  end if;
  return new;
end;
$$;

drop trigger if exists perfiles_proteger_rol on public.perfiles;
create trigger perfiles_proteger_rol
  before update on public.perfiles
  for each row execute function public.proteger_rol_perfil();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invitacion public.invitaciones%rowtype;
  rol_asignado text;
  nombre_asignado text;
begin
  select * into invitacion
  from public.invitaciones
  where lower(email) = lower(new.email)
    and used_at is null
  limit 1;

  if found then
    rol_asignado := invitacion.rol;
    nombre_asignado := coalesce(invitacion.nombre, split_part(new.email, '@', 1));
    update public.invitaciones
    set used_at = now()
    where id = invitacion.id;
  elsif not exists (select 1 from public.perfiles where rol = 'gerente') then
    rol_asignado := 'gerente';
    nombre_asignado := coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1));
  else
    rol_asignado := 'usuario';
    nombre_asignado := coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1));
  end if;

  insert into public.perfiles (id, email, nombre, rol)
  values (new.id, new.email, nombre_asignado, rol_asignado);

  return new;
end;
$$;
