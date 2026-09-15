/**
 * Almacén reactivo y persistente central para La Burbuja de Milo (CRM, Tienda, Citas y CMS)
 */

import { hydrateFromSupabase, syncStoreKey } from './supabaseSync';

const STORAGE_KEYS = {
  BANNERS: 'milo_banners',
  PASILLOS: 'milo_pasillos',
  PRODUCTOS: 'milo_productos',
  CITAS: 'milo_citas',
  SERVICIOS: 'milo_servicios',
  CLIENTES: 'milo_clientes',
  BLOG: 'milo_blog',
  CARRITO: 'milo_carrito',
  RESERVAS: 'milo_reservas'
};

// Datos semilla realistas de alta estética
const SEED_BANNERS = [
  {
    id: 'b1',
    tag: 'SALUD ESTÉTICA CONSCIENTE',
    titulo: 'Tu piel, tu santuario.',
    descripcion: 'La Burbuja de Milo: Diagnóstico facial científico, tratamientos en cabina y fórmulas libres de toxinas diseñadas para resultados reales.',
    botonTexto: 'Agendar Valoración',
    botonEnlace: '/citas',
    botonSecundarioTexto: 'Explorar Tienda',
    botonSecundarioEnlace: '/tienda',
    activo: true,
    gradiente: 'from-pink-500/15 via-purple-500/10 to-transparent'
  },
  {
    id: 'b2',
    tag: 'PRÓXIMOS ARRIBOS EXCLUSIVOS',
    titulo: 'Colección Botánica en Camino',
    descripcion: 'Aparta tus fórmulas favoritas antes de que se agoten en aduana. Precios especiales de preventa con entrega prioritaria.',
    botonTexto: 'Ver Productos en Camino',
    botonEnlace: '/tienda?filtro=en-camino',
    botonSecundarioTexto: 'Conoce los Ingredientes',
    botonSecundarioEnlace: '/blog',
    activo: true,
    gradiente: 'from-cyan-500/15 via-blue-500/10 to-transparent'
  }
];

const SEED_PASILLOS = [
  { id: 'todos', nombre: 'Todos los Pasillos', icon: 'Sparkles' },
  { id: 'skincare', nombre: 'Skincare Facial', icon: 'Droplets' },
  { id: 'capilar', nombre: 'Cuidado Capilar', icon: 'Wind' },
  { id: 'tratamientos', nombre: 'Tratamientos & Cabina', icon: 'CalendarHeart' },
  { id: 'nutricosmetica', nombre: 'Nutricosmética', icon: 'ShieldCheck' }
];

const SEED_PRODUCTOS = [
  {
    id: 'p1',
    nombre: 'Limpiador Botánico de Caléndula & Té Verde',
    pasillo: 'skincare',
    precio: 24.00,
    moneda: 'USD',
    stock: 16,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    tag: 'Bestseller',
    descripcion: 'Espuma delicada con pH fisiológico 5.5. Limpia profundamente los poros sin alterar el manto lipídico.',
    ingredientes: 'Extracto de Caléndula, Té Verde Matcha, Glicerina Vegetal, Centella.',
    modoUso: 'Aplicar mañana y noche sobre la piel húmeda con suaves masajes circulares.'
  },
  {
    id: 'p2',
    nombre: 'Serum Reparador Nocturno (Péptidos + HA)',
    pasillo: 'skincare',
    precio: 45.00,
    moneda: 'USD',
    stock: 9,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    tag: 'Favorito',
    descripcion: 'Complejo bio-activo nocturno con 5 cadenas de péptidos y ácido hialurónico triple peso molecular.',
    ingredientes: 'Péptido Matrixyl 3000, Ácido Hialurónico al 2%, Ceramidas NP, Niacinamida.',
    modoUso: 'Colocar 3-4 gotas sobre rostro y cuello limpio antes de la crema sellante.'
  },
  {
    id: 'p3',
    nombre: 'Protector Solar Mineral FPS 50+ Invisible Touch',
    pasillo: 'skincare',
    precio: 32.00,
    moneda: 'USD',
    stock: 22,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    tag: 'Esencial',
    descripcion: 'Filtro 100% mineral no nano, enriquecido con antioxidantes para bloquear radiación UVA/UVB y luz azul.',
    ingredientes: 'Óxido de Zinc 18%, Dióxido de Titanio, Resveratrol, Ectoína.',
    modoUso: 'Reaplicar cada 3 a 4 horas en zonas expuestas.'
  },
  {
    id: 'p4',
    nombre: 'Crema Restauradora Centella Asiática Pura (Madecassoside)',
    pasillo: 'skincare',
    precio: 38.00,
    moneda: 'USD',
    stock: 0,
    enCamino: true,
    fechaLlegada: '2026-09-28',
    cuposReserva: 20,
    reservasActuales: 8,
    tag: 'En Camino',
    descripcion: 'Tratamiento intensivo para barrera cutánea dañada, rojeces y sensibilidad extrema. Fórmulas coreanas frescas en tránsito internacional.',
    ingredientes: 'Centella Asiatica Extract 72%, Madecassoside, Pantenol al 5%, Alantoína.',
    modoUso: 'Sellar la rutina nocturna o usar como bálsamo SOS en zonas descamadas.'
  },
  {
    id: 'p5',
    nombre: 'Ampolla de Colágeno Marino Microencapsulado',
    pasillo: 'skincare',
    precio: 54.00,
    moneda: 'USD',
    stock: 0,
    enCamino: true,
    fechaLlegada: '2026-10-04',
    cuposReserva: 25,
    reservasActuales: 14,
    tag: 'Preventa',
    descripcion: 'Efecto lifting progresivo y reposición de elasticidad dérmica con nanovesículas de absorción inmediata.',
    ingredientes: 'Colágeno Marino Hidrolizado, Tripéptido de Cobre, Adenosina, Beta-Glucanos.',
    modoUso: '1 ampolla cada 3 noches por 1 mes como choque rejuvenecedor.'
  },
  {
    id: 'p6',
    nombre: 'Tónico Exfoliante con Ácido Mandélico 8%',
    pasillo: 'skincare',
    precio: 29.00,
    moneda: 'USD',
    stock: 12,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    tag: 'Nuevo',
    descripcion: 'AHA suave para textura irregular, poros obstruidos y manchas superficiales. Apto para piel sensible.',
    ingredientes: 'Ácido Mandélico 8%, Agua de Rosas Damascenas, Extracto de Regaliz.',
    modoUso: 'Usar 2-3 noches por semana tras la limpieza con toques suaves de algodón.'
  },
  {
    id: 'p7',
    nombre: 'Mascarilla Capilar de Queratina Vegetal & Macadamia',
    pasillo: 'capilar',
    precio: 28.00,
    moneda: 'USD',
    stock: 14,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    tag: 'Popular',
    descripcion: 'Reparación profunda de hebras quebradizas por decoloración o herramientas térmicas.',
    ingredientes: 'Proteína de Trigo Hidrolizada, Aceite de Macadamia, Pantenol, Aminoácidos.',
    modoUso: 'Dejar actuar de 10 a 15 minutos en medios y puntas después del shampoo.'
  },
  {
    id: 'p8',
    nombre: 'Serum Capilar Péptidos Densificadores Folículo Activo',
    pasillo: 'capilar',
    precio: 42.00,
    moneda: 'USD',
    stock: 0,
    enCamino: true,
    fechaLlegada: '2026-10-02',
    cuposReserva: 15,
    reservasActuales: 5,
    tag: 'En Camino',
    descripcion: 'Tratamiento no graso para el cuero cabelludo que estimula la fase anágena y frena la caída estacional.',
    ingredientes: 'Redensyl, Péptidos de Cobre, Cafeína Bio-disponible, Biotina.',
    modoUso: 'Aplicar unas gotas directo al cuero cabelludo seco y masajear sin enjuague.'
  },
  {
    id: 'p9',
    nombre: 'Glow Booster Nutricosmético (Biotina + Zinc + Vit C)',
    pasillo: 'nutricosmetica',
    precio: 36.00,
    moneda: 'USD',
    stock: 19,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    tag: 'Bestseller',
    descripcion: 'Cápsulas vegetales para fortalecer uñas, cabello y estimular la síntesis de colágeno natural.',
    ingredientes: 'Biotina 5000mcg, Zinc Quelado, Vitamina C Liposomal, Ácido Hialurónico Oral.',
    modoUso: 'Tomar 1 cápsula diaria con el desayuno.'
  }
];

const SEED_SERVICIOS = [
  {
    id: 's1',
    titulo: 'Valoración Facial Integral 3D',
    categoria: 'Diagnóstico',
    duracionMinutos: 60,
    precio: 35.00,
    descripcion: 'Análisis minucioso del microbioma y barrera cutánea con luz de Wood. Incluye diseño personalizado de rutina y prescripción de cabina.',
    recomendado: 'Ideal si es tu primera vez en La Burbuja de Milo.'
  },
  {
    id: 's2',
    titulo: 'Limpieza Facial Profunda con Hidrodermoabrasión',
    categoria: 'Higiene & Extracción',
    duracionMinutos: 75,
    precio: 65.00,
    descripcion: 'Vórtice de succión ultrasónica e infusión de activos calmantes sin enrojecimiento ni dolor.',
    recomendado: 'Recomendada cada 30 días.'
  },
  {
    id: 's3',
    titulo: 'Peeling Químico Renovador & Despigmentante',
    categoria: 'Renovación Celular',
    duracionMinutos: 50,
    precio: 70.00,
    descripcion: 'Exfoliación médica controlada con cóctel de alfahidroxiácidos para unificar el tono y suavizar textura.',
    recomendado: 'Excelente para manchas solares o marcas de acné.'
  },
  {
    id: 's4',
    titulo: 'Protocolo Glow Reafirmante con Radiofrecuencia',
    categoria: 'Anti-aging & Lifting',
    duracionMinutos: 80,
    precio: 85.00,
    descripcion: 'Estimulación térmica de fibroblastos combinada con masaje escultórico facial y máscara LED regenerativa.',
    recomendado: 'Lifting visible inmediato sin tiempo de recuperación.'
  },
  {
    id: 's5',
    titulo: 'Skin-Concierge Virtual (Asesoría Remota)',
    categoria: 'Virtual / Online',
    duracionMinutos: 40,
    precio: 25.00,
    descripcion: 'Videollamada privada donde revisamos tus productos actuales y ajustamos tu protocolo paso a paso.',
    recomendado: 'Perfecto si vives fuera de la ciudad o tienes poco tiempo.'
  }
];

const SEED_CITAS = [
  {
    id: 'c1',
    clienteId: 'cl1',
    clienteNombre: 'Camila Morales',
    clienteTelefono: '3001234567',
    clienteEmail: 'camila.morales@ejemplo.com',
    servicioId: 's1',
    servicioTitulo: 'Valoración Facial Integral 3D',
    fecha: '2026-09-18',
    hora: '10:00',
    duracionMinutos: 60,
    estado: 'Confirmada', // 'Pendiente', 'Confirmada', 'Realizada', 'Cancelada'
    notasCliente: 'Piel reactiva en mejillas, uso de retinol previo.',
    notasInternasCRM: 'Fototipo III. Sensibilidad eritematosa leve. Preparar cabina con tónico de centella fresca.'
  },
  {
    id: 'c2',
    clienteId: 'cl2',
    clienteNombre: 'Andrea Gómez',
    clienteTelefono: '3109876543',
    clienteEmail: 'andrea.gomez@ejemplo.com',
    servicioId: 's2',
    servicioTitulo: 'Limpieza Facial Profunda con Hidrodermoabrasión',
    fecha: '2026-09-19',
    hora: '14:30',
    duracionMinutos: 75,
    estado: 'Pendiente',
    notasCliente: 'Comedones cerrados en zona T.',
    notasInternasCRM: 'Interesada en rutinas coreanas y reserva de crema reparadora.'
  },
  {
    id: 'c3',
    clienteId: 'cl3',
    clienteNombre: 'Mariana Restrepo',
    clienteTelefono: '3157891234',
    clienteEmail: 'mariana.r@ejemplo.com',
    servicioId: 's3',
    servicioTitulo: 'Peeling Químico Renovador & Despigmentante',
    fecha: '2026-09-12',
    hora: '16:00',
    duracionMinutos: 50,
    estado: 'Realizada',
    notasCliente: 'Excelente tolerancia al ácido mandélico.',
    notasInternasCRM: 'Sesión 1/3 culminada. Citar para revisión y sesión 2 en 21 días.'
  }
];

const SEED_CLIENTES = [
  {
    id: 'cl1',
    nombre: 'Camila Morales',
    telefono: '3001234567',
    email: 'camila.morales@ejemplo.com',
    ciudad: 'Medellín',
    tipoPiel: 'Mixta reactiva / Sensible',
    fechaRegistro: '2026-08-10',
    citasCount: 2,
    pedidosCount: 3,
    reservasActivas: 1,
    notasCRM: 'Prefiere ser contactada por WhatsApp en las mañanas. Muy receptiva a ingredientes calmantes.'
  },
  {
    id: 'cl2',
    nombre: 'Andrea Gómez',
    telefono: '3109876543',
    email: 'andrea.gomez@ejemplo.com',
    ciudad: 'Bogotá',
    tipoPiel: 'Grasa con tendencia acneica',
    fechaRegistro: '2026-09-01',
    citasCount: 1,
    pedidosCount: 1,
    reservasActivas: 0,
    notasCRM: 'En proceso de despigmentación de manchas post-inflamatorias.'
  },
  {
    id: 'cl3',
    nombre: 'Mariana Restrepo',
    telefono: '3157891234',
    email: 'mariana.r@ejemplo.com',
    ciudad: 'Medellín',
    tipoPiel: 'Normal a Seca',
    fechaRegistro: '2026-07-22',
    citasCount: 3,
    pedidosCount: 4,
    reservasActivas: 1,
    notasCRM: 'Cliente VIP. Apartó la Ampolla de Colágeno Marino para su entrega en octubre.'
  }
];

const SEED_BLOG = [
  {
    id: 'post-1',
    titulo: 'Cómo reconstruir una barrera cutánea debilitada en 14 días',
    categoria: 'Ciencia Estética',
    autor: 'Equipo Clínico Milo',
    fecha: '10 Sep 2026',
    tiempoLectura: '4 min',
    resumen: 'Sensación de tirantez, ardor al aplicar productos básicos o rojeces repentinas son señales de un manto lipídico fisurado.',
    contenido: `La barrera cutánea es la primera línea de defensa inmunológica y biológica de nuestro cuerpo. Cuando la sobre-exfoliación, el clima seco o el uso desmedido de ácidos la vulneran, las ceramidas y los ácidos grasos esenciales se pierden.\n\nPara restaurarla eficazmente recomendamos:\n1. Suspender temporalmente retinoides y exfoliantes.\n2. Incorporar limpiadores oleosos o cremosos con pH balanceado.\n3. Aplicar sérums ricos en Madecassoside (Centella Asiática) y Pantenol.\n4. Sellar la hidratación con cremas que contengan proporciones fisiológicas de ceramidas.`
  },
  {
    id: 'post-2',
    titulo: 'Protección Solar Mineral vs Química: ¿Cuál beneficia más a tu rostro?',
    categoria: 'Ingredientes Conscientes',
    autor: 'Dra. Milo',
    fecha: '05 Sep 2026',
    tiempoLectura: '5 min',
    resumen: 'Analizamos los mecanismos de acción del óxido de zinc frente a filtros químicos tradicionales y su impacto en la salud de la piel.',
    contenido: `Los filtros físicos o minerales (como el óxido de zinc y dióxido de titanio) funcionan como un escudo reflector microscópico sobre la epidermis, sin requerir ser absorbidos para activarse.\n\nSon la opción predilecta tras procedimientos en cabina (como peelings, láser o hidrodermoabrasión) ya que no generan calor cutáneo residual y poseen propiedades antiinflamatorias naturales.`
  },
  {
    id: 'post-3',
    titulo: 'El arte de la Valoración Facial: Por qué los diagnósticos genéricos fallan',
    categoria: 'Tratamientos en Cabina',
    autor: 'Milo Studio',
    fecha: '28 Ago 2026',
    tiempoLectura: '3 min',
    resumen: 'Descubre en qué consiste una valoración con luz de Wood y cómo mapeamos las capas profundas de la dermis antes de tocar tu piel.',
    contenido: `Ninguna piel es estática. Cambia con tus niveles hormonales, tu alimentación y el estrés diario. Una valoración no solo determina si tu piel es "seca o grasa", sino el nivel de hidratación subepidérmica, elastosis solar incipiente y susceptibilidad a reactividad.`
  }
];

// Helper para leer/escribir en localStorage con fallback seguro
function loadData(key, seedData) {
  if (typeof window === 'undefined') return seedData;
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      localStorage.setItem(key, JSON.stringify(seedData));
      return seedData;
    }
    return JSON.parse(saved);
  } catch (err) {
    console.error(`Error al leer ${key} de localStorage:`, err);
    return seedData;
  }
}

function saveData(key, data, { sync = true } = {}) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('milo_store_updated'));
    if (sync) syncStoreKey(key, data);
  } catch (err) {
    console.error(`Error al guardar ${key} en localStorage:`, err);
  }
}

export async function hydrateMiloStore() {
  await hydrateFromSupabase((key, data) => saveData(key, data, { sync: false }));
}

export const MiloStore = {
  // === BANNERS ===
  getBanners: () => loadData(STORAGE_KEYS.BANNERS, SEED_BANNERS),
  saveBanners: (banners) => saveData(STORAGE_KEYS.BANNERS, banners),
  addBanner: (banner) => {
    const current = MiloStore.getBanners();
    const newBanner = { ...banner, id: `b_${Date.now()}` };
    MiloStore.saveBanners([newBanner, ...current]);
    return newBanner;
  },
  updateBanner: (id, updates) => {
    const current = MiloStore.getBanners();
    const updated = current.map(b => b.id === id ? { ...b, ...updates } : b);
    MiloStore.saveBanners(updated);
  },
  deleteBanner: (id) => {
    const current = MiloStore.getBanners();
    MiloStore.saveBanners(current.filter(b => b.id !== id));
  },

  // === PASILLOS ===
  getPasillos: () => loadData(STORAGE_KEYS.PASILLOS, SEED_PASILLOS),
  savePasillos: (pasillos) => saveData(STORAGE_KEYS.PASILLOS, pasillos),

  // === PRODUCTOS ===
  getProductos: () => loadData(STORAGE_KEYS.PRODUCTOS, SEED_PRODUCTOS),
  saveProductos: (productos) => saveData(STORAGE_KEYS.PRODUCTOS, productos),
  addProducto: (prod) => {
    const current = MiloStore.getProductos();
    const newProd = {
      ...prod,
      id: `p_${Date.now()}`,
      precio: Number(prod.precio) || 0,
      stock: Number(prod.stock) || 0,
      cuposReserva: Number(prod.cuposReserva) || 0,
      reservasActuales: Number(prod.reservasActuales) || 0
    };
    MiloStore.saveProductos([newProd, ...current]);
    return newProd;
  },
  updateProducto: (id, updates) => {
    const current = MiloStore.getProductos();
    const updated = current.map(p => p.id === id ? { ...p, ...updates } : p);
    MiloStore.saveProductos(updated);
  },
  deleteProducto: (id) => {
    const current = MiloStore.getProductos();
    MiloStore.saveProductos(current.filter(p => p.id !== id));
  },

  // === SERVICIOS ESTÉTICOS ===
  getServicios: () => loadData(STORAGE_KEYS.SERVICIOS, SEED_SERVICIOS),

  // === CITAS ===
  getCitas: () => loadData(STORAGE_KEYS.CITAS, SEED_CITAS),
  saveCitas: (citas) => saveData(STORAGE_KEYS.CITAS, citas),
  addCita: (citaData) => {
    const current = MiloStore.getCitas();
    const newCita = {
      ...citaData,
      id: `c_${Date.now()}`,
      estado: citaData.estado || 'Confirmada'
    };
    MiloStore.saveCitas([newCita, ...current]);

    // Asociar o actualizar cliente en CRM
    MiloStore.syncClienteFromCita(newCita);
    return newCita;
  },
  updateCitaEstado: (id, nuevoEstado, notasInternas) => {
    const current = MiloStore.getCitas();
    const updated = current.map(c => {
      if (c.id === id) {
        return {
          ...c,
          estado: nuevoEstado,
          ...(notasInternas ? { notasInternasCRM: notasInternas } : {})
        };
      }
      return c;
    });
    MiloStore.saveCitas(updated);
  },

  // === CLIENTES & CRM ===
  getClientes: () => loadData(STORAGE_KEYS.CLIENTES, SEED_CLIENTES),
  saveClientes: (clientes) => saveData(STORAGE_KEYS.CLIENTES, clientes),
  syncClienteFromCita: (cita) => {
    const clientes = MiloStore.getClientes();
    const idx = clientes.findIndex(cl => cl.email?.toLowerCase() === cita.clienteEmail?.toLowerCase() || cl.telefono === cita.clienteTelefono);
    if (idx >= 0) {
      clientes[idx].citasCount = (clientes[idx].citasCount || 0) + 1;
      if (cita.notasCliente) {
        clientes[idx].notasCRM = `${clientes[idx].notasCRM || ''}\n[${cita.fecha}]: ${cita.notasCliente}`.trim();
      }
      MiloStore.saveClientes([...clientes]);
    } else {
      const nuevoCliente = {
        id: `cl_${Date.now()}`,
        nombre: cita.clienteNombre,
        telefono: cita.clienteTelefono,
        email: cita.clienteEmail,
        tipoPiel: cita.tipoPiel || 'Por evaluar en cabina',
        fechaRegistro: new Date().toISOString().split('T')[0],
        citasCount: 1,
        pedidosCount: 0,
        reservasActivas: 0,
        notasCRM: `Cita agendada para ${cita.servicioTitulo} (${cita.fecha}). ${cita.notasCliente || ''}`.trim()
      };
      MiloStore.saveClientes([nuevoCliente, ...clientes]);
    }
  },
  updateClienteNotas: (clienteId, notas) => {
    const clientes = MiloStore.getClientes();
    const updated = clientes.map(cl => cl.id === clienteId ? { ...cl, notasCRM: notas } : cl);
    MiloStore.saveClientes(updated);
  },

  // === BLOG ===
  getBlogPosts: () => loadData(STORAGE_KEYS.BLOG, SEED_BLOG),
  saveBlogPosts: (posts) => saveData(STORAGE_KEYS.BLOG, posts),
  addBlogPost: (post) => {
    const current = MiloStore.getBlogPosts();
    const newPost = {
      ...post,
      id: `post_${Date.now()}`,
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    MiloStore.saveBlogPosts([newPost, ...current]);
    return newPost;
  },
  updateBlogPost: (id, updates) => {
    const current = MiloStore.getBlogPosts();
    MiloStore.saveBlogPosts(current.map(p => p.id === id ? { ...p, ...updates } : p));
  },
  deleteBlogPost: (id) => {
    const current = MiloStore.getBlogPosts();
    MiloStore.saveBlogPosts(current.filter(p => p.id !== id));
  },

  // === CARRITO & RESERVAS ===
  getCarrito: () => loadData(STORAGE_KEYS.CARRITO, []),
  saveCarrito: (items) => saveData(STORAGE_KEYS.CARRITO, items),
  addToCarrito: (producto, tipo = 'compra') => { // tipo: 'compra' | 'reserva_en_camino'
    const carrito = MiloStore.getCarrito();
    const existingIndex = carrito.findIndex(item => item.id === producto.id && item.tipo === tipo);
    if (existingIndex >= 0) {
      carrito[existingIndex].cantidad += 1;
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        pasillo: producto.pasillo,
        enCamino: !!producto.enCamino,
        fechaLlegada: producto.fechaLlegada,
        tipo,
        cantidad: 1
      });
    }
    MiloStore.saveCarrito([...carrito]);

    // Si es una reserva de producto en camino, incrementar contador de reservas
    if (producto.enCamino && tipo === 'reserva_en_camino') {
      const productos = MiloStore.getProductos();
      const updatedProds = productos.map(p => p.id === producto.id ? { ...p, reservasActuales: (p.reservasActuales || 0) + 1 } : p);
      MiloStore.saveProductos(updatedProds);
    }
  },
  removeFromCarrito: (productoId, tipo) => {
    const carrito = MiloStore.getCarrito();
    const updated = carrito.filter(item => !(item.id === productoId && item.tipo === tipo));
    MiloStore.saveCarrito(updated);
  },
  clearCarrito: () => {
    MiloStore.saveCarrito([]);
  },

  // Reset a fábrica
  resetAll: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.BANNERS);
    localStorage.removeItem(STORAGE_KEYS.PASILLOS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTOS);
    localStorage.removeItem(STORAGE_KEYS.CITAS);
    localStorage.removeItem(STORAGE_KEYS.SERVICIOS);
    localStorage.removeItem(STORAGE_KEYS.CLIENTES);
    localStorage.removeItem(STORAGE_KEYS.BLOG);
    localStorage.removeItem(STORAGE_KEYS.CARRITO);
    localStorage.removeItem(STORAGE_KEYS.RESERVAS);
    window.location.reload();
  }
};
