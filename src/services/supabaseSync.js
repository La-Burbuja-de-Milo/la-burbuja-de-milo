import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { withProductPasillos, productPasillos } from '../lib/pasillos';
import { bannerFotoSrc, cloneBanner, normalizeBannerFoto } from '../lib/bannerFrames';

const KEYS = {
  BANNERS: 'milo_banners',
  PASILLOS: 'milo_pasillos',
  PRODUCTOS: 'milo_productos',
  CITAS: 'milo_citas',
  SERVICIOS: 'milo_servicios',
  CLIENTES: 'milo_clientes',
  BLOG: 'milo_blog',
  MOVIMIENTOS: 'milo_movimientos',
  AJUSTES: 'milo_ajustes'
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
  const pasillos = Array.isArray(row.pasillos) && row.pasillos.length
    ? row.pasillos.filter(Boolean)
    : (row.pasillo_id ? [row.pasillo_id] : ['skincare']);
  return withProductPasillos({
    id: row.id,
    nombre: row.nombre,
    pasillo: pasillos[0] || row.pasillo_id,
    pasillos,
    precio: Number(row.precio) || 0,
    moneda: row.moneda || 'COP',
    stock: Number(row.stock) || 0,
    enCamino: Boolean(row.en_camino),
    fechaLlegada: row.fecha_llegada || null,
    cuposReserva: Number(row.cupos_reserva) || 0,
    reservasActuales: Number(row.reservas_actuales) || 0,
    tag: row.tag || '',
    marca: row.marca || '',
    descripcion: row.descripcion || '',
    ingredientes: row.ingredientes || '',
    modoUso: row.modo_uso || '',
    imagen: row.imagen || '',
    stockMinimo: Number(row.stock_minimo) >= 0 ? Number(row.stock_minimo) : 3,
    variantes: Array.isArray(row.variantes) ? row.variantes : [],
    stockReal: row.stock_real === false || (Array.isArray(row.variantes) && row.variantes.some((item) => item?.stockReal === false))
      ? false
      : true,
    updatedAt: row.updated_at || null
  });
}

function mapProductoToDb(producto) {
  const normalized = withProductPasillos(producto);
  const pasillos = productPasillos(normalized);
  return {
    id: producto.id,
    nombre: producto.nombre,
    pasillo_id: pasillos[0] || 'skincare',
    pasillos,
    precio: Number(producto.precio) || 0,
    moneda: producto.moneda || 'COP',
    stock: Number(producto.stock) || 0,
    en_camino: Boolean(producto.enCamino),
    fecha_llegada: toIsoDate(producto.fechaLlegada),
    cupos_reserva: Number(producto.cuposReserva) || 0,
    reservas_actuales: Number(producto.reservasActuales) || 0,
    tag: producto.tag || null,
    marca: producto.marca || null,
    descripcion: producto.descripcion || null,
    ingredientes: producto.ingredientes || null,
    modo_uso: producto.modoUso || null,
    imagen: producto.imagen || null,
    stock_minimo: Number(producto.stockMinimo) >= 0 ? Number(producto.stockMinimo) : 3,
    stock_real: producto.stockReal !== false,
    variantes: Array.isArray(producto.variantes)
      ? producto.variantes.map((variante) => (
        producto.stockReal === false
          ? { ...variante, stockReal: false }
          : variante
      ))
      : []
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
    gradiente: row.gradiente || '',
    imagen: row.imagen || '',
    imagenes: Array.isArray(row.imagenes) ? row.imagenes : (row.imagen ? [row.imagen] : []),
    marcoLayout: row.marco_layout || '',
    marcoEstilo: row.marco_estilo || '',
    transicion: row.transicion || '',
    updatedAt: row.updated_at || null
  };
}

function mapBannerToDb(banner, index = 0) {
  const cloned = cloneBanner(banner);
  const imagenes = Array.isArray(cloned.imagenes)
    ? cloned.imagenes.map(normalizeBannerFoto).filter((item) => item.src)
    : (cloned.imagen ? [normalizeBannerFoto(cloned.imagen)] : []);
  return {
    id: cloned.id,
    tag: cloned.tag || null,
    titulo: cloned.titulo,
    descripcion: cloned.descripcion || null,
    boton_texto: cloned.botonTexto || null,
    boton_enlace: cloned.botonEnlace || null,
    boton_secundario_texto: cloned.botonSecundarioTexto || null,
    boton_secundario_enlace: cloned.botonSecundarioEnlace || null,
    activo: cloned.activo !== false,
    gradiente: cloned.gradiente || null,
    imagen: imagenes[0]?.src || bannerFotoSrc(cloned.imagen) || null,
    imagenes,
    marco_layout: cloned.marcoLayout || 'unica',
    marco_estilo: cloned.marcoEstilo || 'lleno',
    transicion: cloned.transicion || 'fundido',
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

function mapPasilloToDb(pasillo, index) {
  return {
    id: pasillo.id,
    nombre: pasillo.nombre,
    icon: pasillo.icon || 'Sparkles',
    orden: index
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
    recomendado: row.recomendado || '',
    imagen: row.imagen || ''
  };
}

function mapServicioToDb(servicio) {
  return {
    id: servicio.id,
    titulo: servicio.titulo,
    categoria: servicio.categoria || null,
    duracion_minutos: Number(servicio.duracionMinutos) || 60,
    precio: Number(servicio.precio) || 0,
    descripcion: servicio.descripcion || null,
    recomendado: servicio.recomendado || null,
    imagen: servicio.imagen || null,
    activo: servicio.activo !== false
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
    notasCRM: row.notas_crm || '',
    diagnostico: row.diagnostico || '',
    activosRecomendados: row.activos_recomendados || '',
    proximaSesion: row.proxima_sesion || '',
    skinConcierge: row.skin_concierge || ''
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
    notas_crm: cliente.notasCRM || null,
    diagnostico: cliente.diagnostico || null,
    activos_recomendados: cliente.activosRecomendados || null,
    proxima_sesion: cliente.proximaSesion || null,
    skin_concierge: cliente.skinConcierge || null
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
    contenido: row.contenido || '',
    imagen: row.imagen || ''
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
    imagen: post.imagen || null,
    publicado: true
  };
}

function mapMovimientoFromDb(row) {
  return {
    id: row.id,
    productoId: row.producto_id,
    productoNombre: row.producto_nombre || '',
    tipo: row.tipo,
    cantidad: Number(row.cantidad) || 0,
    delta: Number(row.delta) || 0,
    stockAntes: Number(row.stock_antes) || 0,
    stockDespues: Number(row.stock_despues) || 0,
    motivo: row.motivo || '',
    nota: row.nota || '',
    origen: row.origen || '',
    varianteId: row.variante_id || '',
    varianteNombre: row.variante_nombre || '',
    fecha: row.fecha
  };
}

export function mapAjustesFromDb(row) {
  if (!row) return null;
  return {
    promoActivo: row.promo_activo !== false,
    promoTexto: row.promo_texto || '',
    categoryCircles: Array.isArray(row.category_circles) ? row.category_circles : [],
    categoryCirclesAlign: row.category_circles_align || 'start',
    newsletterEmails: Array.isArray(row.newsletter_emails) ? row.newsletter_emails : [],
    updatedAt: row.updated_at || null
  };
}

function mapAjustesToDb(ajustes) {
  return {
    id: 'site',
    promo_activo: ajustes?.promoActivo !== false,
    promo_texto: ajustes?.promoTexto || null,
    category_circles: Array.isArray(ajustes?.categoryCircles) ? ajustes.categoryCircles : [],
    category_circles_align: ajustes?.categoryCirclesAlign || 'start',
    newsletter_emails: Array.isArray(ajustes?.newsletterEmails) ? ajustes.newsletterEmails : []
  };
}

function mimeFromDataUrl(value) {
  const match = String(value || '').match(/^data:([^;]+)/);
  return match?.[1] || 'image/jpeg';
}

function extFromMime(mime) {
  if (String(mime).includes('png')) return 'png';
  if (String(mime).includes('webp')) return 'webp';
  if (String(mime).includes('gif')) return 'gif';
  return 'jpg';
}

function isInlineImage(value) {
  return typeof value === 'string' && (value.startsWith('data:') || value.startsWith('blob:'));
}

async function uploadVitrinaAsset(pathBase, src) {
  if (!supabase || !isInlineImage(src)) return src;
  const mime = src.startsWith('data:') ? mimeFromDataUrl(src) : 'image/jpeg';
  const ext = extFromMime(mime);
  const path = `${pathBase}.${ext}`;
  let blob;
  try {
    const response = await fetch(src);
    blob = await response.blob();
  } catch {
    return src;
  }
  const { error } = await supabase.storage.from('vitrina').upload(path, blob, {
    upsert: true,
    contentType: blob.type || mime
  });
  if (error) {
    console.warn('No se pudo subir la foto a vitrina:', error.message || error);
    return src;
  }
  const { data } = supabase.storage.from('vitrina').getPublicUrl(path);
  return data?.publicUrl || src;
}

async function persistBannerImages(banners) {
  const next = [];
  for (const banner of banners || []) {
    const cloned = cloneBanner(banner);
    const fotos = Array.isArray(cloned.imagenes)
      ? cloned.imagenes
      : (cloned.imagen ? [cloned.imagen] : []);
    const imagenes = [];
    for (let index = 0; index < fotos.length; index += 1) {
      const foto = normalizeBannerFoto(fotos[index]);
      if (!foto.src) continue;
      imagenes.push({
        ...foto,
        src: await uploadVitrinaAsset(`banners/${cloned.id}/${index}`, foto.src)
      });
    }
    next.push({
      ...cloned,
      imagenes,
      imagen: imagenes[0]?.src || bannerFotoSrc(cloned.imagen) || ''
    });
  }
  return next;
}

async function persistAjustesImages(ajustes) {
  const circles = Array.isArray(ajustes?.categoryCircles) ? ajustes.categoryCircles : [];
  const categoryCircles = [];
  for (const circle of circles) {
    const imagen = circle?.imagen
      ? await uploadVitrinaAsset(`circles/${circle.id || 'item'}`, circle.imagen)
      : circle?.imagen;
    categoryCircles.push({ ...circle, imagen });
  }
  return { ...ajustes, categoryCircles };
}

function friendlySyncError(label, error) {
  const msg = error?.message || String(error || '');
  if (/row-level security|RLS/i.test(msg)) {
    return `Supabase rechazó ${label}: inicia sesión como gerente o aplica la migración de vitrina (rol gerente).`;
  }
  if (/schema cache|does not exist|Could not find the table/i.test(msg)) {
    return `Falta ${label} en Supabase. Ejecuta supabase/migrations/20261006090000_vitrina_publicar.sql en el SQL Editor.`;
  }
  return `No se pudo guardar ${label}: ${msg}`;
}

async function upsertAjustes(ajustes) {
  if (!supabase || !ajustes) return;
  const { error } = await supabase.from('ajustes').upsert(mapAjustesToDb(ajustes));
  if (error) throw error;
}

function mapMovimientoToDb(movimiento) {
  return {
    id: movimiento.id,
    producto_id: movimiento.productoId,
    producto_nombre: movimiento.productoNombre || null,
    tipo: movimiento.tipo,
    cantidad: Number(movimiento.cantidad) || 0,
    delta: Number(movimiento.delta) || 0,
    stock_antes: Number(movimiento.stockAntes) || 0,
    stock_despues: Number(movimiento.stockDespues) || 0,
    motivo: movimiento.motivo || null,
    nota: movimiento.nota || null,
    origen: movimiento.origen || null,
    variante_id: movimiento.varianteId || null,
    variante_nombre: movimiento.varianteNombre || null,
    fecha: movimiento.fecha || new Date().toISOString()
  };
}

async function upsertRows(table, rows, mapToDb) {
  if (!supabase || !Array.isArray(rows) || !rows.length) return;
  const mapped = rows.map(mapToDb);
  const { error } = await supabase.from(table).upsert(mapped);
  if (!error) return;
  if (table === 'productos') {
    const missingVariantes = /variantes|stock_real/i.test(error.message || '');
    const missingPasillos = /pasillos/i.test(error.message || '');
    if (missingVariantes || missingPasillos) {
      const fallback = mapped.map((row) => {
        const next = { ...row };
        if (missingVariantes) {
          delete next.variantes;
          delete next.stock_real;
        }
        if (missingPasillos) delete next.pasillos;
        return next;
      });
      const { error: retryError } = await supabase.from(table).upsert(fallback);
      if (retryError) throw retryError;
      return;
    }
  }
  throw error;
}

async function replaceRows(table, rows, mapToDb) {
  if (!supabase) return;
  const mapped = rows.map(mapToDb);
  const ids = mapped.map((row) => row.id);

  const { error: upsertError } = await supabase.from(table).upsert(mapped);
  if (upsertError) {
    const extraBanner = table === 'banners' && /imagenes|marco_layout|marco_estilo|transicion/i.test(upsertError.message || '');
    if (extraBanner) {
      const fallback = mapped.map(({ imagenes, marco_layout, marco_estilo, transicion, ...row }) => row);
      const { error: retryError } = await supabase.from(table).upsert(fallback);
      if (retryError) throw retryError;
    } else {
      throw upsertError;
    }
  }

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

  const movimientos = await supabase
    .from('inventario_movimientos')
    .select('*')
    .order('fecha', { ascending: false });
  if (!movimientos.error && (movimientos.data || []).length > 0) {
    writeLocal(KEYS.MOVIMIENTOS, movimientos.data.map(mapMovimientoFromDb));
  }

  const ajustes = await supabase.from('ajustes').select('*').eq('id', 'site').maybeSingle();
  if (!ajustes.error && ajustes.data) {
    writeLocal(KEYS.AJUSTES, mapAjustesFromDb(ajustes.data));
  }

  return true;
}

export function deleteRemoteRow(table, id) {
  if (!isSupabaseConfigured || !supabase || !id) return;
  supabase.from(table).delete().eq('id', id).then(({ error }) => {
    if (error) console.warn(`Supabase aún no pudo borrar ${table}:`, error.message || error);
  });
}

export function syncStoreKey(key, data) {
  if (!isSupabaseConfigured || !supabase) return;

  const task = (async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) return;

    switch (key) {
      case KEYS.PRODUCTOS:
        await upsertRows('productos', data, mapProductoToDb);
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
      case KEYS.SERVICIOS:
        await replaceRows('servicios', data, mapServicioToDb);
        break;
      case KEYS.PASILLOS:
        await replaceRows('pasillos', data, mapPasilloToDb);
        break;
      case KEYS.MOVIMIENTOS:
        await replaceRows('inventario_movimientos', data, mapMovimientoToDb);
        break;
      case KEYS.AJUSTES:
        await upsertAjustes(data);
        break;
      default:
        break;
    }
  })();

  task.catch((error) => {
    console.warn(`Supabase aún no pudo guardar ${key}:`, error.message || error);
  });
}

export async function publishCatalogToSupabase({ banners, ajustes, persistLocal } = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Supabase no está configurado en este entorno.' };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session) {
    return { ok: false, error: 'Inicia sesión como gerente en este mismo navegador para publicar.' };
  }

  const bannersReady = await persistBannerImages(banners);
  const ajustesReady = await persistAjustesImages(ajustes);
  if (typeof persistLocal === 'function') {
    persistLocal({ banners: bannersReady, ajustes: ajustesReady });
  }

  const errors = [];
  try {
    await replaceRows('banners', bannersReady, mapBannerToDb);
  } catch (error) {
    errors.push(friendlySyncError('banners', error));
  }
  try {
    await upsertAjustes(ajustesReady);
  } catch (error) {
    errors.push(friendlySyncError('ajustes', error));
  }

  if (errors.length) {
    return { ok: false, error: errors.join(' ') };
  }
  return { ok: true, message: 'Banners, círculos y barra promocional ya están en el sitio.' };
}
