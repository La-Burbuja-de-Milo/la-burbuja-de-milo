-- La Burbuja de Milo — esquema inicial
-- Catalogo, CRM, citas, blog, perfiles y rutinas.
-- Sustituye el esquema vacio previo (perfiles/productos/rutinas/registros_progreso).

create extension if not exists "pgcrypto";

drop trigger if exists on_auth_user_created on auth.users;
drop table if exists public.registros_progreso cascade;
drop table if exists public.rutinas cascade;
drop table if exists public.productos cascade;
drop table if exists public.perfiles cascade;
drop table if exists public.citas cascade;
drop table if exists public.clientes cascade;
drop table if exists public.blog_posts cascade;
drop table if exists public.banners cascade;
drop table if exists public.servicios cascade;
drop table if exists public.pasillos cascade;
drop function if exists public.es_admin() cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- ---------------------------------------------------------------------------

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  nombre text,
  telefono text,
  ciudad text,
  tipo_piel text,
  sensibilidades text[] not null default '{}',
  activos_recomendados text,
  proxima_sesion_sugerida text,
  notas_crm text,
  rol text not null default 'cliente' check (rol in ('cliente', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger perfiles_set_updated_at
  before update on public.perfiles
  for each row execute function public.set_updated_at();

create or replace function public.es_admin()
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
      and rol = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, email, nombre, rol)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    case
      when exists (select 1 from public.perfiles where rol = 'admin') then 'cliente'
      else 'admin'
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Catalogo
-- ---------------------------------------------------------------------------

create table public.pasillos (
  id text primary key,
  nombre text not null,
  icon text,
  orden integer not null default 0
);

create table public.productos (
  id text primary key,
  nombre text not null,
  pasillo_id text not null references public.pasillos (id),
  precio numeric(10, 2) not null default 0,
  moneda text not null default 'USD',
  stock integer not null default 0,
  en_camino boolean not null default false,
  fecha_llegada date,
  cupos_reserva integer not null default 0,
  reservas_actuales integer not null default 0,
  tag text,
  descripcion text,
  ingredientes text,
  modo_uso text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger productos_set_updated_at
  before update on public.productos
  for each row execute function public.set_updated_at();

create table public.banners (
  id text primary key,
  tag text,
  titulo text not null,
  descripcion text,
  boton_texto text,
  boton_enlace text,
  boton_secundario_texto text,
  boton_secundario_enlace text,
  activo boolean not null default true,
  gradiente text,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger banners_set_updated_at
  before update on public.banners
  for each row execute function public.set_updated_at();

create table public.servicios (
  id text primary key,
  titulo text not null,
  categoria text,
  duracion_minutos integer not null default 60,
  precio numeric(10, 2) not null default 0,
  descripcion text,
  recomendado text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger servicios_set_updated_at
  before update on public.servicios
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- CRM y agenda
-- ---------------------------------------------------------------------------

create table public.clientes (
  id text primary key,
  user_id uuid references public.perfiles (id) on delete set null,
  nombre text not null,
  telefono text,
  email text,
  ciudad text,
  tipo_piel text,
  fecha_registro date not null default current_date,
  citas_count integer not null default 0,
  pedidos_count integer not null default 0,
  reservas_activas integer not null default 0,
  notas_crm text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger clientes_set_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

create index clientes_email_idx on public.clientes (lower(email));
create index clientes_telefono_idx on public.clientes (telefono);

create table public.citas (
  id text primary key,
  user_id uuid references public.perfiles (id) on delete set null,
  cliente_id text references public.clientes (id) on delete set null,
  cliente_nombre text not null,
  cliente_telefono text,
  cliente_email text,
  servicio_id text references public.servicios (id) on delete set null,
  servicio_titulo text not null,
  fecha date not null,
  hora time not null,
  duracion_minutos integer not null default 60,
  estado text not null default 'Pendiente'
    check (estado in ('Pendiente', 'Confirmada', 'Realizada', 'Cancelada')),
  notas_cliente text,
  notas_internas_crm text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger citas_set_updated_at
  before update on public.citas
  for each row execute function public.set_updated_at();

create index citas_fecha_idx on public.citas (fecha, hora);
create index citas_email_idx on public.citas (lower(cliente_email));

-- ---------------------------------------------------------------------------
-- Blog y rutinas
-- ---------------------------------------------------------------------------

create table public.blog_posts (
  id text primary key,
  titulo text not null,
  categoria text,
  autor text,
  fecha date not null default current_date,
  tiempo_lectura text,
  resumen text,
  contenido text,
  publicado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

create table public.rutinas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.perfiles (id) on delete cascade,
  nombre text not null default 'Rutina',
  momento text not null default 'AM' check (momento in ('AM', 'PM')),
  activa boolean not null default true,
  pasos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger rutinas_set_updated_at
  before update on public.rutinas
  for each row execute function public.set_updated_at();

create index rutinas_user_activa_idx on public.rutinas (user_id, activa);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.perfiles enable row level security;
alter table public.pasillos enable row level security;
alter table public.productos enable row level security;
alter table public.banners enable row level security;
alter table public.servicios enable row level security;
alter table public.clientes enable row level security;
alter table public.citas enable row level security;
alter table public.blog_posts enable row level security;
alter table public.rutinas enable row level security;

-- Catalogo: lectura publica, escritura solo admin
create policy "pasillos_public_read" on public.pasillos for select using (true);
create policy "pasillos_admin_write" on public.pasillos for all using (public.es_admin()) with check (public.es_admin());

create policy "productos_public_read" on public.productos for select using (true);
create policy "productos_admin_write" on public.productos for all using (public.es_admin()) with check (public.es_admin());

create policy "banners_public_read" on public.banners for select using (true);
create policy "banners_admin_write" on public.banners for all using (public.es_admin()) with check (public.es_admin());

create policy "servicios_public_read" on public.servicios for select using (true);
create policy "servicios_admin_write" on public.servicios for all using (public.es_admin()) with check (public.es_admin());

create policy "blog_public_read" on public.blog_posts for select using (publicado = true or public.es_admin());
create policy "blog_admin_write" on public.blog_posts for all using (public.es_admin()) with check (public.es_admin());

-- Perfiles: cada usuario ve el suyo; admin ve todos
create policy "perfiles_own_read" on public.perfiles
  for select using (auth.uid() = id or public.es_admin());
create policy "perfiles_own_update" on public.perfiles
  for update using (auth.uid() = id or public.es_admin())
  with check (auth.uid() = id or public.es_admin());

-- CRM: solo admin
create policy "clientes_admin_all" on public.clientes
  for all using (public.es_admin()) with check (public.es_admin());

-- Citas: reserva publica (formulario), dueño o admin las leen
create policy "citas_public_insert" on public.citas
  for insert with check (true);
create policy "citas_owner_or_admin_read" on public.citas
  for select using (
    public.es_admin()
    or auth.uid() = user_id
    or (auth.jwt()->>'email') is not null
       and lower(cliente_email) = lower(auth.jwt()->>'email')
  );
create policy "citas_admin_update" on public.citas
  for update using (public.es_admin() or auth.uid() = user_id)
  with check (public.es_admin() or auth.uid() = user_id);

-- Rutinas: dueño o admin
create policy "rutinas_own_all" on public.rutinas
  for all using (auth.uid() = user_id or public.es_admin())
  with check (auth.uid() = user_id or public.es_admin());

-- ---------------------------------------------------------------------------
-- Datos iniciales del prototipo
-- ---------------------------------------------------------------------------

insert into public.pasillos (id, nombre, icon, orden) values
  ('todos', 'Todos los Pasillos', 'Sparkles', 0),
  ('skincare', 'Skincare Facial', 'Droplets', 1),
  ('capilar', 'Cuidado Capilar', 'Wind', 2),
  ('tratamientos', 'Tratamientos & Cabina', 'CalendarHeart', 3),
  ('nutricosmetica', 'Nutricosmética', 'ShieldCheck', 4);

insert into public.banners (
  id, tag, titulo, descripcion,
  boton_texto, boton_enlace, boton_secundario_texto, boton_secundario_enlace,
  activo, gradiente, orden
) values
  (
    'b1',
    'SALUD ESTÉTICA CONSCIENTE',
    'Tu piel, tu santuario.',
    'La Burbuja de Milo: Diagnóstico facial científico, tratamientos en cabina y fórmulas libres de toxinas diseñadas para resultados reales.',
    'Agendar Valoración', '/citas', 'Explorar Tienda', '/tienda',
    true, 'from-pink-500/15 via-purple-500/10 to-transparent', 1
  ),
  (
    'b2',
    'PRÓXIMOS ARRIBOS EXCLUSIVOS',
    'Colección Botánica en Camino',
    'Aparta tus fórmulas favoritas antes de que se agoten en aduana. Precios especiales de preventa con entrega prioritaria.',
    'Ver Productos en Camino', '/tienda?filtro=en-camino', 'Conoce los Ingredientes', '/blog',
    true, 'from-cyan-500/15 via-blue-500/10 to-transparent', 2
  );

insert into public.productos (
  id, nombre, pasillo_id, precio, moneda, stock, en_camino, fecha_llegada,
  cupos_reserva, reservas_actuales, tag, descripcion, ingredientes, modo_uso
) values
  (
    'p1', 'Limpiador Botánico de Caléndula & Té Verde', 'skincare', 24.00, 'USD', 16, false, null, 0, 0, 'Bestseller',
    'Espuma delicada con pH fisiológico 5.5. Limpia profundamente los poros sin alterar el manto lipídico.',
    'Extracto de Caléndula, Té Verde Matcha, Glicerina Vegetal, Centella.',
    'Aplicar mañana y noche sobre la piel húmeda con suaves masajes circulares.'
  ),
  (
    'p2', 'Serum Reparador Nocturno (Péptidos + HA)', 'skincare', 45.00, 'USD', 9, false, null, 0, 0, 'Favorito',
    'Complejo bio-activo nocturno con 5 cadenas de péptidos y ácido hialurónico triple peso molecular.',
    'Péptido Matrixyl 3000, Ácido Hialurónico al 2%, Ceramidas NP, Niacinamida.',
    'Colocar 3-4 gotas sobre rostro y cuello limpio antes de la crema sellante.'
  ),
  (
    'p3', 'Protector Solar Mineral FPS 50+ Invisible Touch', 'skincare', 32.00, 'USD', 22, false, null, 0, 0, 'Esencial',
    'Filtro 100% mineral no nano, enriquecido con antioxidantes para bloquear radiación UVA/UVB y luz azul.',
    'Óxido de Zinc 18%, Dióxido de Titanio, Resveratrol, Ectoína.',
    'Reaplicar cada 3 a 4 horas en zonas expuestas.'
  ),
  (
    'p4', 'Crema Restauradora Centella Asiática Pura (Madecassoside)', 'skincare', 38.00, 'USD', 0, true, '2026-09-28', 20, 8, 'En Camino',
    'Tratamiento intensivo para barrera cutánea dañada, rojeces y sensibilidad extrema. Fórmulas coreanas frescas en tránsito internacional.',
    'Centella Asiatica Extract 72%, Madecassoside, Pantenol al 5%, Alantoína.',
    'Sellar la rutina nocturna o usar como bálsamo SOS en zonas descamadas.'
  ),
  (
    'p5', 'Ampolla de Colágeno Marino Microencapsulado', 'skincare', 54.00, 'USD', 0, true, '2026-10-04', 25, 14, 'Preventa',
    'Efecto lifting progresivo y reposición de elasticidad dérmica con nanovesículas de absorción inmediata.',
    'Colágeno Marino Hidrolizado, Tripéptido de Cobre, Adenosina, Beta-Glucanos.',
    '1 ampolla cada 3 noches por 1 mes como choque rejuvenecedor.'
  ),
  (
    'p6', 'Tónico Exfoliante con Ácido Mandélico 8%', 'skincare', 29.00, 'USD', 12, false, null, 0, 0, 'Nuevo',
    'AHA suave para textura irregular, poros obstruidos y manchas superficiales. Apto para piel sensible.',
    'Ácido Mandélico 8%, Agua de Rosas Damascenas, Extracto de Regaliz.',
    'Usar 2-3 noches por semana tras la limpieza con toques suaves de algodón.'
  ),
  (
    'p7', 'Mascarilla Capilar de Queratina Vegetal & Macadamia', 'capilar', 28.00, 'USD', 14, false, null, 0, 0, 'Popular',
    'Reparación profunda de hebras quebradizas por decoloración o herramientas térmicas.',
    'Proteína de Trigo Hidrolizada, Aceite de Macadamia, Pantenol, Aminoácidos.',
    'Dejar actuar de 10 a 15 minutos en medios y puntas después del shampoo.'
  ),
  (
    'p8', 'Serum Capilar Péptidos Densificadores Folículo Activo', 'capilar', 42.00, 'USD', 0, true, '2026-10-02', 15, 5, 'En Camino',
    'Tratamiento no graso para el cuero cabelludo que estimula la fase anágena y frena la caída estacional.',
    'Redensyl, Péptidos de Cobre, Cafeína Bio-disponible, Biotina.',
    'Aplicar unas gotas directo al cuero cabelludo seco y masajear sin enjuague.'
  ),
  (
    'p9', 'Glow Booster Nutricosmético (Biotina + Zinc + Vit C)', 'nutricosmetica', 36.00, 'USD', 19, false, null, 0, 0, 'Bestseller',
    'Cápsulas vegetales para fortalecer uñas, cabello y estimular la síntesis de colágeno natural.',
    'Biotina 5000mcg, Zinc Quelado, Vitamina C Liposomal, Ácido Hialurónico Oral.',
    'Tomar 1 cápsula diaria con el desayuno.'
  );

insert into public.servicios (id, titulo, categoria, duracion_minutos, precio, descripcion, recomendado) values
  (
    's1', 'Valoración Facial Integral 3D', 'Diagnóstico', 60, 35.00,
    'Análisis minucioso del microbioma y barrera cutánea con luz de Wood. Incluye diseño personalizado de rutina y prescripción de cabina.',
    'Ideal si es tu primera vez en La Burbuja de Milo.'
  ),
  (
    's2', 'Limpieza Facial Profunda con Hidrodermoabrasión', 'Higiene & Extracción', 75, 65.00,
    'Vórtice de succión ultrasónica e infusión de activos calmantes sin enrojecimiento ni dolor.',
    'Recomendada cada 30 días.'
  ),
  (
    's3', 'Peeling Químico Renovador & Despigmentante', 'Renovación Celular', 50, 70.00,
    'Exfoliación médica controlada con cóctel de alfahidroxiácidos para unificar el tono y suavizar textura.',
    'Excelente para manchas solares o marcas de acné.'
  ),
  (
    's4', 'Protocolo Glow Reafirmante con Radiofrecuencia', 'Anti-aging & Lifting', 80, 85.00,
    'Estimulación térmica de fibroblastos combinada con masaje escultórico facial y máscara LED regenerativa.',
    'Lifting visible inmediato sin tiempo de recuperación.'
  ),
  (
    's5', 'Skin-Concierge Virtual (Asesoría Remota)', 'Virtual / Online', 40, 25.00,
    'Videollamada privada donde revisamos tus productos actuales y ajustamos tu protocolo paso a paso.',
    'Perfecto si vives fuera de la ciudad o tienes poco tiempo.'
  );

insert into public.clientes (
  id, nombre, telefono, email, ciudad, tipo_piel, fecha_registro,
  citas_count, pedidos_count, reservas_activas, notas_crm
) values
  (
    'cl1', 'Camila Morales', '3001234567', 'camila.morales@ejemplo.com', 'Medellín',
    'Mixta reactiva / Sensible', '2026-08-10', 2, 3, 1,
    'Prefiere ser contactada por WhatsApp en las mañanas. Muy receptiva a ingredientes calmantes.'
  ),
  (
    'cl2', 'Andrea Gómez', '3109876543', 'andrea.gomez@ejemplo.com', 'Bogotá',
    'Grasa con tendencia acneica', '2026-09-01', 1, 1, 0,
    'En proceso de despigmentación de manchas post-inflamatorias.'
  ),
  (
    'cl3', 'Mariana Restrepo', '3157891234', 'mariana.r@ejemplo.com', 'Medellín',
    'Normal a Seca', '2026-07-22', 3, 4, 1,
    'Cliente VIP. Apartó la Ampolla de Colágeno Marino para su entrega en octubre.'
  );

insert into public.citas (
  id, cliente_id, cliente_nombre, cliente_telefono, cliente_email,
  servicio_id, servicio_titulo, fecha, hora, duracion_minutos, estado,
  notas_cliente, notas_internas_crm
) values
  (
    'c1', 'cl1', 'Camila Morales', '3001234567', 'camila.morales@ejemplo.com',
    's1', 'Valoración Facial Integral 3D', '2026-09-18', '10:00', 60, 'Confirmada',
    'Piel reactiva en mejillas, uso de retinol previo.',
    'Fototipo III. Sensibilidad eritematosa leve. Preparar cabina con tónico de centella fresca.'
  ),
  (
    'c2', 'cl2', 'Andrea Gómez', '3109876543', 'andrea.gomez@ejemplo.com',
    's2', 'Limpieza Facial Profunda con Hidrodermoabrasión', '2026-09-19', '14:30', 75, 'Pendiente',
    'Comedones cerrados en zona T.',
    'Interesada en rutinas coreanas y reserva de crema reparadora.'
  ),
  (
    'c3', 'cl3', 'Mariana Restrepo', '3157891234', 'mariana.r@ejemplo.com',
    's3', 'Peeling Químico Renovador & Despigmentante', '2026-09-12', '16:00', 50, 'Realizada',
    'Excelente tolerancia al ácido mandélico.',
    'Sesión 1/3 culminada. Citar para revisión y sesión 2 en 21 días.'
  );

insert into public.blog_posts (id, titulo, categoria, autor, fecha, tiempo_lectura, resumen, contenido) values
  (
    'post-1',
    'Cómo reconstruir una barrera cutánea debilitada en 14 días',
    'Ciencia Estética', 'Equipo Clínico Milo', '2026-09-10', '4 min',
    'Sensación de tirantez, ardor al aplicar productos básicos o rojeces repentinas son señales de un manto lipídico fisurado.',
    $post$La barrera cutánea es la primera línea de defensa inmunológica y biológica de nuestro cuerpo. Cuando la sobre-exfoliación, el clima seco o el uso desmedido de ácidos la vulneran, las ceramidas y los ácidos grasos esenciales se pierden.

Para restaurarla eficazmente recomendamos:
1. Suspender temporalmente retinoides y exfoliantes.
2. Incorporar limpiadores oleosos o cremosos con pH balanceado.
3. Aplicar sérums ricos en Madecassoside (Centella Asiática) y Pantenol.
4. Sellar la hidratación con cremas que contengan proporciones fisiológicas de ceramidas.$post$
  ),
  (
    'post-2',
    'Protección Solar Mineral vs Química: ¿Cuál beneficia más a tu rostro?',
    'Ingredientes Conscientes', 'Dra. Milo', '2026-09-05', '5 min',
    'Analizamos los mecanismos de acción del óxido de zinc frente a filtros químicos tradicionales y su impacto en la salud de la piel.',
    $post$Los filtros físicos o minerales (como el óxido de zinc y dióxido de titanio) funcionan como un escudo reflector microscópico sobre la epidermis, sin requerir ser absorbidos para activarse.

Son la opción predilecta tras procedimientos en cabina (como peelings, láser o hidrodermoabrasión) ya que no generan calor cutáneo residual y poseen propiedades antiinflamatorias naturales.$post$
  ),
  (
    'post-3',
    'El arte de la Valoración Facial: Por qué los diagnósticos genéricos fallan',
    'Tratamientos en Cabina', 'Milo Studio', '2026-08-28', '3 min',
    'Descubre en qué consiste una valoración con luz de Wood y cómo mapeamos las capas profundas de la dermis antes de tocar tu piel.',
    $post$Ninguna piel es estática. Cambia con tus niveles hormonales, tu alimentación y el estrés diario. Una valoración no solo determina si tu piel es "seca o grasa", sino el nivel de hidratación subepidérmica, elastosis solar incipiente y susceptibilidad a reactividad.$post$
  );
