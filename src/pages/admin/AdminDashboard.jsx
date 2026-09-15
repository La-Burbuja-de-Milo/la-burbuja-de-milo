import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MiloStore } from '../../services/miloStore';
import { generateWhatsAppUrl, WhatsAppTemplates } from '../../services/whatsappService';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import AuroraButton from '../../components/ui/AuroraButton';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Image as ImageIcon, 
  Calendar, 
  Users, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  MessageCircle, 
  CheckCircle2, 
  XCircle, 
  Save, 
  X, 
  Search,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen'); // 'resumen' | 'tienda' | 'banners' | 'citas' | 'crm' | 'blog'

  // Estados de datos sincronizados
  const [productos, setProductos] = useState([]);
  const [pasillos, setPasillos] = useState([]);
  const [banners, setBanners] = useState([]);
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);

  // Modales y formularios
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    nombre: '',
    pasillo: 'skincare',
    precio: '',
    stock: '',
    enCamino: false,
    fechaLlegada: '',
    cuposReserva: 20,
    tag: '',
    descripcion: '',
    ingredientes: '',
    modoUso: ''
  });

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    tag: '',
    titulo: '',
    descripcion: '',
    botonTexto: 'Agendar Cita',
    botonEnlace: '/citas',
    botonSecundarioTexto: 'Ver Tienda',
    botonSecundarioEnlace: '/tienda',
    activo: true
  });

  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [blogForm, setBlogForm] = useState({
    titulo: '',
    categoria: 'Ciencia Estética',
    autor: 'Equipo Clínico Milo',
    tiempoLectura: '4 min',
    resumen: '',
    contenido: ''
  });

  // Filtros de búsqueda
  const [searchClientQuery, setSearchClientQuery] = useState('');
  const [filterCitaEstado, setFilterCitaEstado] = useState('Todas');

  const loadAll = () => {
    setProductos(MiloStore.getProductos());
    setPasillos(MiloStore.getPasillos());
    setBanners(MiloStore.getBanners());
    setCitas(MiloStore.getCitas());
    setClientes(MiloStore.getClientes());
    setBlogPosts(MiloStore.getBlogPosts());
  };

  useEffect(() => {
    loadAll();
    window.addEventListener('milo_store_updated', loadAll);
    return () => window.removeEventListener('milo_store_updated', loadAll);
  }, []);

  // === HANDLERS PRODUCTOS ===
  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({ ...prod });
    } else {
      setEditingProduct(null);
      setProductForm({
        nombre: '',
        pasillo: 'skincare',
        precio: '',
        stock: '10',
        enCamino: false,
        fechaLlegada: '',
        cuposReserva: 20,
        tag: 'Nuevo',
        descripcion: '',
        ingredientes: '',
        modoUso: ''
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      MiloStore.updateProducto(editingProduct.id, {
        ...productForm,
        precio: Number(productForm.precio) || 0,
        stock: Number(productForm.stock) || 0,
        cuposReserva: Number(productForm.cuposReserva) || 0
      });
    } else {
      MiloStore.addProducto(productForm);
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este producto de la tienda?')) {
      MiloStore.deleteProducto(id);
    }
  };

  // === HANDLERS BANNERS ===
  const handleSaveBanner = (e) => {
    e.preventDefault();
    MiloStore.addBanner(bannerForm);
    setIsBannerModalOpen(false);
  };

  const handleToggleBanner = (id, currentActive) => {
    MiloStore.updateBanner(id, { activo: !currentActive });
  };

  // === HANDLERS BLOG ===
  const handleSaveBlog = (e) => {
    e.preventDefault();
    MiloStore.addBlogPost(blogForm);
    setIsBlogModalOpen(false);
  };

  // === HANDLERS CITAS ===
  const handleCitaEstado = (citaId, nuevoEstado) => {
    MiloStore.updateCitaEstado(citaId, nuevoEstado);
  };

  const sendWhatsAppConfirmation = (cita) => {
    const msg = WhatsAppTemplates.confirmacionCita({
      clienteNombre: cita.clienteNombre,
      servicio: cita.servicioTitulo,
      fecha: cita.fecha,
      hora: cita.hora
    });
    const url = generateWhatsAppUrl({ phone: cita.clienteTelefono, message: msg });
    window.open(url, '_blank');
  };

  const sendWhatsAppReminder = (cita) => {
    const msg = WhatsAppTemplates.recordatorioCita({
      clienteNombre: cita.clienteNombre,
      servicio: cita.servicioTitulo,
      fecha: cita.fecha,
      hora: cita.hora
    });
    const url = generateWhatsAppUrl({ phone: cita.clienteTelefono, message: msg });
    window.open(url, '_blank');
  };

  const sendWhatsAppCustomerChat = (cliente) => {
    const msg = `¡Hola ${cliente.nombre}! ✨ Te saludamos desde La Burbuja de Milo. ¿Cómo podemos consentir tu piel hoy?`;
    const url = generateWhatsAppUrl({ phone: cliente.telefono, message: msg });
    window.open(url, '_blank');
  };

  const filteredCitas = citas.filter(c => {
    if (filterCitaEstado === 'Todas') return true;
    return c.estado === filterCitaEstado;
  });

  const filteredClientes = clientes.filter(cl => {
    const q = searchClientQuery.toLowerCase();
    return cl.nombre.toLowerCase().includes(q) || 
           cl.telefono.includes(q) || 
           (cl.email && cl.email.toLowerCase().includes(q)) ||
           (cl.tipoPiel && cl.tipoPiel.toLowerCase().includes(q));
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado Maestro */}
      <PageHeader 
        title="Panel Administrativo & CRM" 
        description="Gestión integral de la tienda, pasillos, banners, agenda de citas, comunicación de clientes y blog."
        glow="admin"
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
            >
              Ver Tienda Pública
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Deseas restablecer los datos de demostración a fábrica?')) {
                  MiloStore.resetAll();
                }
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 transition-colors"
              title="Restablecer datos de fábrica"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* TABS DE NAVEGACIÓN ADMINISTRATIVA */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200/60 dark:border-white/5 apple-scroll">
        {[
          { id: 'resumen', label: 'Resumen General', icon: LayoutDashboard },
          { id: 'tienda', label: `Tienda & Pasillos (${productos.length})`, icon: ShoppingBag },
          { id: 'banners', label: `Banners CMS (${banners.length})`, icon: ImageIcon },
          { id: 'citas', label: `Agenda de Citas (${citas.length})`, icon: Calendar },
          { id: 'crm', label: `CRM Clientes (${clientes.length})`, icon: Users },
          { id: 'blog', label: `Blog (${blogPosts.length})`, icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* PESTAÑA 1: RESUMEN GENERAL (DASHBOARD) */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Métricas clave */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <GlassCard className="p-5 flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Citas Pendientes</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-amber-500">
                  {citas.filter(c => c.estado === 'Pendiente').length}
                </span>
                <Calendar className="w-5 h-5 text-amber-500/40" />
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">En Camino / Preventa</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-purple-500">
                  {productos.filter(p => p.enCamino).length}
                </span>
                <Clock className="w-5 h-5 text-purple-500/40" />
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Clientes en CRM</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-pink-500">
                  {clientes.length}
                </span>
                <Users className="w-5 h-5 text-pink-500/40" />
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Productos</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-emerald-500">
                  {productos.length}
                </span>
                <ShoppingBag className="w-5 h-5 text-emerald-500/40" />
              </div>
            </GlassCard>
          </div>

          {/* Accesos rápidos e información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  <span>Próximas Citas por Atender</span>
                </h3>
                <button
                  onClick={() => setActiveTab('citas')}
                  className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
                >
                  Ver agenda completa
                </button>
              </div>

              <div className="space-y-3">
                {citas.slice(0, 3).map((cita) => (
                  <div key={cita.id} className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{cita.clienteNombre}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{cita.servicioTitulo}</p>
                      <span className="text-[10px] text-pink-600 dark:text-pink-400">{cita.fecha} — {cita.hora}</span>
                    </div>
                    <button
                      onClick={() => sendWhatsAppConfirmation(cita)}
                      className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1"
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>Control de Preventa & En Camino</span>
                </h3>
                <button
                  onClick={() => setActiveTab('tienda')}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Gestionar catálogo
                </button>
              </div>

              <div className="space-y-3">
                {productos.filter(p => p.enCamino).map((prod) => (
                  <div key={prod.id} className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{prod.nombre}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Arribo: {prod.fechaLlegada || 'Pendiente'}</p>
                    </div>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-300">
                      {prod.reservasActuales || 0}/{prod.cuposReserva || 20} apartados
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: GESTIÓN DE TIENDA Y PASILLOS */}
      {activeTab === 'tienda' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Productos y Pasillos de la Tienda</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Administra el inventario, activa productos en tránsito para preventa y actualiza precios.
              </p>
            </div>
            <AuroraButton
              onClick={() => handleOpenProductModal()}
              className="px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </AuroraButton>
          </div>

          {/* Tabla de Productos */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto apple-scroll">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/70 dark:bg-white/5 border-b border-gray-200/60 dark:border-white/5 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3.5">Producto</th>
                    <th className="p-3.5">Pasillo</th>
                    <th className="p-3.5">Precio</th>
                    <th className="p-3.5">Estado / Stock</th>
                    <th className="p-3.5">En Camino</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {productos.map((prod) => (
                    <tr key={prod.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5">
                        <p className="font-semibold text-gray-900 dark:text-white">{prod.nombre}</p>
                        <p className="text-[11px] text-gray-400 truncate max-w-xs">{prod.descripcion}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300">
                          {prod.pasillo}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                        ${prod.precio.toFixed(2)}
                      </td>
                      <td className="p-3.5">
                        {prod.enCamino ? (
                          <span className="text-purple-600 dark:text-purple-400 font-semibold text-[11px]">
                            {prod.reservasActuales || 0}/{prod.cuposReserva || 20} Apartados
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                            {prod.stock} en cabina
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {prod.enCamino ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
                            Sí ({prod.fechaLlegada})
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">No (Disponible)</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenProductModal(prod)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* PESTAÑA 3: BANNERS CMS */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Banners y Portada de la Tienda</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Personaliza los anuncios promocionales del Hero y campañas vigentes.
              </p>
            </div>
            <AuroraButton
              onClick={() => setIsBannerModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Banner</span>
            </AuroraButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((b) => (
              <GlassCard key={b.id} className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300">
                      {b.tag || 'Banner Hero'}
                    </span>
                    <button
                      onClick={() => handleToggleBanner(b.id, b.activo)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.activo
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400'
                      }`}
                    >
                      {b.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-gray-900 dark:text-white">{b.titulo}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{b.descripcion}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Botón: <strong>{b.botonTexto}</strong> ({b.botonEnlace})</span>
                  <button
                    onClick={() => MiloStore.deleteBanner(b.id)}
                    className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 4: AGENDA DE CITAS & RESERVAS */}
      {activeTab === 'citas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Agenda de Valoraciones y Tratamientos</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gestiona citas, aprueba horarios y envía confirmaciones automáticas por WhatsApp.
              </p>
            </div>

            {/* Filtro de estado de cita */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
              {['Todas', 'Pendiente', 'Confirmada', 'Realizada', 'Cancelada'].map((est) => (
                <button
                  key={est}
                  onClick={() => setFilterCitaEstado(est)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterCitaEstado === est
                      ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {est}
                </button>
              ))}
            </div>
          </div>

          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto apple-scroll">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/70 dark:bg-white/5 border-b border-gray-200/60 dark:border-white/5 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Tratamiento / Servicio</th>
                    <th className="p-3.5">Fecha y Hora</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5">Notas del Cliente</th>
                    <th className="p-3.5 text-right">Acciones WhatsApp / Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredCitas.map((cita) => (
                    <tr key={cita.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5">
                        <p className="font-semibold text-gray-900 dark:text-white">{cita.clienteNombre}</p>
                        <p className="text-[11px] text-gray-400">{cita.clienteTelefono}</p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-medium text-gray-900 dark:text-white">{cita.servicioTitulo}</p>
                        <span className="text-[10px] text-gray-400">{cita.duracionMinutos || 60} min</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-pink-600 dark:text-pink-400">{cita.fecha}</span>
                        <p className="text-[11px] text-gray-400">{cita.hora}</p>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={cita.estado}
                          onChange={(e) => handleCitaEstado(cita.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border-none bg-transparent cursor-pointer ${
                            cita.estado === 'Confirmada'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : cita.estado === 'Pendiente'
                              ? 'text-amber-600 dark:text-amber-400'
                              : cita.estado === 'Realizada'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          <option value="Pendiente" className="text-gray-900 dark:text-black">Pendiente</option>
                          <option value="Confirmada" className="text-gray-900 dark:text-black">Confirmada</option>
                          <option value="Realizada" className="text-gray-900 dark:text-black">Realizada</option>
                          <option value="Cancelada" className="text-gray-900 dark:text-black">Cancelada</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-gray-500 max-w-xs truncate">
                        {cita.notasCliente || 'Sin notas especiales'}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => sendWhatsAppConfirmation(cita)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-semibold flex items-center gap-1"
                            title="Confirmar por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Confirmar</span>
                          </button>
                          <button
                            onClick={() => sendWhatsAppReminder(cita)}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-[11px] font-semibold flex items-center gap-1"
                            title="Recordatorio por WhatsApp"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Recordar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* PESTAÑA 5: CRM & CLIENTES */}
      {activeTab === 'crm' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Directorio CRM & Ficha de Clientes</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Historial de visitas, notas de diagnóstico estético y comunicación directa.
              </p>
            </div>

            {/* Buscador de cliente */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={searchClientQuery}
                onChange={(e) => setSearchClientQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClientes.map((cl) => (
              <GlassCard key={cl.id} className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                      {cl.ciudad || 'Cliente Registrado'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {cl.citasCount || 0} Citas • {cl.pedidosCount || 0} Pedidos
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-gray-900 dark:text-white">{cl.nombre}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{cl.telefono} {cl.email ? `• ${cl.email}` : ''}</p>

                  <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Tipo de Piel</span>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{cl.tipoPiel || 'Por evaluar'}</p>
                  </div>

                  {cl.notasCRM && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                      "{cl.notasCRM}"
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => sendWhatsAppCustomerChat(cl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  {cl.reservasActivas > 0 && (
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded">
                      {cl.reservasActivas} Reserva en camino
                    </span>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 6: BLOG CMS */}
      {activeTab === 'blog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Publicaciones del Blog</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Crea contenido educativo sobre fórmulas, desmitificación de activos y rutinas conscientes.
              </p>
            </div>
            <AuroraButton
              onClick={() => setIsBlogModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Artículo</span>
            </AuroraButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {blogPosts.map((post) => (
              <GlassCard key={post.id} className="p-5 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                    {post.categoria}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">{post.titulo}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mt-1">{post.resumen}</p>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-400">{post.fecha}</span>
                  <button
                    onClick={() => MiloStore.deleteBlogPost(post.id)}
                    className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CREAR/EDITAR PRODUCTO */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white/95 dark:bg-[#151518]/95 backdrop-blur-3xl rounded-[2rem] border border-white/50 dark:border-white/10 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto apple-scroll">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto para la Tienda'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-700 dark:text-gray-300">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={productForm.nombre}
                  onChange={(e) => setProductForm({ ...productForm, nombre: e.target.value })}
                  placeholder="ej. Serum Reparador Centella 50ml"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-700 dark:text-gray-300">Pasillo de la Tienda</label>
                  <select
                    value={productForm.pasillo}
                    onChange={(e) => setProductForm({ ...productForm, pasillo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="skincare">Skincare Facial</option>
                    <option value="capilar">Cuidado Capilar</option>
                    <option value="tratamientos">Tratamientos & Cabina</option>
                    <option value="nutricosmetica">Nutricosmética</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-700 dark:text-gray-300">Precio (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.precio}
                    onChange={(e) => setProductForm({ ...productForm, precio: e.target.value })}
                    placeholder="35.00"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Interruptor Producto en Camino (Preventa) */}
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-700 dark:text-purple-300">
                  <input
                    type="checkbox"
                    checked={productForm.enCamino}
                    onChange={(e) => setProductForm({ ...productForm, enCamino: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>¿Producto en camino? (Habilitar reservas de preventa)</span>
                </label>

                {productForm.enCamino && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Fecha Estimada Arribo</label>
                      <input
                        type="date"
                        value={productForm.fechaLlegada}
                        onChange={(e) => setProductForm({ ...productForm, fechaLlegada: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-purple-300 dark:border-purple-500/30 text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Cupos de Reserva</label>
                      <input
                        type="number"
                        value={productForm.cuposReserva}
                        onChange={(e) => setProductForm({ ...productForm, cuposReserva: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-black/40 border border-purple-300 dark:border-purple-500/30 text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-700 dark:text-gray-300">Descripción del Producto</label>
                <textarea
                  rows={2}
                  value={productForm.descripcion}
                  onChange={(e) => setProductForm({ ...productForm, descripcion: e.target.value })}
                  placeholder="Beneficios y propiedades principales..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-700 dark:text-gray-300">Ingredientes y Activos</label>
                <input
                  type="text"
                  value={productForm.ingredientes}
                  onChange={(e) => setProductForm({ ...productForm, ingredientes: e.target.value })}
                  placeholder="ej. Madecassoside 72%, Pantenol, Ácido Hialurónico"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <AuroraButton type="submit" className="px-6 py-2 font-semibold">
                  Guardar en Tienda
                </AuroraButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR BANNER */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white/95 dark:bg-[#151518]/95 backdrop-blur-3xl rounded-[2rem] border border-white/50 dark:border-white/10 p-6 shadow-2xl">
            <button
              onClick={() => setIsBannerModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Nuevo Banner Promocional</h3>

            <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase text-gray-600 dark:text-gray-300">Etiqueta Superior</label>
                <input
                  type="text"
                  placeholder="ej. NUEVA COLECCIÓN BOTÁNICA"
                  value={bannerForm.tag}
                  onChange={(e) => setBannerForm({ ...bannerForm, tag: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-600 dark:text-gray-300">Título Principal *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Fórmulas Puras para Piel Radiante"
                  value={bannerForm.titulo}
                  onChange={(e) => setBannerForm({ ...bannerForm, titulo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-600 dark:text-gray-300">Descripción</label>
                <textarea
                  rows={2}
                  value={bannerForm.descripcion}
                  onChange={(e) => setBannerForm({ ...bannerForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-600 dark:text-gray-300">Texto Botón</label>
                  <input
                    type="text"
                    value={bannerForm.botonTexto}
                    onChange={(e) => setBannerForm({ ...bannerForm, botonTexto: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-600 dark:text-gray-300">Enlace Destino</label>
                  <input
                    type="text"
                    value={bannerForm.botonEnlace}
                    onChange={(e) => setBannerForm({ ...bannerForm, botonEnlace: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-3 py-1.5 text-gray-500"
                >
                  Cancelar
                </button>
                <AuroraButton type="submit" className="px-5 py-1.5 font-semibold">
                  Guardar Banner
                </AuroraButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR ARTÍCULO BLOG */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-white/95 dark:bg-[#151518]/95 backdrop-blur-3xl rounded-[2rem] border border-white/50 dark:border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto apple-scroll">
            <button
              onClick={() => setIsBlogModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Nuevo Artículo para el Blog</h3>

            <form onSubmit={handleSaveBlog} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase text-gray-600 dark:text-gray-300">Título del Post *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. El Poder de los Péptidos en la Regeneración Celular"
                  value={blogForm.titulo}
                  onChange={(e) => setBlogForm({ ...blogForm, titulo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-600 dark:text-gray-300">Categoría</label>
                  <input
                    type="text"
                    value={blogForm.categoria}
                    onChange={(e) => setBlogForm({ ...blogForm, categoria: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-600 dark:text-gray-300">Autor</label>
                  <input
                    type="text"
                    value={blogForm.autor}
                    onChange={(e) => setBlogForm({ ...blogForm, autor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-gray-600 dark:text-gray-300">Resumen Breve</label>
                <textarea
                  rows={2}
                  value={blogForm.resumen}
                  onChange={(e) => setBlogForm({ ...blogForm, resumen: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-600 dark:text-gray-300">Contenido Completo</label>
                <textarea
                  rows={6}
                  value={blogForm.contenido}
                  onChange={(e) => setBlogForm({ ...blogForm, contenido: e.target.value })}
                  placeholder="Escribe el cuerpo del artículo..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white apple-scroll"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-3 py-1.5 text-gray-500"
                >
                  Cancelar
                </button>
                <AuroraButton type="submit" className="px-5 py-1.5 font-semibold">
                  Publicar Artículo
                </AuroraButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
