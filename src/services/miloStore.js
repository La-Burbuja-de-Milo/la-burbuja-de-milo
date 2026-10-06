/**
 * Almacén reactivo y persistente central para La Burbuja de Milo (CRM, Tienda, Citas y CMS)
 */

import { deleteRemoteRow, hydrateFromSupabase, publishCatalogToSupabase, syncStoreKey } from './supabaseSync';
import { COP_CODE, toCopAmount } from '../lib/money';
import { esStockGenerico, findVariante, hasNamedVariantes, stockEstado, withVariantes } from '../lib/variantes';
import { cloneBanner, withBannerFrames } from '../lib/bannerFrames';
import { withCategoryCircles, normalizeSiteLogo } from '../lib/categoryCircles';
import { productPasillos, withProductPasillos } from '../lib/pasillos';

export { esStockGenerico, findVariante, hasNamedVariantes, stockEstado };

const STORAGE_KEYS = {
  BANNERS: 'milo_banners',
  PASILLOS: 'milo_pasillos',
  PRODUCTOS: 'milo_productos',
  CITAS: 'milo_citas',
  SERVICIOS: 'milo_servicios',
  CLIENTES: 'milo_clientes',
  BLOG: 'milo_blog',
  CARRITO: 'milo_carrito',
  RESERVAS: 'milo_reservas',
  AJUSTES: 'milo_ajustes',
  MARCAS: 'milo_marcas',
  ETIQUETAS: 'milo_etiquetas',
  MOVIMIENTOS: 'milo_movimientos'
};

// Datos semilla realistas de alta estética
export const PASILLO_OPTIONS = [
  { id: 'skincare', nombre: 'Estética facial' },
  { id: 'corporal', nombre: 'Estética corporal' },
  { id: 'capilar', nombre: 'Cuidado capilar' },
  { id: 'bienestar', nombre: 'Bienestar y nutrición' },
  { id: 'nutricosmetica', nombre: 'Nutricosmética' },
  { id: 'tratamientos', nombre: 'Protocolos de cabina' }
];

const SEED_MARCAS = [
  { id: 'fuxion', nombre: 'fuXion' },
  { id: 'riman', nombre: 'Riman' },
  { id: 'milo-cabina', nombre: 'Milo Cabina' }
];

const SEED_ETIQUETAS = [
  { id: 'bestseller', nombre: 'Bestseller' },
  { id: 'favorito', nombre: 'Favorito' },
  { id: 'popular', nombre: 'Popular' },
  { id: 'esencial', nombre: 'Esencial' },
  { id: 'nuevo', nombre: 'Nuevo' },
  { id: 'en-camino', nombre: 'En Camino' },
  { id: 'preventa', nombre: 'Preventa' }
];

function slugify(value) {
  const slug = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `item-${Date.now()}`;
}

function toCopRecord(item) {
  return {
    ...item,
    precio: toCopAmount(item.precio, item.moneda),
    moneda: COP_CODE
  };
}

const SEED_BANNERS = [
  {
    id: 'b1',
    tag: 'CENTRO DE ESTÉTICA Y BIENESTAR',
    titulo: 'Rostro, cuerpo y bienestar.',
    descripcion: 'Cabina facial y corporal, protocolos de bienestar y tienda con marcas de salud estética como fuXion y Riman.',
    botonTexto: 'Agendar valoración',
    botonEnlace: '/citas',
    botonSecundarioTexto: 'Explorar tienda',
    botonSecundarioEnlace: '/tienda',
    activo: true,
    imagen: '',
    imagenes: [],
    marcoLayout: 'escalon',
    marcoEstilo: 'dorado',
    transicion: 'cascada',
    gradiente: 'from-pink-500/15 via-purple-500/10 to-transparent'
  },
  {
    id: 'b2',
    tag: 'PRÓXIMOS ARRIBOS',
    titulo: 'Preventas de cabina y bienestar',
    descripcion: 'Aparta fórmulas faciales, corporales y de nutrición antes de que se agoten. Entrega prioritaria al ingresar a inventario.',
    botonTexto: 'Ver productos en camino',
    botonEnlace: '/tienda?filtro=en-camino',
    botonSecundarioTexto: 'Leer el blog',
    botonSecundarioEnlace: '/blog',
    activo: true,
    imagen: '',
    imagenes: [],
    marcoLayout: 'diagonal',
    marcoEstilo: 'filo',
    transicion: 'deslizar',
    gradiente: 'from-cyan-500/15 via-blue-500/10 to-transparent'
  },
  {
    id: 'b3',
    tag: 'MARCAS EN VITRINA',
    titulo: 'fuXion y Riman, en casa.',
    descripcion: 'Nutrición funcional fuXion y rituales K-beauty Riman (Incellderm, Botalab y Lifening), junto a protocolos de cabina Milo.',
    botonTexto: 'Ver marcas',
    botonEnlace: '/tienda?marca=fuxion',
    botonSecundarioTexto: 'Ver Riman',
    botonSecundarioEnlace: '/tienda?marca=riman',
    activo: true,
    imagen: '',
    imagenes: [],
    marcoLayout: 'trio',
    marcoEstilo: 'polaroid',
    transicion: 'fundido',
    gradiente: 'from-amber-500/15 via-rose-500/10 to-transparent'
  }
];

const SEED_PASILLOS = [
  { id: 'todos', nombre: 'Toda la tienda', icon: 'Sparkles' },
  { id: 'skincare', nombre: 'Estética facial', icon: 'Droplets' },
  { id: 'corporal', nombre: 'Estética corporal', icon: 'Heart' },
  { id: 'capilar', nombre: 'Cuidado capilar', icon: 'Wind' },
  { id: 'bienestar', nombre: 'Bienestar y nutrición', icon: 'Leaf' },
  { id: 'nutricosmetica', nombre: 'Nutricosmética', icon: 'ShieldCheck' },
  { id: 'tratamientos', nombre: 'Protocolos de cabina', icon: 'CalendarHeart' }
];

const SEED_PRODUCTOS = [
  {
    id: 'p1',
    nombre: 'Limpiador Botánico de Caléndula & Té Verde',
    pasillo: 'skincare',
    precio: 24.00,
    moneda: 'COP',
    stock: 16,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    marca: 'Milo Cabina',
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
    moneda: 'COP',
    stock: 9,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    marca: 'Milo Cabina',
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
    moneda: 'COP',
    stock: 22,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    marca: 'Milo Cabina',
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
    moneda: 'COP',
    stock: 0,
    enCamino: true,
    fechaLlegada: '2026-09-28',
    cuposReserva: 20,
    reservasActuales: 8,
    marca: 'Milo Cabina',
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
    moneda: 'COP',
    stock: 0,
    enCamino: true,
    fechaLlegada: '2026-10-04',
    cuposReserva: 25,
    reservasActuales: 14,
    marca: 'Milo Cabina',
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
    moneda: 'COP',
    stock: 12,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    marca: 'Milo Cabina',
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
    moneda: 'COP',
    stock: 14,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    marca: 'Milo Cabina',
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
    moneda: 'COP',
    stock: 0,
    enCamino: true,
    fechaLlegada: '2026-10-02',
    cuposReserva: 15,
    reservasActuales: 5,
    marca: 'Milo Cabina',
    tag: 'En Camino',
    descripcion: 'Tratamiento no graso para el cuero cabelludo que estimula la fase anágena y frena la caída estacional.',
    ingredientes: 'Redensyl, Péptidos de Cobre, Cafeína Bio-disponible, Biotina.',
    modoUso: 'Aplicar unas gotas directo al cuero cabelludo seco y masajear sin enjuague.'
  },
  {
    id: 'p9',
    nombre: 'Glow Booster Nutricosmético (Biotina + Zinc + Vit C)',
    pasillo: 'nutricosmetica',
    pasillos: ['nutricosmetica', 'bienestar', 'capilar'],
    precio: 36.00,
    moneda: 'COP',
    stock: 19,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    marca: 'Milo Cabina',
    tag: 'Bestseller',
    descripcion: 'Cápsulas vegetales para fortalecer uñas, cabello y estimular la síntesis de colágeno natural.',
    ingredientes: 'Biotina 5000mcg, Zinc Quelado, Vitamina C Liposomal, Ácido Hialurónico Oral.',
    modoUso: 'Tomar 1 cápsula diaria con el desayuno.'
  },
  {
    id: 'p10',
    nombre: 'fuXion Cafezzino',
    pasillo: 'bienestar',
    marca: 'fuXion',
    precio: 42.00,
    moneda: 'COP',
    stock: 18,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    tag: 'Bestseller',
    descripcion: 'Bebida de café funcional fuXion para el ritual diario de bienestar: energía, metabolismo y acompañamiento de hábitos de peso.',
    ingredientes: 'Café, cacao, L-carnitina, cromo, extractos botánicos según fórmula fuXion.',
    modoUso: 'Disolver 1 sobre en agua caliente, preferiblemente en la mañana.',
    variantes: [
      { id: 'p10_7', nombre: '7 sobres', precio: 28.00, stock: 18, stockMinimo: 3 },
      { id: 'p10_28', nombre: '28 sobres', precio: 96.00, stock: 9, stockMinimo: 2 }
    ]
  },
  {
    id: 'p11',
    nombre: 'fuXion Prunex1',
    pasillo: 'bienestar',
    marca: 'fuXion',
    precio: 39.00,
    moneda: 'COP',
    stock: 14,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    tag: 'Popular',
    descripcion: 'Fórmula fuXion de fibra y ciruela para tránsito intestinal y limpieza suave, base frecuente de protocolos de bienestar en cabina.',
    ingredientes: 'Ciruela, fibra soluble, extractos botánicos según fórmula fuXion.',
    modoUso: 'Tomar 1 sobre diluido en agua, preferiblemente por la noche.',
    variantes: [
      { id: 'p11_7', nombre: '7 sobres', precio: 26.00, stock: 14, stockMinimo: 3 },
      { id: 'p11_28', nombre: '28 sobres', precio: 88.00, stock: 6, stockMinimo: 2 }
    ]
  },
  {
    id: 'p12',
    nombre: 'fuXion VitaXion',
    pasillo: 'bienestar',
    pasillos: ['bienestar', 'nutricosmetica'],
    marca: 'fuXion',
    precio: 46.00,
    moneda: 'COP',
    stock: 0,
    enCamino: true,
    fechaLlegada: '2026-10-08',
    cuposReserva: 18,
    reservasActuales: 6,
    tag: 'En Camino',
    descripcion: 'Complejo vitamínico fuXion para vitalidad diaria. Complementa tratamientos faciales y corporales desde adentro.',
    ingredientes: 'Vitaminas, minerales y antioxidantes según fórmula fuXion.',
    modoUso: 'Tomar según indicación del asesor de bienestar Milo.'
  },
  {
    id: 'p13',
    nombre: 'Riman Incellderm Snow Enzyme Cleanser EX',
    pasillo: 'skincare',
    marca: 'Riman',
    precio: 48.00,
    moneda: 'COP',
    stock: 11,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    tag: 'Favorito',
    descripcion: 'Limpiador enzimático K-beauty de la línea Incellderm: espuma ligera que retira maquillaje e impurezas sin resecar.',
    ingredientes: 'Enzimas (papaína, bromelina), ácido hialurónico, extractos botánicos Incellderm.',
    modoUso: 'Masajear sobre el rostro húmedo mañana y noche y enjuagar.'
  },
  {
    id: 'p14',
    nombre: 'Riman Incellderm Moisture Layer Sunscreen SPF 50+',
    pasillo: 'skincare',
    marca: 'Riman',
    precio: 44.00,
    moneda: 'COP',
    stock: 8,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    tag: 'Esencial',
    descripcion: 'Protección solar hidratante de Incellderm, con complejo de ácido hialurónico. Cierre del protocolo facial en cabina.',
    ingredientes: 'Filtros de amplio espectro SPF 50+, complejo de ácido hialurónico, antioxidantes.',
    modoUso: 'Aplicar como último paso de la rutina de día y reaplicar en exposición solar.'
  },
  {
    id: 'p15',
    nombre: 'Riman Botalab Suamel Nourishing Body Wash',
    pasillo: 'corporal',
    marca: 'Riman',
    precio: 34.00,
    moneda: 'COP',
    stock: 16,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    tag: 'Nuevo',
    descripcion: 'Gel de baño nutritivo de la línea Botalab para el cuidado corporal diario, alineado con los protocolos de cabina corporal.',
    ingredientes: 'Fórmula vegana Botalab, aceites botánicos, tensioactivos suaves.',
    modoUso: 'Aplicar sobre el cuerpo húmedo, masajear y enjuagar.',
    variantes: [
      { id: 'p15_250', nombre: '250 ml', precio: 34.00, stock: 16, stockMinimo: 3 },
      { id: 'p15_500', nombre: '500 ml', precio: 54.00, stock: 7, stockMinimo: 2 }
    ]
  },
  {
    id: 'p16',
    nombre: 'Riman Lifening Beauty Collagen',
    pasillo: 'bienestar',
    marca: 'Riman',
    precio: 52.00,
    moneda: 'COP',
    stock: 0,
    enCamino: true,
    fechaLlegada: '2026-10-12',
    cuposReserva: 20,
    reservasActuales: 9,
    tag: 'Preventa',
    descripcion: 'Colágeno hidrolizado Lifening para belleza de adentro hacia afuera: piel, cabello, uñas y acompañamiento de reafirmación corporal.',
    ingredientes: 'Péptidos de colágeno hidrolizado, vitamina C, ácido hialurónico, zinc, biotina.',
    modoUso: 'Disolver 1 a 2 medidas en agua o infusión, una vez al día.'
  },
  {
    id: 'p17',
    nombre: 'Gel Reafirmante Corporal Cafeína & Centella',
    pasillo: 'corporal',
    marca: 'Milo Cabina',
    precio: 38.00,
    moneda: 'COP',
    stock: 13,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    tag: 'Popular',
    descripcion: 'Gel de cabina para abdomen, glúteos y piernas. Complementa drenaje linfático y radiofrecuencia corporal.',
    ingredientes: 'Cafeína, centella asiática, mentol vegetal, extracto de hiedra.',
    modoUso: 'Masajear en círculos ascendentes mañana y noche sobre piel limpia.'
  },
  {
    id: 'p18',
    nombre: 'Aceite de Masaje Corporal de Almendras & Romero',
    pasillo: 'corporal',
    marca: 'Milo Cabina',
    precio: 27.00,
    moneda: 'COP',
    stock: 20,
    enCamino: false,
    fechaLlegada: null,
    cuposReserva: 0,
    reservasActuales: 0,
    tag: 'Esencial',
    descripcion: 'Aceite de cabina para masaje relajante, circulación y ritual de bienestar en casa.',
    ingredientes: 'Aceite de almendras dulces, romero, vitamina E, lavanda.',
    modoUso: 'Calentar 3 a 4 gotas entre las manos y aplicar con masaje lento.'
  }
];

const SEED_SERVICIOS = [
  {
    id: 's1',
    titulo: 'Valoración Integral Facial, Corporal y Bienestar',
    categoria: 'Diagnóstico',
    duracionMinutos: 60,
    precio: 35.00,
    descripcion: 'Primera cita del centro: diagnóstico facial, mapa corporal y hábitos de bienestar. Incluye prescripción de cabina y de tienda (fuXion, Riman u otras marcas).',
    recomendado: 'Ideal si es tu primera vez en La Burbuja de Milo.'
  },
  {
    id: 's2',
    titulo: 'Limpieza Facial Profunda con Hidrodermoabrasión',
    categoria: 'Facial',
    duracionMinutos: 75,
    precio: 65.00,
    descripcion: 'Vórtice de succión ultrasónica e infusión de activos calmantes sin enrojecimiento ni dolor.',
    recomendado: 'Recomendada cada 30 días.'
  },
  {
    id: 's3',
    titulo: 'Peeling Químico Renovador & Despigmentante',
    categoria: 'Facial',
    duracionMinutos: 50,
    precio: 70.00,
    descripcion: 'Exfoliación médica controlada con cóctel de alfahidroxiácidos para unificar el tono y suavizar textura.',
    recomendado: 'Excelente para manchas solares o marcas de acné.'
  },
  {
    id: 's4',
    titulo: 'Protocolo Glow Reafirmante con Radiofrecuencia',
    categoria: 'Facial',
    duracionMinutos: 80,
    precio: 85.00,
    descripcion: 'Estimulación térmica de fibroblastos combinada con masaje escultórico facial y máscara LED regenerativa.',
    recomendado: 'Lifting visible inmediato sin tiempo de recuperación.'
  },
  {
    id: 's5',
    titulo: 'Concierge de bienestar (asesoría remota)',
    categoria: 'Bienestar',
    duracionMinutos: 40,
    precio: 25.00,
    descripcion: 'Videollamada para revisar rutina facial, corporal y nutrición (fuXion, Riman u otras marcas) y ajustar el protocolo.',
    recomendado: 'Perfecto si vives fuera de la ciudad o tienes poco tiempo.'
  },
  {
    id: 's6',
    titulo: 'Drenaje Linfático Corporal',
    categoria: 'Corporal',
    duracionMinutos: 70,
    precio: 68.00,
    descripcion: 'Maniobra manual para retener líquidos, pesadez de piernas y acompañamiento de hábitos de peso y bienestar.',
    recomendado: 'Ideal antes o después de protocolos reafirmantes.'
  },
  {
    id: 's7',
    titulo: 'Masaje Relajante de Bienestar',
    categoria: 'Bienestar',
    duracionMinutos: 60,
    precio: 55.00,
    descripcion: 'Sesión de descarga muscular y ritual sensorial. Cierra con recomendación de aceite de cabina o nutrición funcional.',
    recomendado: 'Para estrés, tensión de cuello y espalda o autocuidado mensual.'
  },
  {
    id: 's8',
    titulo: 'Protocolo Reafirmante Corporal',
    categoria: 'Corporal',
    duracionMinutos: 80,
    precio: 82.00,
    descripcion: 'Radiofrecuencia o cavitación según valoración, gel reafirmante y mapa de continuidad en casa.',
    recomendado: 'Abdomen, glúteos, brazos o piernas según objetivo.'
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
    notasCRM: 'Prefiere ser contactada por WhatsApp en las mañanas. Muy receptiva a ingredientes calmantes.',
    diagnostico: 'Barrera cutánea normal a mixta, con reactividad en mejillas',
    activosRecomendados: 'Centella asiática, ácido hialurónico, filtro mineral',
    proximaSesion: 'Limpieza profunda e hidratación ultrasónica',
    skinConcierge: 'Equipo clínico Milo'
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
    notasCRM: 'En proceso de despigmentación de manchas post-inflamatorias.',
    diagnostico: 'Piel grasa con tendencia acneica y manchas post-inflamatorias',
    activosRecomendados: 'Ácido mandélico, niacinamida, zinc',
    proximaSesion: 'Limpieza facial profunda con hidrodermoabrasión',
    skinConcierge: 'Asesoría clínica Milo'
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
    notasCRM: 'Cliente VIP. Apartó la Ampolla de Colágeno Marino para su entrega en octubre.',
    diagnostico: 'Piel normal a seca, con pérdida de luminosidad',
    activosRecomendados: 'Péptidos, ceramidas, vitamina C liposomal',
    proximaSesion: 'Sesión 2 de peeling despigmentante en 21 días',
    skinConcierge: 'Comité clínico Milo'
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
  },
  {
    id: 'post-4',
    titulo: 'Bienestar de adentro hacia afuera: nutrición y cabina',
    categoria: 'Bienestar',
    autor: 'Equipo Milo',
    fecha: '14 Sep 2026',
    tiempoLectura: '4 min',
    resumen: 'Cómo combinamos protocolos faciales y corporales con nutrición funcional de marcas como fuXion, sin reducir el centro a un solo órgano.',
    contenido: `La Burbuja de Milo no es solo un espacio de piel. Es un centro de estética facial, corporal y bienestar, con tienda de salud estética.\n\nEn cabina trabajamos el rostro, el contorno corporal y la descarga de estrés. En casa, el hábito diario —una bebida fuXion, un colágeno Lifening o un gel reafirmante— sostiene el resultado.\n\nLa valoración integral mira tres capas: lo que se ve en piel, lo que se siente en el cuerpo y lo que se nutre.`
  },
  {
    id: 'post-5',
    titulo: 'Riman en cabina: Incellderm, Botalab y Lifening',
    categoria: 'Marcas',
    autor: 'Milo Studio',
    fecha: '12 Sep 2026',
    tiempoLectura: '3 min',
    resumen: 'Por qué integramos K-beauty Riman en facial, corporal y nutrición, junto a otras marcas de bienestar que ya usamos en el centro.',
    contenido: `Riman articula tres líneas que coinciden con nuestras cabinas: Incellderm para el rostro, Botalab para cuerpo y cabello, y Lifening para belleza de adentro hacia afuera.\n\nNo sustituyen al diagnóstico. El concierge Milo elige qué ritual tiene sentido para ti, combinando Riman, fuXion y fórmulas de cabina según objetivo: glow facial, reafirmación o vitalidad.`
  }
];

const SEED_AJUSTES = {
  promoActivo: true,
  promoTexto: 'Centro de estética facial, corporal y bienestar | 15% en tu primera compra con código MILO15',
  newsletterEmails: [],
  categoryCircles: [],
  categoryCirclesAlign: 'start',
  logo: normalizeSiteLogo()
};

const LEGACY_PROMO = 'Bienvenida a La Burbuja de Milo | 15% en tu primera compra con código MILO15';
const LEGACY_BANNER_TITLES = new Set(['Tu piel, tu santuario.', 'Colección Botánica en Camino']);
const LEGACY_SERVICIO_TITLES = new Set([
  'Valoración Facial Integral 3D',
  'Skin-Concierge Virtual (Asesoría Remota)'
]);

function mergeById(current, seed) {
  if (!Array.isArray(current)) return seed;
  const have = new Set(current.map((item) => item.id));
  const extra = seed.filter((item) => item.id && !have.has(item.id));
  return extra.length ? [...current, ...extra] : current;
}

function mergePasillos(current, seed) {
  if (!Array.isArray(current)) return seed;
  const have = new Set(current.map((item) => item.id));
  const extra = seed.filter((item) => item.id && !have.has(item.id));
  return extra.length ? [...current, ...extra] : current;
}

function applyCatalogMerge(key, data, seedData) {
  if (!Array.isArray(seedData) || !seedData[0]?.id) {
    if (key === STORAGE_KEYS.AJUSTES && data?.promoTexto === LEGACY_PROMO) {
      return { ...data, promoTexto: SEED_AJUSTES.promoTexto };
    }
    return data;
  }

  let next = key === STORAGE_KEYS.PASILLOS
    ? mergePasillos(data, seedData)
    : mergeById(data, seedData);

  if (key === STORAGE_KEYS.BANNERS) {
    next = next.map((banner) => {
      const copy = cloneBanner(banner);
      const seed = SEED_BANNERS.find((item) => item.id === copy.id);
      if (seed && LEGACY_BANNER_TITLES.has(copy.titulo)) {
        const seedCopy = cloneBanner(seed);
        return cloneBanner({
          ...copy,
          ...seedCopy,
          imagen: copy.imagen || seedCopy.imagen,
          imagenes: copy.imagenes?.length ? copy.imagenes : seedCopy.imagenes
        });
      }
      if (seed && !copy.marcoLayout) {
        return cloneBanner({
          ...copy,
          marcoLayout: seed.marcoLayout,
          marcoEstilo: copy.marcoEstilo || seed.marcoEstilo,
          transicion: copy.transicion || seed.transicion
        });
      }
      return copy;
    });
  }

  if (key === STORAGE_KEYS.SERVICIOS) {
    next = next.map((servicio) => {
      const seed = SEED_SERVICIOS.find((item) => item.id === servicio.id);
      if (seed && LEGACY_SERVICIO_TITLES.has(servicio.titulo)) {
        return { ...servicio, ...seed, imagen: servicio.imagen || seed.imagen };
      }
      return servicio;
    }).map(toCopRecord);
  }

  if (key === STORAGE_KEYS.PRODUCTOS) {
    next = next.map((item) => withProductPasillos(withVariantes(toCopRecord(item))));
  }

  return next;
}

function readRaw(key) {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function parseStamp(value) {
  const time = Date.parse(value || '');
  return Number.isFinite(time) ? time : 0;
}

function stampNow() {
  return new Date().toISOString();
}

function bannerPhotoWeight(banner) {
  const fotos = Array.isArray(banner?.imagenes) ? banner.imagenes : [];
  const srcs = fotos
    .map((item) => (typeof item === 'string' ? item : item?.src || ''))
    .filter(Boolean);
  if (!srcs.length && banner?.imagen) {
    srcs.push(typeof banner.imagen === 'string' ? banner.imagen : banner.imagen.src || '');
  }
  return {
    hasLocal: srcs.some((src) => String(src).startsWith('data:') || String(src).startsWith('blob:')),
    bytes: srcs.reduce((total, src) => total + String(src).length, 0),
    stamp: parseStamp(banner?.updatedAt)
  };
}

function pickRicherBanner(local, remote) {
  if (!local) return remote;
  if (!remote) return local;
  const localWeight = bannerPhotoWeight(local);
  const remoteWeight = bannerPhotoWeight(remote);
  if (localWeight.hasLocal && !remoteWeight.hasLocal) return local;
  if (remoteWeight.hasLocal && !localWeight.hasLocal) return remote;
  if (localWeight.bytes !== remoteWeight.bytes) {
    return localWeight.bytes > remoteWeight.bytes ? local : remote;
  }
  if (localWeight.stamp !== remoteWeight.stamp) {
    return localWeight.stamp >= remoteWeight.stamp ? local : remote;
  }
  return local;
}

function mergeBannersPreferLocal(local, remote) {
  const localList = Array.isArray(local) ? local : [];
  const remoteList = Array.isArray(remote) ? remote : [];
  const localMap = new Map(localList.map((item) => [item.id, item]));
  const remoteMap = new Map(remoteList.map((item) => [item.id, item]));
  const seen = new Set();
  const order = [
    ...localList.map((item) => item.id),
    ...remoteList.map((item) => item.id)
  ].filter((id) => {
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  return order.map((id) => pickRicherBanner(localMap.get(id), remoteMap.get(id)));
}

function circlesHavePhotos(circles) {
  return (circles || []).some((circle) => String(circle?.imagen || '').length > 20);
}

function logoSrc(logo) {
  if (typeof logo === 'string') return logo;
  return String(logo?.imagen || '');
}

function logoHasPhoto(logo) {
  return logoSrc(logo).length > 20;
}

function logoHasInlinePhoto(logo) {
  const src = logoSrc(logo);
  return src.startsWith('data:') || src.startsWith('blob:');
}

function circlesHaveInlinePhotos(circles) {
  return (circles || []).some((circle) => {
    const src = String(circle?.imagen || '');
    return src.startsWith('data:') || src.startsWith('blob:');
  });
}

function mergeAjustesPreferLocal(local, remote) {
  if (!local) return remote || null;
  if (!remote) return local;
  const localCircles = Array.isArray(local.categoryCircles) ? local.categoryCircles : [];
  const remoteCircles = Array.isArray(remote.categoryCircles) ? remote.categoryCircles : [];
  const localHasPhotos = circlesHavePhotos(localCircles);
  const remoteHasPhotos = circlesHavePhotos(remoteCircles);
  const localIsNewer = parseStamp(local.updatedAt) >= parseStamp(remote.updatedAt);
  const keepLocalCircles = circlesHaveInlinePhotos(localCircles)
    || (localHasPhotos && !remoteHasPhotos)
    || (localHasPhotos && remoteHasPhotos && localIsNewer);
  const keepLocalPromo = localIsNewer;
  const localLogo = normalizeSiteLogo(local.logo);
  const remoteLogo = normalizeSiteLogo(remote.logo);
  const keepLocalLogo = logoHasInlinePhoto(localLogo)
    || (logoHasPhoto(localLogo) && !logoHasPhoto(remoteLogo))
    || (logoHasPhoto(localLogo) && logoHasPhoto(remoteLogo) && localIsNewer)
    || localIsNewer;
  return {
    ...remote,
    ...local,
    promoActivo: keepLocalPromo ? local.promoActivo : remote.promoActivo,
    promoTexto: keepLocalPromo ? (local.promoTexto || remote.promoTexto) : (remote.promoTexto || local.promoTexto),
    logo: keepLocalLogo ? localLogo : remoteLogo,
    categoryCircles: keepLocalCircles ? localCircles : remoteCircles,
    categoryCirclesAlign: keepLocalCircles
      ? (local.categoryCirclesAlign || remote.categoryCirclesAlign)
      : (remote.categoryCirclesAlign || local.categoryCirclesAlign),
    newsletterEmails: [...new Set([
      ...(Array.isArray(remote.newsletterEmails) ? remote.newsletterEmails : []),
      ...(Array.isArray(local.newsletterEmails) ? local.newsletterEmails : [])
    ])],
    updatedAt: keepLocalPromo ? local.updatedAt : remote.updatedAt
  };
}

function mergeProductosPreferLocal(local, remote) {
  const localList = Array.isArray(local) ? local : [];
  const remoteList = Array.isArray(remote) ? remote : [];
  const localMap = new Map(localList.map((item) => [item.id, item]));
  const remoteMap = new Map(remoteList.map((item) => [item.id, item]));
  const ids = [...new Set([...remoteMap.keys(), ...localMap.keys()])];
  return ids.map((id) => {
    const localItem = localMap.get(id);
    const remoteItem = remoteMap.get(id);
    if (!localItem) return remoteItem;
    if (!remoteItem) return localItem;
    if (parseStamp(localItem.updatedAt) >= parseStamp(remoteItem.updatedAt)) return localItem;
    const remoteVars = Array.isArray(remoteItem.variantes) ? remoteItem.variantes : [];
    const localVars = Array.isArray(localItem.variantes) ? localItem.variantes : [];
    if (!remoteVars.length && localVars.length) {
      return {
        ...remoteItem,
        variantes: localVars,
        precio: localItem.precio,
        stockReal: localItem.stockReal,
        updatedAt: localItem.updatedAt
      };
    }
    return remoteItem;
  });
}

function loadData(key, seedData) {
  if (typeof window === 'undefined') return seedData;
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      const initial = applyCatalogMerge(key, seedData, seedData);
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    const data = JSON.parse(saved);
    const next = applyCatalogMerge(key, data, seedData);
    if (JSON.stringify(data) !== JSON.stringify(next)) {
      localStorage.setItem(key, JSON.stringify(next));
    }
    return next;
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

function makeMovimiento({
  id,
  producto,
  variante,
  tipo,
  cantidad,
  delta,
  stockAntes,
  stockDespues,
  motivo,
  nota,
  origen
}) {
  return {
    id: id || `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    productoId: producto.id,
    productoNombre: producto.nombre,
    varianteId: variante?.id || '',
    varianteNombre: variante?.nombre || '',
    tipo,
    cantidad,
    delta,
    stockAntes,
    stockDespues,
    motivo: motivo || '',
    nota: nota || '',
    origen: origen || 'manual',
    fecha: new Date().toISOString()
  };
}

function seedMovimientosFromStock(productos) {
  return (productos || [])
    .filter((product) => !product.enCamino && !esStockGenerico(product))
    .flatMap((product) => (product.variantes || [])
      .filter((variante) => Number(variante.stock) > 0)
      .map((variante) => makeMovimiento({
        id: `m_init_${product.id}_${variante.id}`,
        producto: product,
        variante,
        tipo: 'entrada',
        cantidad: Number(variante.stock),
        delta: Number(variante.stock),
        stockAntes: 0,
        stockDespues: Number(variante.stock),
        motivo: 'Inventario inicial',
        origen: 'sistema'
      })));
}

function ensureMovimientos() {
  const saved = loadData(STORAGE_KEYS.MOVIMIENTOS, []);
  if (saved.length > 0) return saved;
  const seeded = seedMovimientosFromStock(loadData(STORAGE_KEYS.PRODUCTOS, SEED_PRODUCTOS));
  if (seeded.length) {
    saveData(STORAGE_KEYS.MOVIMIENTOS, seeded);
    return seeded;
  }
  return saved;
}

export async function hydrateMiloStore() {
  const seedByKey = {
    [STORAGE_KEYS.BANNERS]: SEED_BANNERS,
    [STORAGE_KEYS.PASILLOS]: SEED_PASILLOS,
    [STORAGE_KEYS.PRODUCTOS]: SEED_PRODUCTOS,
    [STORAGE_KEYS.SERVICIOS]: SEED_SERVICIOS,
    [STORAGE_KEYS.BLOG]: SEED_BLOG,
    [STORAGE_KEYS.MARCAS]: SEED_MARCAS,
    [STORAGE_KEYS.ETIQUETAS]: SEED_ETIQUETAS,
    [STORAGE_KEYS.MOVIMIENTOS]: [],
    [STORAGE_KEYS.AJUSTES]: SEED_AJUSTES
  };
  await hydrateFromSupabase((key, data) => {
    let merged = data;
    if (key === STORAGE_KEYS.PRODUCTOS) merged = mergeProductosPreferLocal(readRaw(key), data);
    if (key === STORAGE_KEYS.BANNERS) merged = mergeBannersPreferLocal(readRaw(key), data);
    if (key === STORAGE_KEYS.AJUSTES) merged = mergeAjustesPreferLocal(readRaw(key), data);
    saveData(key, applyCatalogMerge(key, merged ?? seedByKey[key], seedByKey[key] ?? merged), { sync: false });
  });
}

export const MiloStore = {
  // === BANNERS ===
  getBanners: () => loadData(STORAGE_KEYS.BANNERS, SEED_BANNERS).map((banner) => withBannerFrames(cloneBanner(banner))),
  saveBanners: (banners) => saveData(
    STORAGE_KEYS.BANNERS,
    (banners || []).map((banner) => cloneBanner({ ...banner, updatedAt: stampNow() }))
  ),
  addBanner: (banner) => {
    const current = loadData(STORAGE_KEYS.BANNERS, SEED_BANNERS).map(cloneBanner);
    const newBanner = withBannerFrames({ ...cloneBanner(banner), id: `b_${Date.now()}` });
    MiloStore.saveBanners([cloneBanner(newBanner), ...current]);
    return newBanner;
  },
  updateBanner: (id, updates) => {
    if (!id || id === 'fallback') return;
    const current = loadData(STORAGE_KEYS.BANNERS, SEED_BANNERS).map(cloneBanner);
    const updated = current.map((item) => {
      if (item.id !== id) return item;
      return cloneBanner({ ...item, ...cloneBanner(updates), id: item.id });
    });
    MiloStore.saveBanners(updated);
  },
  deleteBanner: (id) => {
    const current = loadData(STORAGE_KEYS.BANNERS, SEED_BANNERS).map(cloneBanner);
    MiloStore.saveBanners(current.filter((item) => item.id !== id));
  },

  // === PASILLOS ===
  getPasillos: () => loadData(STORAGE_KEYS.PASILLOS, SEED_PASILLOS),
  savePasillos: (pasillos) => saveData(STORAGE_KEYS.PASILLOS, pasillos),
  addPasillo: (pasillo) => {
    const current = MiloStore.getPasillos();
    const id = slugify(pasillo.nombre);
    const uniqueId = current.some((item) => item.id === id) ? `${id}-${Date.now()}` : id;
    const nuevo = { id: uniqueId, nombre: pasillo.nombre.trim(), icon: pasillo.icon || 'Sparkles' };
    MiloStore.savePasillos([...current, nuevo]);
    return nuevo;
  },
  updatePasillo: (id, updates) => {
    if (id === 'todos' && updates.nombre && updates.nombre.trim() === '') return;
    const current = MiloStore.getPasillos();
    MiloStore.savePasillos(current.map((item) => (item.id === id ? { ...item, ...updates, nombre: updates.nombre?.trim() || item.nombre } : item)));
  },
  deletePasillo: (id) => {
    if (id === 'todos') return;
    const current = MiloStore.getPasillos();
    MiloStore.savePasillos(current.filter((item) => item.id !== id));
    const productos = MiloStore.getProductos().map((product) => {
      const ids = productPasillos(product).filter((item) => item !== id);
      if (ids.length === productPasillos(product).length) return product;
      return withProductPasillos({ ...product, pasillos: ids.length ? ids : ['skincare'] });
    });
    MiloStore.saveProductos(productos);
  },

  getMarcas: () => loadData(STORAGE_KEYS.MARCAS, SEED_MARCAS),
  saveMarcas: (marcas) => saveData(STORAGE_KEYS.MARCAS, marcas, { sync: false }),
  addMarca: (marca) => {
    const current = MiloStore.getMarcas();
    const id = slugify(marca.nombre);
    const uniqueId = current.some((item) => item.id === id) ? `${id}-${Date.now()}` : id;
    const nuevo = { id: uniqueId, nombre: marca.nombre.trim() };
    MiloStore.saveMarcas([...current, nuevo]);
    return nuevo;
  },
  updateMarca: (id, updates) => {
    const current = MiloStore.getMarcas();
    const prev = current.find((item) => item.id === id);
    const nextNombre = updates.nombre?.trim() || prev?.nombre;
    MiloStore.saveMarcas(current.map((item) => (item.id === id ? { ...item, nombre: nextNombre } : item)));
    if (prev && nextNombre && prev.nombre !== nextNombre) {
      const productos = MiloStore.getProductos().map((product) => (
        product.marca === prev.nombre ? { ...product, marca: nextNombre } : product
      ));
      MiloStore.saveProductos(productos);
    }
  },
  deleteMarca: (id) => {
    MiloStore.saveMarcas(MiloStore.getMarcas().filter((item) => item.id !== id));
  },

  getEtiquetas: () => loadData(STORAGE_KEYS.ETIQUETAS, SEED_ETIQUETAS),
  saveEtiquetas: (etiquetas) => saveData(STORAGE_KEYS.ETIQUETAS, etiquetas, { sync: false }),
  addEtiqueta: (etiqueta) => {
    const current = MiloStore.getEtiquetas();
    const id = slugify(etiqueta.nombre);
    const uniqueId = current.some((item) => item.id === id) ? `${id}-${Date.now()}` : id;
    const nuevo = { id: uniqueId, nombre: etiqueta.nombre.trim() };
    MiloStore.saveEtiquetas([...current, nuevo]);
    return nuevo;
  },
  updateEtiqueta: (id, updates) => {
    const current = MiloStore.getEtiquetas();
    const prev = current.find((item) => item.id === id);
    const nextNombre = updates.nombre?.trim() || prev?.nombre;
    MiloStore.saveEtiquetas(current.map((item) => (item.id === id ? { ...item, nombre: nextNombre } : item)));
    if (prev && nextNombre && prev.nombre !== nextNombre) {
      const productos = MiloStore.getProductos().map((product) => (
        product.tag === prev.nombre ? { ...product, tag: nextNombre } : product
      ));
      MiloStore.saveProductos(productos);
    }
  },
  deleteEtiqueta: (id) => {
    MiloStore.saveEtiquetas(MiloStore.getEtiquetas().filter((item) => item.id !== id));
  },

  // === PRODUCTOS ===
  getProductos: () => loadData(STORAGE_KEYS.PRODUCTOS, SEED_PRODUCTOS).map(withProductPasillos),
  saveProductos: (productos) => saveData(STORAGE_KEYS.PRODUCTOS, productos),
  addProducto: (prod) => {
    const movimientosPrevios = ensureMovimientos();
    const current = MiloStore.getProductos();
    const newProd = withProductPasillos(withVariantes({
      ...prod,
      id: `p_${Date.now()}`,
      moneda: COP_CODE,
      cuposReserva: Number(prod.cuposReserva) || 0,
      reservasActuales: Number(prod.reservasActuales) || 0,
      imagen: prod.imagen || '',
      marca: prod.marca || '',
      tag: prod.tag || '',
      modoUso: prod.modoUso || '',
      stockReal: true,
      updatedAt: new Date().toISOString()
    }));
    MiloStore.saveProductos([newProd, ...current]);
    if (!newProd.enCamino) {
      const iniciales = (newProd.variantes || [])
        .filter((variante) => Number(variante.stock) > 0)
        .map((variante) => makeMovimiento({
          id: `m_init_${newProd.id}_${variante.id}`,
          producto: newProd,
          variante,
          tipo: 'entrada',
          cantidad: variante.stock,
          delta: variante.stock,
          stockAntes: 0,
          stockDespues: variante.stock,
          motivo: 'Inventario inicial',
          origen: 'alta-producto'
        }));
      if (iniciales.length) saveData(STORAGE_KEYS.MOVIMIENTOS, [...iniciales, ...movimientosPrevios]);
    }
    return newProd;
  },
  updateProducto: (id, updates) => {
    const movimientosPrevios = ensureMovimientos();
    const current = MiloStore.getProductos();
    const { stock, ...rest } = updates;
    void stock;
    const extraMovimientos = [];
    const updated = current.map((p) => {
      if (p.id !== id) return p;
      const nextEnCamino = rest.enCamino ?? p.enCamino;
      const borrador = esStockGenerico(p);
      const confirmarReal = borrador && !nextEnCamino;
      let variantes = rest.variantes;
      if (Array.isArray(variantes)) {
        variantes = variantes.map((variante, index) => {
          const prev = (p.variantes || []).find((item) => item.id === variante.id);
          const rawId = String(variante.id || '');
          const next = {
            ...variante,
            id: !rawId || rawId.startsWith('tmp_') ? `${p.id}_v${index + 1}` : rawId,
            nombre: String(variante.nombre || '').trim(),
            precio: Number(variante.precio) || 0,
            stockMinimo: Math.max(0, Number(variante.stockMinimo) || 0),
            stock: (borrador || !prev) ? Number(variante.stock) || 0 : Number(prev.stock) || 0
          };
          if (!nextEnCamino && next.stock > 0) {
            if (confirmarReal) {
              extraMovimientos.push(makeMovimiento({
                id: `m_init_${p.id}_${next.id}`,
                producto: { ...p, nombre: rest.nombre || p.nombre },
                variante: next,
                tipo: 'entrada',
                cantidad: next.stock,
                delta: next.stock,
                stockAntes: 0,
                stockDespues: next.stock,
                motivo: 'Inventario inicial',
                origen: 'confirmar-stock'
              }));
            } else if (!borrador && !prev) {
              extraMovimientos.push(makeMovimiento({
                id: `m_init_${p.id}_${next.id}`,
                producto: p,
                variante: next,
                tipo: 'entrada',
                cantidad: next.stock,
                delta: next.stock,
                stockAntes: 0,
                stockDespues: next.stock,
                motivo: 'Inventario inicial',
                origen: 'alta-presentacion'
              }));
            }
          }
          return next;
        });
        if (!variantes.length) variantes = p.variantes;
      }
      return withProductPasillos(withVariantes({
        ...p,
        ...rest,
        variantes: variantes || p.variantes,
        stockReal: confirmarReal ? true : p.stockReal,
        updatedAt: new Date().toISOString()
      }));
    });
    MiloStore.saveProductos(updated);
    if (extraMovimientos.length) {
      saveData(STORAGE_KEYS.MOVIMIENTOS, [...extraMovimientos, ...movimientosPrevios]);
    }
  },
  deleteProducto: (id) => {
    const current = MiloStore.getProductos();
    MiloStore.saveProductos(current.filter(p => p.id !== id));
    deleteRemoteRow('productos', id);
  },
  updateVarianteCatalogo: (productoId, varianteId, patch) => {
    const product = MiloStore.getProductos().find((item) => item.id === productoId);
    if (!product) return;
    MiloStore.updateProducto(productoId, {
      ...product,
      variantes: (product.variantes || []).map((item) => (
        item.id === varianteId
          ? {
            ...item,
            nombre: patch.nombre !== undefined ? patch.nombre : item.nombre,
            precio: patch.precio !== undefined ? Number(patch.precio) || 0 : item.precio
          }
          : item
      ))
    });
  },

  // === SERVICIOS ESTÉTICOS ===
  getServicios: () => loadData(STORAGE_KEYS.SERVICIOS, SEED_SERVICIOS),
  saveServicios: (servicios) => saveData(STORAGE_KEYS.SERVICIOS, servicios),
  addServicio: (srv) => {
    const current = MiloStore.getServicios();
    const nuevo = {
      ...srv,
      id: `s_${Date.now()}`,
      duracionMinutos: Number(srv.duracionMinutos) || 60,
      precio: Number(srv.precio) || 0,
      imagen: srv.imagen || ''
    };
    MiloStore.saveServicios([nuevo, ...current]);
    return nuevo;
  },
  updateServicio: (id, updates) => {
    const current = MiloStore.getServicios();
    MiloStore.saveServicios(current.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  },
  deleteServicio: (id) => {
    const current = MiloStore.getServicios();
    MiloStore.saveServicios(current.filter((s) => s.id !== id));
  },

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
        tipoPiel: cita.tipoPiel || cita.areaInteres || 'Por evaluar en cabina',
        areaInteres: cita.areaInteres || cita.tipoPiel || 'Integral',
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
  updateCliente: (clienteId, updates) => {
    const clientes = MiloStore.getClientes();
    MiloStore.saveClientes(clientes.map((cl) => (cl.id === clienteId ? { ...cl, ...updates } : cl)));
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
  addToCarrito: (producto, tipo = 'compra', varianteId) => { // tipo: 'compra' | 'reserva_en_camino'
    const live = MiloStore.getProductos().find((item) => item.id === producto.id) || producto;
    const variante = findVariante(live, varianteId);
    const carrito = MiloStore.getCarrito();
    const existingIndex = carrito.findIndex((item) => (
      item.id === producto.id && item.tipo === tipo && (item.varianteId || '') === (variante?.id || '')
    ));
    const already = existingIndex >= 0 ? carrito[existingIndex].cantidad : 0;

    if (tipo === 'compra' && !live.enCamino) {
      const stock = Number(variante?.stock ?? live.stock) || 0;
      if (stock <= already) return false;
    }

    if (existingIndex >= 0) {
      carrito[existingIndex].cantidad += 1;
    } else {
      carrito.push({
        id: producto.id,
        varianteId: variante?.id || '',
        nombre: producto.nombre,
        presentacion: variante?.nombre || '',
        precio: Number(variante?.precio ?? producto.precio) || 0,
        pasillo: producto.pasillo,
        enCamino: !!producto.enCamino,
        fechaLlegada: producto.fechaLlegada,
        tipo,
        cantidad: 1
      });
    }
    MiloStore.saveCarrito([...carrito]);

    if (producto.enCamino && tipo === 'reserva_en_camino') {
      const productos = MiloStore.getProductos();
      const updatedProds = productos.map((p) => p.id === producto.id ? { ...p, reservasActuales: (p.reservasActuales || 0) + 1 } : p);
      MiloStore.saveProductos(updatedProds);
    }
    return true;
  },
  removeFromCarrito: (productoId, tipo, varianteId) => {
    const carrito = MiloStore.getCarrito();
    const item = carrito.find((entry) => (
      entry.id === productoId && entry.tipo === tipo && (entry.varianteId || '') === (varianteId || '')
    ));
    const updated = carrito.filter((entry) => !(
      entry.id === productoId && entry.tipo === tipo && (entry.varianteId || '') === (varianteId || '')
    ));
    MiloStore.saveCarrito(updated);
    if (tipo === 'reserva_en_camino' && item) {
      MiloStore.saveProductos(
        MiloStore.getProductos().map((product) => (
          product.id === productoId
            ? { ...product, reservasActuales: Math.max(0, (product.reservasActuales || 0) - item.cantidad) }
            : product
        ))
      );
    }
  },
  clearCarrito: () => {
    MiloStore.saveCarrito([]);
  },
  checkoutCarrito: () => {
    const items = MiloStore.getCarrito();
    items.forEach((item) => {
      if (item.tipo !== 'compra') return;
      const product = MiloStore.getProductos().find((entry) => entry.id === item.id);
      if (!product || product.enCamino) return;
      MiloStore.registrarMovimiento({
        productoId: item.id,
        varianteId: item.varianteId,
        tipo: 'venta',
        cantidad: item.cantidad,
        motivo: 'Venta en tienda',
        origen: 'checkout'
      });
    });
    MiloStore.clearCarrito();
  },

  getMovimientos: () => ensureMovimientos(),
  saveMovimientos: (movimientos) => saveData(STORAGE_KEYS.MOVIMIENTOS, movimientos),
  registrarMovimiento: ({ productoId, varianteId, tipo, cantidad, motivo, nota, origen }) => {
    const tipos = ['entrada', 'salida', 'venta', 'ajuste'];
    if (!tipos.includes(tipo)) return { ok: false, error: 'Tipo de movimiento inválido' };

    const productos = MiloStore.getProductos();
    const product = productos.find((entry) => entry.id === productoId);
    if (!product) return { ok: false, error: 'Producto no encontrado' };
    if (product.enCamino) return { ok: false, error: 'Las preventas se manejan con cupos, no con stock de cabina' };
    if (esStockGenerico(product) && tipo !== 'venta') {
      return { ok: false, error: 'Este producto sigue como stock genérico. Ábrelo y guárdalo para confirmar el inventario real.' };
    }

    const variante = findVariante(product, varianteId);
    if (!variante) return { ok: false, error: 'Presentación no encontrada' };

    const before = Number(variante.stock) || 0;
    const raw = Number(cantidad);
    let after = before;

    if (tipo === 'ajuste') {
      if (!Number.isFinite(raw) || raw < 0) return { ok: false, error: 'El nuevo stock no es válido' };
      after = Math.round(raw);
    } else {
      const qty = Math.abs(Math.round(raw));
      if (!qty) return { ok: false, error: 'Cantidad inválida' };
      if (tipo === 'entrada') after = before + qty;
      else if (tipo === 'venta') after = Math.max(0, before - qty);
      else {
        if (qty > before) return { ok: false, error: 'Stock insuficiente' };
        after = before - qty;
      }
    }

    const delta = after - before;
    if (delta === 0) return { ok: false, error: 'El stock no cambia' };

    const movement = makeMovimiento({
      producto: product,
      variante,
      tipo,
      cantidad: Math.abs(delta),
      delta,
      stockAntes: before,
      stockDespues: after,
      motivo: motivo || (tipo === 'venta' ? 'Venta en tienda' : 'Movimiento'),
      nota,
      origen: origen || 'manual'
    });

    const nextVariantes = (product.variantes || []).map((item) => (
      item.id === variante.id ? { ...item, stock: after } : item
    ));
    MiloStore.saveProductos(productos.map((entry) => (
      entry.id === productoId ? withVariantes({ ...entry, variantes: nextVariantes }) : entry
    )));
    if (esStockGenerico(product)) {
      return { ok: true, movement: null };
    }
    saveData(STORAGE_KEYS.MOVIMIENTOS, [movement, ...ensureMovimientos()]);
    return { ok: true, movement };
  },
  getAlertasInventario: () => MiloStore.getProductos()
    .filter((product) => !product.enCamino && !esStockGenerico(product))
    .flatMap((product) => (product.variantes || []).map((variante) => ({
      ...product,
      variante,
      stock: variante.stock,
      stockMinimo: variante.stockMinimo,
      estado: stockEstado(product, variante)
    })))
    .filter((row) => row.estado === 'agotado' || row.estado === 'bajo'),

  getAjustes: () => {
    const saved = loadData(STORAGE_KEYS.AJUSTES, SEED_AJUSTES) || SEED_AJUSTES;
    const { circles, align } = withCategoryCircles(saved);
    return { ...SEED_AJUSTES, ...saved, categoryCircles: circles, categoryCirclesAlign: align, logo: normalizeSiteLogo(saved.logo) };
  },
  saveAjustes: (ajustes) => {
    const current = loadData(STORAGE_KEYS.AJUSTES, SEED_AJUSTES) || SEED_AJUSTES;
    const merged = {
      ...SEED_AJUSTES,
      ...current,
      ...ajustes,
      categoryCircles: ajustes.categoryCircles ?? current.categoryCircles,
      categoryCirclesAlign: ajustes.categoryCirclesAlign ?? current.categoryCirclesAlign,
      logo: normalizeSiteLogo(ajustes.logo !== undefined ? ajustes.logo : current.logo)
    };
    const { circles, align } = withCategoryCircles(merged);
    saveData(STORAGE_KEYS.AJUSTES, {
      ...merged,
      categoryCircles: circles,
      categoryCirclesAlign: align,
      updatedAt: stampNow()
    });
  },
  addNewsletterEmail: (email) => {
    const current = MiloStore.getAjustes();
    const list = current.newsletterEmails || [];
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized || list.includes(normalized)) return;
    MiloStore.saveAjustes({ ...current, newsletterEmails: [normalized, ...list] });
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
    localStorage.removeItem(STORAGE_KEYS.AJUSTES);
    localStorage.removeItem(STORAGE_KEYS.MARCAS);
    localStorage.removeItem(STORAGE_KEYS.ETIQUETAS);
    localStorage.removeItem(STORAGE_KEYS.MOVIMIENTOS);
    window.location.reload();
  },

  publishCatalog: () => publishCatalogToSupabase({
    banners: loadData(STORAGE_KEYS.BANNERS, SEED_BANNERS).map(cloneBanner),
    ajustes: MiloStore.getAjustes(),
    persistLocal: ({ banners, ajustes }) => {
      saveData(STORAGE_KEYS.BANNERS, (banners || []).map(cloneBanner), { sync: false });
      saveData(STORAGE_KEYS.AJUSTES, ajustes, { sync: false });
    }
  })
};
