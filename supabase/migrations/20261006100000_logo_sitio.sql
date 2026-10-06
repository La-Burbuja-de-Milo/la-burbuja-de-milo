-- Logo del encabezado: foto + recorte (zoom, posición, espejo, giro).
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ajustes'
      and column_name = 'logo'
      and data_type = 'text'
  ) then
    alter table public.ajustes
      alter column logo type jsonb using (
        case
          when logo is null or btrim(logo) = '' then null
          when left(btrim(logo), 1) = '{' then logo::jsonb
          else jsonb_build_object(
            'imagen', logo,
            'posX', 50,
            'posY', 50,
            'zoom', 1,
            'flipX', false,
            'flipY', false,
            'rotate', 0
          )
        end
      );
  elsif not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ajustes'
      and column_name = 'logo'
  ) then
    alter table public.ajustes add column logo jsonb;
  end if;
end $$;
