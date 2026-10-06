import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MiloStore, esStockGenerico, hasNamedVariantes, stockEstado } from '../../services/miloStore';
import { formatCOP } from '../../lib/money';
import { generateWhatsAppUrl, WhatsAppTemplates } from '../../services/whatsappService';
import PageHeader from '../../components/ui/PageHeader';
import ProductVisual from '../../components/shop/ProductVisual';
import { BannerStage } from '../../components/shop/BannerFrame';
import EquipoTab from './components/EquipoTab';
import CatalogLists from './components/CatalogLists';
import InventarioTab from './components/InventarioTab';
import PublishCatalogButton from '../../components/admin/PublishCatalogButton';
import { useAuth } from '../../context/AuthContext';
import { useCmsEdit } from '../../context/CmsEditContext';
import { isGerente } from '../../lib/roles';
import { findBannerEstilo, findBannerLayout, findBannerTransicion } from '../../lib/bannerFrames';
import { pasilloLabels } from '../../lib/pasillos';
import {
  LayoutDashboard,
  ShoppingBag,
  Image as ImageIcon,
  Calendar,
  Users,
  BookOpen,
  UserCog,
  Plus,
  Edit,
  Trash2,
  Clock,
  MessageCircle,
  Search,
  RefreshCw,
  Sparkles,
  Package
} from 'lucide-react';

const tabClass = (active) =>
  `flex items-center gap-2 whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
    active ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
  }`;
const inputClass = 'w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white';
const primaryBtn = 'inline-flex items-center justify-center gap-1.5 bg-neutral-900 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900';
const panel = 'border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-950';
const ADMIN_TABS = ['resumen', 'tienda', 'inventario', 'banners', 'cabina', 'citas', 'crm', 'blog', 'equipo'];
const GERENTE_ONLY_TABS = ['tienda', 'inventario', 'banners', 'cabina', 'blog', 'equipo'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, loading } = useAuth();
  const { openProduct: handleOpenProductModal, openBanner: handleOpenBannerModal, openBlog: handleOpenBlogModal, openServicio: handleOpenServicioModal, openFicha: handleOpenFicha, openCategoryCircles } = useCmsEdit();
  const gerente = isGerente(profile?.rol);
  const requestedTab = searchParams.get('tab') || 'resumen';
  const activeTab = ADMIN_TABS.includes(requestedTab) ? requestedTab : 'resumen';

  const setActiveTab = (id) => {
    const next = new URLSearchParams(searchParams);
    if (!id || id === 'resumen') next.delete('tab');
    else next.set('tab', id);
    setSearchParams(next, { replace: true });
  };

  const [productos, setProductos] = useState([]);
  const [banners, setBanners] = useState([]);
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [pasillos, setPasillos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [ajustes, setAjustes] = useState(MiloStore.getAjustes());

  const [searchClientQuery, setSearchClientQuery] = useState('');
  const [filterCitaEstado, setFilterCitaEstado] = useState('Todas');

  const loadAll = () => {
    setProductos(MiloStore.getProductos());
    setBanners(MiloStore.getBanners());
    setCitas(MiloStore.getCitas());
    setClientes(MiloStore.getClientes());
    setBlogPosts(MiloStore.getBlogPosts());
    setServicios(MiloStore.getServicios());
    setPasillos(MiloStore.getPasillos());
    setMarcas(MiloStore.getMarcas());
    setEtiquetas(MiloStore.getEtiquetas());
    setAjustes(MiloStore.getAjustes());
  };

  useEffect(() => {
    loadAll();
    window.addEventListener('milo_store_updated', loadAll);
    return () => window.removeEventListener('milo_store_updated', loadAll);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!gerente && GERENTE_ONLY_TABS.includes(activeTab)) {
      setActiveTab('resumen');
    }
  }, [loading, gerente, activeTab]);

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
    window.open(generateWhatsAppUrl({ phone: cita.clienteTelefono, message: msg }), '_blank');
  };

  const sendWhatsAppReminder = (cita) => {
    const msg = WhatsAppTemplates.recordatorioCita({
      clienteNombre: cita.clienteNombre,
      servicio: cita.servicioTitulo,
      fecha: cita.fecha,
      hora: cita.hora
    });
    window.open(generateWhatsAppUrl({ phone: cita.clienteTelefono, message: msg }), '_blank');
  };

  const sendWhatsAppCustomerChat = (cliente) => {
    const msg = `Hola ${cliente.nombre}. Te saludamos desde La Burbuja de Milo. ¿Cómo sigue tu protocolo de estética y bienestar?`;
    window.open(generateWhatsAppUrl({ phone: cliente.telefono, message: msg }), '_blank');
  };

  const filteredCitas = citas.filter((c) => filterCitaEstado === 'Todas' || c.estado === filterCitaEstado);
  const filteredClientes = clientes.filter((cl) => {
    const q = searchClientQuery.toLowerCase();
    return (
      cl.nombre.toLowerCase().includes(q) ||
      cl.telefono.includes(q) ||
      (cl.email && cl.email.toLowerCase().includes(q)) ||
      (cl.tipoPiel && cl.tipoPiel.toLowerCase().includes(q))
    );
  });

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: LayoutDashboard, staff: true },
    { id: 'tienda', label: `Tienda (${productos.length})`, icon: ShoppingBag, staff: false },
    { id: 'inventario', label: 'Inventario', icon: Package, staff: false },
    { id: 'banners', label: `Vitrina (${banners.length})`, icon: ImageIcon, staff: false },
    { id: 'cabina', label: `Cabina (${servicios.length})`, icon: Sparkles, staff: false },
    { id: 'citas', label: `Agenda (${citas.length})`, icon: Calendar, staff: true },
    { id: 'crm', label: `CRM (${clientes.length})`, icon: Users, staff: true },
    { id: 'blog', label: `Blog (${blogPosts.length})`, icon: BookOpen, staff: false },
    { id: 'equipo', label: 'Equipo', icon: UserCog, staff: false }
  ].filter((tab) => gerente || tab.staff);

  return (
    <div className="flex flex-col gap-8 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <PageHeader
        title={gerente ? 'Panel gerente' : 'Panel asesor'}
        description={gerente
          ? 'Lo que publiques aquí es lo que ven los clientes: fotos, textos, ficha clínica y cabina.'
          : 'Agenda, CRM y ficha clínica que se publica en Mi Burbuja.'}
        actions={
          <div className="flex items-center gap-2">
            {gerente ? <PublishCatalogButton /> : null}
            <button type="button" onClick={() => navigate(gerente ? '/?editar=1' : '/')} className="border border-neutral-900 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] dark:border-white">
              {gerente ? 'Editar en sitio' : 'Ver sitio'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Restablecer los datos de demostración?')) MiloStore.resetAll();
              }}
              className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              title="Restablecer datos de fábrica"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="flex items-center gap-1 overflow-x-auto border-b border-neutral-200 dark:border-neutral-700 pb-3 apple-scroll dark:border-neutral-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={tabClass(activeTab === tab.id)}>
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['Citas pendientes', citas.filter((c) => c.estado === 'Pendiente').length],
              ['Preventas en camino', productos.filter((p) => p.enCamino).length],
              ['Clientes CRM', clientes.length],
              gerente
                ? ['Stock bajo', productos.filter((p) => ['agotado', 'bajo'].includes(stockEstado(p))).length]
                : ['Productos publicados', productos.length]
            ].map(([label, value]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (label === 'Stock bajo') setActiveTab('inventario');
                }}
                className={`${panel} p-5 text-left`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{label}</span>
                <p className="mt-2 text-3xl font-medium">{value}</p>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className={`${panel} p-6`}>
              <div className="mb-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-3">
                <h3 className="text-base font-medium">Próximas citas</h3>
                <button type="button" onClick={() => setActiveTab('citas')} className="text-xs font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline">
                  Agenda
                </button>
              </div>
              <div className="space-y-3">
                {citas.slice(0, 3).map((cita) => (
                  <div key={cita.id} className="flex items-center justify-between border border-neutral-200 dark:border-neutral-700 p-3">
                    <div>
                      <p className="text-sm font-medium">{cita.clienteNombre}</p>
                      <p className="text-xs text-neutral-500">{cita.servicioTitulo}</p>
                      <p className="text-xs text-neutral-400">{cita.fecha} · {cita.hora}</p>
                    </div>
                    <button type="button" onClick={() => sendWhatsAppConfirmation(cita)} className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${panel} p-6`}>
              <div className="mb-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-3">
                <h3 className="text-base font-medium">Preventa en camino</h3>
                {gerente && (
                  <button type="button" onClick={() => setActiveTab('tienda')} className="text-xs font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline">
                    Catálogo
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {productos.filter((p) => p.enCamino).map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between border border-neutral-200 dark:border-neutral-700 p-3">
                    <div>
                      <p className="text-sm font-medium">{prod.nombre}</p>
                      <p className="text-xs text-neutral-500">Arribo: {prod.fechaLlegada || 'Pendiente'}</p>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {prod.reservasActuales || 0}/{prod.cuposReserva || 20}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tienda' && (
        <div className="space-y-8">
          <CatalogLists pasillos={pasillos} marcas={marcas} etiquetas={etiquetas} store={MiloStore} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium">Productos de la tienda</h3>
              <p className="text-sm text-neutral-500">La foto, el precio y el modo de uso se publican en la ficha que ven los clientes.</p>
            </div>
            <button type="button" onClick={() => handleOpenProductModal()} className={primaryBtn}>
              <Plus className="h-4 w-4" /> Nuevo producto
            </button>
          </div>
          <div className={`${panel} overflow-hidden`}>
            <div className="overflow-x-auto apple-scroll">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 bg-[#f6f6f6] uppercase tracking-[0.12em] text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
                  <tr>
                    <th className="p-3.5">Producto</th>
                    <th className="p-3.5">Pasillo</th>
                    <th className="p-3.5">Precio</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Foto</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {productos.map((prod) => (
                    <tr key={prod.id}>
                      <td className="p-3.5">
                        <p className="font-medium text-neutral-900 dark:text-white">{prod.nombre}</p>
                        <p className="max-w-xs truncate text-[11px] text-neutral-400">{prod.tag || prod.descripcion}</p>
                      </td>
                      <td className="p-3.5 uppercase tracking-[0.12em] text-neutral-500">{pasilloLabels(prod, pasillos).join(' · ') || prod.pasillo}</td>
                      <td className="p-3.5 font-medium">
                        {hasNamedVariantes(prod) ? `Desde ${formatCOP(prod.precio)}` : formatCOP(prod.precio)}
                      </td>
                      <td className="p-3.5">
                        {prod.enCamino
                          ? `${prod.reservasActuales || 0}/${prod.cuposReserva || 20} apartados`
                          : (
                            <span>
                              {prod.stock} {esStockGenerico(prod) ? 'genérico' : 'en cabina'}
                              {hasNamedVariantes(prod) && (
                                <span className="ml-1 text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                                  · {(prod.variantes || []).length} pres.
                                </span>
                              )}
                              {esStockGenerico(prod) && (
                                <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">Pendiente</span>
                              )}
                              {stockEstado(prod) === 'agotado' && (
                                <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700">Agotado</span>
                              )}
                              {stockEstado(prod) === 'bajo' && (
                                <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">Bajo</span>
                              )}
                            </span>
                          )}
                      </td>
                      <td className="p-3.5">{prod.imagen ? 'Publicada' : 'Genérica'}</td>
                      <td className="p-3.5 text-right">
                        <button type="button" onClick={() => handleOpenProductModal(prod)} className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => window.confirm('¿Eliminar este producto de la tienda?') && MiloStore.deleteProducto(prod.id)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className={`${panel} space-y-4 p-6`}>
            <div>
              <h3 className="text-lg font-medium">Barra promocional</h3>
              <p className="text-sm text-neutral-500">Texto gris del encabezado que ven todos los clientes.</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ajustes.promoActivo !== false}
                onChange={(e) => MiloStore.saveAjustes({ ...ajustes, promoActivo: e.target.checked })}
              />
              Mostrar barra
            </label>
            <input
              type="text"
              value={ajustes.promoTexto || ''}
              onChange={(e) => MiloStore.saveAjustes({ ...ajustes, promoTexto: e.target.value })}
              className={inputClass}
            />
            {(ajustes.newsletterEmails || []).length > 0 && (
              <p className="text-xs text-neutral-500">
                Newsletter: {(ajustes.newsletterEmails || []).length} correos inscritos desde Inicio.
              </p>
            )}
          </div>

          <div className={`${panel} space-y-3 p-6`}>
            <div>
              <h3 className="text-lg font-medium">Círculos de Inicio</h3>
              <p className="text-sm text-neutral-500">Fotos, recorte, orden y centrado de Facial, Corporal, Bienestar, Cabina, Capilar y Marcas.</p>
            </div>
            <button type="button" onClick={openCategoryCircles} className={primaryBtn}>
              Editar círculos
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Banners de Inicio</h3>
              <p className="text-sm text-neutral-500">Título, botones y fotografía del hero. Para verlos en producción, publica al sitio desde este mismo navegador.</p>
            </div>
            <button type="button" onClick={() => handleOpenBannerModal()} className={primaryBtn}>
              <Plus className="h-4 w-4" /> Nuevo banner
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {banners.map((b) => (
              <article key={b.id} className={panel}>
                <div className="relative h-36 w-full overflow-hidden">
                  <BannerStage key={b.id} banner={b} className="absolute inset-0" />
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">{b.tag || 'Hero'}</span>
                    <button
                      type="button"
                      onClick={() => MiloStore.updateBanner(b.id, { activo: !b.activo })}
                      className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${b.activo ? 'bg-neutral-900 px-2 py-0.5 text-white' : 'text-neutral-400'}`}
                    >
                      {b.activo ? 'Activo' : 'Oculto'}
                    </button>
                  </div>
                  <h4 className="text-base font-medium">{b.titulo}</h4>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    {findBannerLayout(b.marcoLayout).label}
                    {b.marcoEstilo && b.marcoEstilo !== 'lleno' ? ` · ${findBannerEstilo(b.marcoEstilo).label}` : ''}
                    {b.transicion && b.transicion !== 'fundido' ? ` · ${findBannerTransicion(b.transicion).label}` : ''}
                  </p>
                  <p className="line-clamp-2 text-sm text-neutral-500">{b.descripcion}</p>
                  <p className="text-[11px] text-neutral-400">{b.botonTexto} → {b.botonEnlace}</p>
                  <div className="flex justify-end gap-1 border-t border-neutral-200 pt-3">
                    <button type="button" onClick={() => handleOpenBannerModal(b)} className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => window.confirm('¿Eliminar este banner?') && MiloStore.deleteBanner(b.id)}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'cabina' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium">Servicios de cabina</h3>
              <p className="text-sm text-neutral-500">Estos tratamientos y su foto aparecen en Cabina y en los featured picks de Inicio.</p>
            </div>
            <button type="button" onClick={() => handleOpenServicioModal()} className={primaryBtn}>
              <Plus className="h-4 w-4" /> Nuevo servicio
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {servicios.map((srv) => (
              <article key={srv.id} className={panel}>
                <ProductVisual seed={srv.id} src={srv.imagen} className="h-32 w-full" />
                <div className="space-y-2 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">{srv.categoria}</p>
                  <h4 className="text-base font-medium">{srv.titulo}</h4>
                  <p className="line-clamp-2 text-sm text-neutral-500">{srv.descripcion}</p>
                  <p className="text-xs text-neutral-400">{srv.duracionMinutos} min · {formatCOP(srv.precio)}</p>
                  <div className="flex justify-end gap-1 border-t border-neutral-200 pt-3">
                    <button type="button" onClick={() => handleOpenServicioModal(srv)} className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => window.confirm('¿Eliminar este servicio de cabina?') && MiloStore.deleteServicio(srv.id)}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'citas' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium">Agenda</h3>
              <p className="text-sm text-neutral-500">Las citas que confirmas aquí aparecen en Mi Burbuja del cliente.</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {['Todas', 'Pendiente', 'Confirmada', 'Realizada', 'Cancelada'].map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setFilterCitaEstado(est)}
                  className={`px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                    filterCitaEstado === est ? 'bg-neutral-900 text-white' : 'border border-neutral-200 dark:border-neutral-700 text-neutral-500'
                  }`}
                >
                  {est}
                </button>
              ))}
            </div>
          </div>
          <div className={`${panel} overflow-hidden`}>
            <div className="overflow-x-auto apple-scroll">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 bg-[#f6f6f6] uppercase tracking-[0.12em] text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
                  <tr>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Servicio</th>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5">Notas</th>
                    <th className="p-3.5 text-right">WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredCitas.map((cita) => (
                    <tr key={cita.id}>
                      <td className="p-3.5">
                        <p className="font-medium">{cita.clienteNombre}</p>
                        <p className="text-[11px] text-neutral-400">{cita.clienteTelefono}</p>
                      </td>
                      <td className="p-3.5">
                        <p>{cita.servicioTitulo}</p>
                        <span className="text-[10px] text-neutral-400">{cita.duracionMinutos || 60} min</span>
                      </td>
                      <td className="p-3.5">{cita.fecha} · {cita.hora}</td>
                      <td className="p-3.5">
                        <select
                          value={cita.estado}
                          onChange={(e) => handleCitaEstado(cita.id, e.target.value)}
                          className="border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-500 dark:bg-neutral-950 dark:text-white"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Confirmada">Confirmada</option>
                          <option value="Realizada">Realizada</option>
                          <option value="Cancelada">Cancelada</option>
                        </select>
                      </td>
                      <td className="max-w-xs truncate p-3.5 text-neutral-500">{cita.notasCliente || '—'}</td>
                      <td className="p-3.5 text-right">
                        <button type="button" onClick={() => sendWhatsAppConfirmation(cita)} className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => sendWhatsAppReminder(cita)} className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                          <Clock className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'crm' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium">Ficha CRM</h3>
              <p className="text-sm text-neutral-500">Diagnóstico y activos se publican en la ficha clínica de Mi Burbuja.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar cliente"
                value={searchClientQuery}
                onChange={(e) => setSearchClientQuery(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClientes.map((cl) => (
              <article key={cl.id} className={`${panel} flex flex-col justify-between p-5`}>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                    {cl.ciudad || 'Cliente'} · {cl.citasCount || 0} citas
                  </p>
                  <h4 className="mt-2 text-base font-medium">{cl.nombre}</h4>
                  <p className="text-xs text-neutral-500">{cl.telefono}{cl.email ? ` · ${cl.email}` : ''}</p>
                  <div className="mt-3 border border-neutral-200 dark:border-neutral-700 p-3 text-xs">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Diagnóstico publicado</span>
                    <p className="mt-1 font-medium">{cl.diagnostico || cl.tipoPiel || 'Por evaluar'}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3">
                  <button type="button" onClick={() => sendWhatsAppCustomerChat(cl)} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em]">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </button>
                  <button type="button" onClick={() => handleOpenFicha(cl)} className="text-xs font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline">
                    Editar ficha
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'blog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Artículos del blog</h3>
              <p className="text-sm text-neutral-500">Portada y texto se publican en Blog y en el bloque editorial de Inicio.</p>
            </div>
            <button type="button" onClick={() => handleOpenBlogModal()} className={primaryBtn}>
              <Plus className="h-4 w-4" /> Nuevo artículo
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {blogPosts.map((post) => (
              <article key={post.id} className={panel}>
                <ProductVisual seed={post.id} src={post.imagen} className="h-32 w-full" />
                <div className="space-y-2 p-5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">{post.categoria}</span>
                  <h4 className="text-sm font-medium">{post.titulo}</h4>
                  <p className="line-clamp-3 text-xs text-neutral-500">{post.resumen}</p>
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-xs text-neutral-400">
                    <span>{post.fecha}</span>
                    <div>
                      <button type="button" onClick={() => handleOpenBlogModal(post)} className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => window.confirm('¿Eliminar este artículo?') && MiloStore.deleteBlogPost(post.id)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'inventario' && gerente && <InventarioTab />}

      {activeTab === 'equipo' && gerente && <EquipoTab />}
    </div>
  );
}
