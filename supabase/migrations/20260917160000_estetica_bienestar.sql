-- Centro de estética facial, corporal y bienestar: pasillos nuevos y marca comercial.

insert into public.pasillos (id, nombre, icon, orden) values
  ('corporal', 'Estética corporal', 'Heart', 3),
  ('bienestar', 'Bienestar y nutrición', 'Leaf', 5)
on conflict (id) do update
  set nombre = excluded.nombre,
      icon = excluded.icon,
      orden = excluded.orden;

update public.pasillos set nombre = 'Toda la tienda' where id = 'todos';
update public.pasillos set nombre = 'Estética facial' where id = 'skincare';
update public.pasillos set nombre = 'Cuidado capilar' where id = 'capilar';
update public.pasillos set nombre = 'Nutricosmética' where id = 'nutricosmetica';
update public.pasillos set nombre = 'Protocolos de cabina' where id = 'tratamientos';

alter table public.productos add column if not exists marca text;
