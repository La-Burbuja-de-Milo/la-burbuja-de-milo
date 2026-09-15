import { isSupabaseConfigured, supabase } from '../lib/supabase';

const KEYS = {
  BANNERS: 'milo_banners',
  PASILLOS: 'milo_pasillos',
  PRODUCTOS: 'milo_productos',
  CITAS: 'milo_citas',
  SERVICIOS: 'milo_servicios',
  CLIENTES: 'milo_clientes',
  BLOG: 'milo_blog'
};

function toIsoDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(String(value))) return String(value).slice(0, 10);
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

function formatDisplayDate(value) {
  if (!value) return '';
  if (/[A-Za-z]/.test(String(value)) && !/^\d{4}-\d{2}-\d{2}/.test(String(value))) {
    return String(value);
  }
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function mapProductoFromDb(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    pasillo: row.pasillo_id,
    precio: Number(row.precio) || 0,
    moneda: row.moneda || 'USD',
    stock: Number(row.stock) || 0,
    enCamino: Boolean(row.en_camino),
    fechaLlegada: row.fecha_llegada || null,
    cuposReserva: Number(row.cupos_reserva) || 0,
    reservasActuales: Number(row.reservas_actuales) || 0,
    tag: row.tag || '',
    descripcion: row.descripcion || '',
    ingredientes: row.ingredientes || '',
    modoUso: row.modo_uso || ''
  };
}

function mapProductoToDb(producto) {
  return {
    id: producto.id,
    nombre: producto.nombre,
    pasillo_id: producto.pasillo || 'skincare',
    precio: Number(producto.precio) || 0,
    moneda: producto.moneda || 'USD',
    stock: Number(producto.stock) || 0,
    en_camino: Boolean(producto.enCamino),
    fecha_llegada: toIsoDate(producto.fechaLlegada),
    cupos_reserva: Number(producto.cuposReserva) || 0,
    reservas_actuales: Number(producto.reservasActuales) || 0,
    tag: producto.tag || null,
    descripcion: producto.descripcion || null,
    ingredientes: producto.ingredientes || null,
    modo_uso: producto.modoUso || null
  };
}

export function mapBannerFromDb(row) {
  return {
    id: row.id,
    tag: row.tag || '',
    titulo: row.titulo,
    descripcion: row.descripcion || '',
    botonTexto: row.boton_texto || '',
    botonEnlace: row.boton_enlace || '',
    botonSecundarioTexto: row.boton_secundario_texto || '',
    botonSecundarioEnlace: row.boton_secundario_enlace || '',
    activo: row.activo !== false,
    gradiente: row.gradiente || ''
  };
}

function mapBannerToDb(banner, index = 0) {
  return {
    id: banner.id,
    tag: banner.tag || null,
    titulo: banner.titulo,
    descripcion: banner.descripcion || null,
    boton_texto: banner.botonTexto || null,
    boton_enlace: banner.botonEnlace || null,
    boton_secundario_texto: banner.botonSecundarioTexto || null,
    boton_secundario_enlace: banner.botonSecundarioEnlace || null,
    activo: banner.activo !== false,
    gradiente: banner.gradiente || null,
    orden: index
  };
}

export function mapPasilloFromDb(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    icon: row.icon || 'Sparkles'
  };
}

export function mapServicioFromDb(row) {
  return {
    id: row.id,
    titulo: row.titulo,
    categoria: row.categoria || '',
    duracionMinutos: Number(row.duracion_minutos) || 60,
    precio: Number(row.precio) || 0,
    descripcion: row.descripcion || '',
    recomendado: row.recomendado || ''
  };
}

export function mapCitaFromDb(row) {
  return {
    id: row.id,
    clienteId: row.cliente_id || '',
    clienteNombre: row.cliente_nombre,
    clienteTelefono: row.cliente_telefono || '',
    clienteEmail: row.cliente_email || '',
    servicioId: row.servicio_id || '',
    servicioTitulo: row.servicio_titulo,
    fecha: row.fecha,
    hora: String(row.hora).slice(0, 5),
    duracionMinutos: Number(row.duracion_minutos) || 60,
    estado: row.estado || 'Pendiente',
    notasCliente: row.notas_cliente || '',
    notasInternasCRM: row.notas_internas_crm || ''
  };
}

function mapCitaToDb(cita) {
  return {
    id: cita.id,
    cliente_id: cita.clienteId && !String(cita.clienteId).startsWith('cl_') ? cita.clienteId : null,
    cliente_nombre: cita.clienteNombre,
    cliente_telefono: cita.clienteTelefono || null,
    cliente_email: cita.clienteEmail || null,
    servicio_id: cita.servicioId || null,
    servicio_titulo: cita.servicioTitulo,
    fecha: toIsoDate(cita.fecha) || cita.fecha,
    hora: cita.hora || '10:00',
    duracion_minutos: Number(cita.duracionMinutos) || 60,
    estado: cita.estado || 'Pendiente',
    notas_cliente: cita.notasCliente || null,
    notas_internas_crm: cita.notasInternasCRM || null
  };
}

export function mapClienteFromDb(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono || '',
    email: row.email || '',
    ciudad: row.ciudad || '',
    tipoPiel: row.tipo_piel || '',
    fechaRegistro: row.fecha_registro || '',
    citasCount: Number(row.citas_count) || 0,
    pedidosCount: Number(row.pedidos_count) || 0,
    reservasActivas: Number(row.reservas_activas) || 0,
    notasCRM: row.notas_crm || ''
  };
}

function mapClienteToDb(cliente) {
  return {
    id: cliente.id,
    nombre: cliente.nombre,
    telefono: cliente.telefono || null,
    email: cliente.email || null,
    ciudad: cliente.ciudad || null,
    tipo_piel: cliente.tipoPiel || null,
    fecha_registro: toIsoDate(cliente.fechaRegistro) || cliente.fechaRegistro || null,
    citas_count: Number(cliente.citasCount) || 0,
    pedidos_count: Number(cliente.pedidosCount) || 0,
    reservas_activas: Number(cliente.reservasActivas) || 0,
    notas_crm: cliente.notasCRM || null
  };
}

export function mapBlogFromDb(row) {
  return {
    id: row.id,
    titulo: row.titulo,
    categoria: row.categoria || '',
    autor: row.autor || '',
    fecha: formatDisplayDate(row.fecha),
    tiempoLectura: row.tiempo_lectura || '',
    resumen: row.resumen || '',
    contenido: row.contenido || ''
  };
}

function mapBlogToDb(post) {
  return {
    id: post.id,
    titulo: post.titulo,
    categoria: post.categoria || null,
    autor: post.autor || null,
    fecha: toIsoDate(post.fecha) || new Date().toISOString().slice(0, 10),
    tiempo_lectura: post.tiempoLectura || null,
    resumen: post.resumen || null,
    contenido: post.contenido || null,
    publicado: true
  };
}

async function replaceRows(table, rows, mapToDb) {
  if (!supabase) return;
  const mapped = rows.map(mapToDb);
  const ids = mapped.map((row) => row.id);

  const { error: upsertError } = await supabase.from(table).upsert(mapped);
  if (upsertError) throw upsertError;

  const { data: existing, error: readError } = await supabase.from(table).select('id');
  if (readError) throw readError;

  const extraIds = (existing || []).map((row) => row.id).filter((id) => !ids.includes(id));
  if (extraIds.length > 0) {
    const { error: deleteError } = await supabase.from(table).delete().in('id', extraIds);
    if (deleteError) throw deleteError;
  }
}

export async function hydrateFromSupabase(writeLocal) {
  if (!isSupabaseConfigured || !supabase) return false;

  const [pasillos, productos, banners, servicios, citas, clientes, blog] = await Promise.all([
    supabase.from('pasillos').select('*').order('orden'),
    supabase.from('productos').select('*'),
    supabase.from('banners').select('*').order('orden'),
    supabase.from('servicios').select('*'),
    supabase.from('citas').select('*').order('fecha', { ascending: false }),
    supabase.from('clientes').select('*'),
    supabase.from('blog_posts').select('*').eq('publicado', true)
  ]);

  const firstError = [pasillos, productos, banners, servicios, citas, clientes, blog]
    .find((result) => result.error)?.error;
  if (firstError) {
    console.error('No se pudo hidratar desde Supabase:', firstError);
    return false;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const hasSession = Boolean(sessionData?.session);

  writeLocal(KEYS.PASILLOS, (pasillos.data || []).map(mapPasilloFromDb));
  writeLocal(KEYS.PRODUCTOS, (productos.data || []).map(mapProductoFromDb));
  writeLocal(KEYS.BANNERS, (banners.data || []).map(mapBannerFromDb));
  writeLocal(KEYS.SERVICIOS, (servicios.data || []).map(mapServicioFromDb));

  if ((citas.data || []).length > 0 || hasSession) {
    writeLocal(KEYS.CITAS, (citas.data || []).map(mapCitaFromDb));
  }
  if ((clientes.data || []).length > 0 || hasSession) {
    writeLocal(KEYS.CLIENTES, (clientes.data || []).map(mapClienteFromDb));
  }
  writeLocal(KEYS.BLOG, (blog.data || []).map(mapBlogFromDb));
  return true;
}

export function syncStoreKey(key, data) {
  if (!isSupabaseConfigured || !supabase) return;

  const task = (async () => {
    switch (key) {
      case KEYS.PRODUCTOS:
        await replaceRows('productos', data, mapProductoToDb);
        break;
      case KEYS.BANNERS:
        await replaceRows('banners', data, mapBannerToDb);
        break;
      case KEYS.CITAS:
        await replaceRows('citas', data, mapCitaToDb);
        break;
      case KEYS.CLIENTES:
        await replaceRows('clientes', data, mapClienteToDb);
        break;
      case KEYS.BLOG:
        await replaceRows('blog_posts', data, mapBlogToDb);
        break;
      default:
        break;
    }
  })();

  task.catch((error) => {
    console.warn(`Supabase aún no pudo guardar ${key}:`, error.message || error);
  });
}
