import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MiloStore } from '../services/miloStore';
import { esStockGenerico } from '../lib/variantes';
import ImageUploader from '../components/admin/ImageUploader';
import ImageFocusPicker from '../components/admin/ImageFocusPicker';
import { useAuth } from './AuthContext';
import { isGerente, isStaff } from '../lib/roles';
import { hasEditParam } from '../lib/visualEdit';
import { bannerDraft, bannerPersistPayload, withBannerFrames } from '../lib/bannerFrames';
import { productPasillos, withProductPasillos } from '../lib/pasillos';
import BannerPhotosFields from '../components/admin/BannerPhotosFields';
import CategoryCirclesFields from '../components/admin/CategoryCirclesFields';
import { withCategoryCircles, normalizeSiteLogo } from '../lib/categoryCircles';
import { normalizeRewardsStrip } from '../lib/rewardsStrip';
import RewardsStripFields from '../components/admin/RewardsStripFields';
import { withHomeTabRows, pickFeaturedServicios } from '../lib/homeTabRows';
import HomeTabRowsFields from '../components/admin/HomeTabRowsFields';
import { withHomeStory } from '../lib/homeStory';
import HomeStoryFields from '../components/admin/HomeStoryFields';
import PhotoCropFields from '../components/admin/PhotoCropFields';
import { normalizeMediaCrop } from '../lib/mediaCrop';
import { withTiendaPage } from '../lib/tiendaPage';

const CmsEditContext = createContext(null);

const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300';
const inputClass = 'w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white';
const primaryBtn = 'inline-flex items-center justify-center gap-1.5 bg-neutral-900 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900';
const ghostBtn = 'px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white';

const EMPTY_VARIANTE = { id: '', nombre: '', precio: '', stock: '10', stockMinimo: '3' };

const EMPTY_PRODUCT = {
  nombre: '',
  pasillo: 'skincare',
  pasillos: ['skincare'],
  marca: '',
  precio: '',
  moneda: 'COP',
  stock: '10',
  stockMinimo: '3',
  enCamino: false,
  fechaLlegada: '',
  cuposReserva: 20,
  tag: '',
  descripcion: '',
  ingredientes: '',
  modoUso: '',
  imagen: '',
  posX: 50,
  posY: 50,
  zoom: 1,
  flipX: false,
  flipY: false,
  rotate: 0,
  variantes: [{ ...EMPTY_VARIANTE, id: 'tmp_1' }]
};

function emptyBannerForm() {
  return bannerDraft({
    tag: '',
    titulo: '',
    descripcion: '',
    botonTexto: 'Agendar cita',
    botonEnlace: '/citas',
    botonSecundarioTexto: 'Ver tienda',
    botonSecundarioEnlace: '/tienda',
    activo: true,
    imagen: '',
    imagenes: [''],
    marcoLayout: 'unica',
    marcoEstilo: 'lleno',
    transicion: 'fundido'
  });
}

const EMPTY_BLOG = {
  titulo: '',
  categoria: 'Ciencia Estética',
  autor: 'Equipo Clínico Milo',
  tiempoLectura: '4 min',
  resumen: '',
  contenido: '',
  imagen: '',
  posX: 50,
  posY: 50,
  zoom: 1,
  flipX: false,
  flipY: false,
  rotate: 0
};

const EMPTY_SERVICIO = {
  titulo: '',
  categoria: 'Diagnóstico',
  duracionMinutos: 60,
  precio: '',
  descripcion: '',
  recomendado: '',
  imagen: '',
  posX: 50,
  posY: 50,
  zoom: 1,
  flipX: false,
  flipY: false,
  rotate: 0
};

function SelectFromCatalog({ label, value, onChange, items, onCreate, placeholder }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex gap-2">
        <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
          <option value="">{placeholder}</option>
          {value && !items.some((item) => item.nombre === value) && (
            <option value={value}>{value}</option>
          )}
          {items.map((item) => (
            <option key={item.id} value={item.nombre}>{item.nombre}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            const nombre = window.prompt(`Nueva ${label.toLowerCase()}`);
            if (!nombre?.trim()) return;
            const created = onCreate(nombre.trim());
            onChange(created.nombre);
          }}
          className="shrink-0 border border-neutral-900 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] dark:border-white dark:text-white"
        >
          Alta
        </button>
      </div>
    </div>
  );
}

function PresentacionesFields({ product, enCamino, variantes, onChange }) {
  const updateRow = (index, patch) => {
    onChange(variantes.map((item, current) => (current === index ? { ...item, ...patch } : item)));
  };
  const stockLibre = !product || esStockGenerico(product);

  return (
    <div className="space-y-3">
      <div>
        <p className={labelClass}>Presentaciones y precios</p>
        <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          Se publican juntas en la ficha: x7 sobres y x28 sobres, o 250 ml y 500 ml.
        </p>
      </div>
      <div className="space-y-2">
        <div className={`grid gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400 ${enCamino ? 'grid-cols-[minmax(0,1fr)_7rem]' : 'grid-cols-[minmax(0,1fr)_7rem_4.5rem_4.5rem]'}`}>
          <span>Presentación</span>
          <span>Precio</span>
          {!enCamino && (
            <>
              <span>Stock</span>
              <span>Mín.</span>
            </>
          )}
        </div>
        {variantes.map((variante, index) => {
          const stockBloqueado = !stockLibre && Boolean(variante.id) && !String(variante.id).startsWith('tmp_');
          return (
          <div key={variante.id || index} className="space-y-1 border border-neutral-300 p-2 dark:border-neutral-500">
            <div className={`grid items-center gap-2 ${enCamino ? 'grid-cols-[minmax(0,1fr)_7rem]' : 'grid-cols-[minmax(0,1fr)_7rem_4.5rem_4.5rem]'}`}>
              <input
                value={variante.nombre}
                onChange={(event) => updateRow(index, { nombre: event.target.value })}
                placeholder={index === 0 ? 'x7 sobres' : 'x28 sobres'}
                className={inputClass}
              />
              <input
                type="number"
                min="0"
                step="1"
                required
                value={variante.precio}
                onChange={(event) => updateRow(index, { precio: event.target.value })}
                placeholder="45000"
                className={inputClass}
              />
              {!enCamino && (
                <>
                  <input
                    type="number"
                    min="0"
                    disabled={stockBloqueado}
                    value={variante.stock}
                    onChange={(event) => updateRow(index, { stock: event.target.value })}
                    className={`${inputClass} disabled:bg-neutral-50 disabled:text-neutral-500 dark:disabled:bg-neutral-900 dark:disabled:text-neutral-400`}
                  />
                  <input
                    type="number"
                    min="0"
                    value={variante.stockMinimo}
                    onChange={(event) => updateRow(index, { stockMinimo: event.target.value })}
                    className={inputClass}
                  />
                </>
              )}
            </div>
            {variantes.length > 1 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onChange(variantes.filter((_, current) => current !== index))}
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onChange([...variantes, { ...EMPTY_VARIANTE, id: `tmp_${Date.now()}`, stock: stockLibre ? '10' : '0' }])}
        className="text-[11px] font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline"
      >
        Añadir presentación
      </button>
      {!enCamino && (
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          {!product
            ? 'Publica presentaciones, precios y stock. Quedan como inventario real; después las cantidades se mueven en Inventario.'
            : esStockGenerico(product)
              ? 'Ajusta presentaciones, precios y cantidades con libertad. Al guardar, este inventario quedará como stock real y se moverá en Inventario.'
              : 'El stock de presentaciones ya confirmadas se mueve en Inventario. Precios y nombres sí se pueden editar aquí.'}
        </p>
      )}
    </div>
  );
}

function Modal({ title, onClose, children, wide = false, className = '' }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
      <div className={`relative max-h-[90vh] w-full overflow-y-auto bg-white p-6 text-neutral-900 apple-scroll dark:bg-neutral-950 dark:text-white sm:p-8 ${className || (wide ? 'max-w-3xl' : 'max-w-xl')}`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          aria-label="Cerrar"
        >
          ×
        </button>
        <h3 className="mb-5 pr-8 text-xl font-medium tracking-tight">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function CmsEditProvider({ children }) {
  const [product, setProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [productOpen, setProductOpen] = useState(false);
  const [pasillos, setPasillos] = useState(() => MiloStore.getPasillos());
  const [marcas, setMarcas] = useState(() => MiloStore.getMarcas());
  const [etiquetas, setEtiquetas] = useState(() => MiloStore.getEtiquetas());

  const [banner, setBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState(emptyBannerForm);
  const [bannerOpen, setBannerOpen] = useState(false);

  const [blog, setBlog] = useState(null);
  const [blogForm, setBlogForm] = useState(EMPTY_BLOG);
  const [blogOpen, setBlogOpen] = useState(false);

  const [servicio, setServicio] = useState(null);
  const [servicioForm, setServicioForm] = useState(EMPTY_SERVICIO);
  const [servicioOpen, setServicioOpen] = useState(false);

  const [cliente, setCliente] = useState(null);
  const [fichaForm, setFichaForm] = useState({});
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoForm, setPromoForm] = useState(MiloStore.getAjustes());
  const [circlesOpen, setCirclesOpen] = useState(false);
  const [circlesForm, setCirclesForm] = useState(() => withCategoryCircles(MiloStore.getAjustes()));
  const [logoOpen, setLogoOpen] = useState(false);
  const [logoForm, setLogoForm] = useState(() => normalizeSiteLogo());
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [rewardsForm, setRewardsForm] = useState(() => normalizeRewardsStrip());
  const [homeTabsOpen, setHomeTabsOpen] = useState(false);
  const [homeTabsForm, setHomeTabsForm] = useState(() => withHomeTabRows());
  const [featuredServicios, setFeaturedServicios] = useState([]);
  const [catalogServicios, setCatalogServicios] = useState(() => MiloStore.getServicios());
  const [homeStoryOpen, setHomeStoryOpen] = useState(false);
  const [homeStorySection, setHomeStorySection] = useState('pasillos');
  const [homeStoryForm, setHomeStoryForm] = useState(() => withHomeStory());
  const [tiendaPageOpen, setTiendaPageOpen] = useState(false);
  const [tiendaPageForm, setTiendaPageForm] = useState(() => withTiendaPage());

  const openProduct = (item = null) => {
    setProduct(item);
    setProductForm(item
      ? {
          ...EMPTY_PRODUCT,
          ...withProductPasillos(item),
          ...normalizeMediaCrop(item),
          stockMinimo: item.stockMinimo ?? 3,
          variantes: (item.variantes?.length
            ? item.variantes
            : [{ id: `${item.id}_std`, nombre: '', precio: item.precio, stock: item.stock, stockMinimo: item.stockMinimo ?? 3 }]
          ).map((variante, index) => ({
            id: variante.id || `${item.id}_v${index + 1}`,
            nombre: variante.nombre || '',
            precio: variante.precio ?? '',
            stock: variante.stock ?? 0,
            stockMinimo: variante.stockMinimo ?? 3
          }))
        }
      : { ...EMPTY_PRODUCT, variantes: [{ ...EMPTY_VARIANTE, id: `tmp_${Date.now()}` }] });
    setProductOpen(true);
  };

  const openBanner = (item = null) => {
    const usable = item && item.id && item.id !== 'fallback' ? withBannerFrames(item) : null;
    setBanner(usable);
    setBannerForm(usable ? bannerDraft(usable) : emptyBannerForm());
    setBannerOpen(true);
  };

  const openBlog = (item = null) => {
    setBlog(item);
    setBlogForm(item ? { ...EMPTY_BLOG, ...item, ...normalizeMediaCrop(item) } : EMPTY_BLOG);
    setBlogOpen(true);
  };

  const openServicio = (item = null) => {
    setServicio(item);
    setServicioForm(item ? { ...EMPTY_SERVICIO, ...item, ...normalizeMediaCrop(item) } : EMPTY_SERVICIO);
    setServicioOpen(true);
  };

  const openFicha = (item) => {
    if (!item) return;
    setCliente(item);
    setFichaForm({
      tipoPiel: item.tipoPiel || '',
      diagnostico: item.diagnostico || '',
      activosRecomendados: item.activosRecomendados || '',
      proximaSesion: item.proximaSesion || '',
      skinConcierge: item.skinConcierge || 'Equipo clínico Milo',
      notasCRM: item.notasCRM || ''
    });
  };

  const openPromo = () => {
    setPromoForm(MiloStore.getAjustes());
    setPromoOpen(true);
  };

  const openCategoryCircles = () => {
    setCirclesForm(withCategoryCircles(MiloStore.getAjustes()));
    setCirclesOpen(true);
  };

  const openLogo = () => {
    setLogoForm(normalizeSiteLogo(MiloStore.getAjustes().logo));
    setLogoOpen(true);
  };

  const openRewards = () => {
    setRewardsForm(normalizeRewardsStrip(MiloStore.getAjustes().rewardsStrip));
    setRewardsOpen(true);
  };

  const openHomeTabs = () => {
    const rows = withHomeTabRows(MiloStore.getAjustes());
    const servicios = MiloStore.getServicios();
    setHomeTabsForm(rows);
    setCatalogServicios(servicios);
    setFeaturedServicios(pickFeaturedServicios(servicios, rows.picks.servicioIds));
    setHomeTabsOpen(true);
  };

  const openHomeStory = (section = 'pasillos') => {
    setHomeStoryForm(withHomeStory(MiloStore.getAjustes()));
    setHomeStorySection(section);
    setHomeStoryOpen(true);
  };
  const openHomePasillos = () => openHomeStory('pasillos');
  const openHomeMarcas = () => openHomeStory('marcas');
  const openHomeEstetica = () => openHomeStory('estetica');

  const openTiendaPage = () => {
    setTiendaPageForm(withTiendaPage(MiloStore.getAjustes()));
    setTiendaPageOpen(true);
  };

  useEffect(() => {
    const refreshCatalog = () => {
      setPasillos(MiloStore.getPasillos());
      setMarcas(MiloStore.getMarcas());
      setEtiquetas(MiloStore.getEtiquetas());
    };
    window.addEventListener('milo_store_updated', refreshCatalog);
    return () => window.removeEventListener('milo_store_updated', refreshCatalog);
  }, []);

  const value = useMemo(
    () => ({ openProduct, openBanner, openBlog, openServicio, openFicha, openPromo, openCategoryCircles, openLogo, openRewards, openHomeTabs, openHomePasillos, openHomeMarcas, openHomeEstetica, openTiendaPage, bannerOpen }),
    [bannerOpen]
  );

  return (
    <CmsEditContext.Provider value={value}>
      {children}

      {productOpen && (
        <Modal title={product ? (esStockGenerico(product) ? 'Editar producto genérico' : 'Editar producto') : 'Nuevo producto'} onClose={() => setProductOpen(false)} wide>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const variantes = (productForm.variantes || []).map((variante, index) => ({
                id: variante.id || `v_${Date.now()}_${index}`,
                nombre: String(variante.nombre || '').trim(),
                precio: Number(variante.precio) || 0,
                stock: Number(variante.stock) || 0,
                stockMinimo: Math.max(0, Number(variante.stockMinimo) || 0)
              }));
              if (!variantes.length) return;
              if (variantes.length > 1 && variantes.some((item) => !item.nombre)) {
                window.alert('Cada presentación necesita un nombre (por ejemplo 7 sobres o 250 ml).');
                return;
              }
              const assigned = productPasillos(productForm);
              if (!assigned.length) {
                window.alert('Elige al menos un pasillo para el producto.');
                return;
              }
              const payload = {
                ...productForm,
                pasillos: assigned,
                pasillo: assigned[0],
                precio: variantes[0].precio,
                moneda: 'COP',
                stock: variantes.reduce((sum, item) => sum + item.stock, 0),
                stockMinimo: variantes[0].stockMinimo,
                cuposReserva: Number(productForm.cuposReserva) || 0,
                variantes
              };
              if (product) MiloStore.updateProducto(product.id, payload);
              else MiloStore.addProducto(payload);
              setProductOpen(false);
            }}
            className="space-y-4"
          >
            <PhotoCropFields
              value={productForm}
              onChange={setProductForm}
              seed={product?.id || 'producto'}
              label="Foto de vitrina"
              frameRatio={1}
            />
            <div>
              <label className={labelClass}>Nombre *</label>
              <input required value={productForm.nombre} onChange={(e) => setProductForm({ ...productForm, nombre: e.target.value })} className={inputClass} />
            </div>
            <SelectFromCatalog
              label="Marca"
              value={productForm.marca || ''}
              onChange={(marca) => setProductForm({ ...productForm, marca })}
              items={marcas}
              onCreate={(nombre) => MiloStore.addMarca({ nombre })}
              placeholder="Selecciona una marca"
            />
            <div>
              <label className={labelClass}>Pasillos</label>
              <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                Marca uno o varios. El producto se muestra en cada pasillo elegido.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pasillos.filter((item) => item.id !== 'todos').map((pasillo) => {
                  const selected = productPasillos(productForm).includes(pasillo.id);
                  return (
                    <button
                      key={pasillo.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        const current = productPasillos(productForm);
                        const next = selected
                          ? current.filter((id) => id !== pasillo.id)
                          : [...current, pasillo.id];
                        if (!next.length) return;
                        setProductForm({ ...productForm, pasillos: next, pasillo: next[0] });
                      }}
                      className={`border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                        selected
                          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                          : 'border-neutral-300 text-neutral-600 dark:border-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {pasillo.nombre}
                    </button>
                  );
                })}
              </div>
            </div>
            <SelectFromCatalog
              label="Etiqueta"
              value={productForm.tag || ''}
              onChange={(tag) => setProductForm({ ...productForm, tag })}
              items={etiquetas}
              onCreate={(nombre) => MiloStore.addEtiqueta({ nombre })}
              placeholder="Sin etiqueta"
            />
            <PresentacionesFields
              product={product}
              enCamino={productForm.enCamino}
              variantes={productForm.variantes || []}
              onChange={(variantes) => setProductForm({ ...productForm, variantes })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={productForm.enCamino} onChange={(e) => setProductForm({ ...productForm, enCamino: e.target.checked })} />
              Producto en camino (preventa)
            </label>
            {productForm.enCamino && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Fecha de arribo</label>
                  <input type="date" value={productForm.fechaLlegada || ''} onChange={(e) => setProductForm({ ...productForm, fechaLlegada: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cupos de reserva</label>
                  <input type="number" value={productForm.cuposReserva} onChange={(e) => setProductForm({ ...productForm, cuposReserva: e.target.value })} className={inputClass} />
                </div>
              </div>
            )}
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea rows={2} value={productForm.descripcion} onChange={(e) => setProductForm({ ...productForm, descripcion: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ingredientes</label>
              <input value={productForm.ingredientes} onChange={(e) => setProductForm({ ...productForm, ingredientes: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Modo de uso</label>
              <textarea rows={2} value={productForm.modoUso} onChange={(e) => setProductForm({ ...productForm, modoUso: e.target.value })} className={inputClass} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setProductOpen(false)} className={ghostBtn}>Cancelar</button>
              <button type="submit" className={primaryBtn}>
                {!product
                  ? 'Publicar en tienda'
                  : esStockGenerico(product) && !productForm.enCamino
                    ? 'Guardar como stock real'
                    : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {bannerOpen && (
        <Modal title={banner ? 'Editar banner' : 'Nuevo banner'} wide onClose={() => setBannerOpen(false)}>
          <form
            key={banner?.id || 'nuevo-banner'}
            onSubmit={(event) => {
              event.preventDefault();
              const payload = bannerPersistPayload(bannerForm);
              if (banner) MiloStore.updateBanner(banner.id, payload);
              else MiloStore.addBanner(payload);
              setBannerOpen(false);
            }}
            className="space-y-4"
          >
            <BannerPhotosFields
              bannerId={banner?.id || 'nuevo'}
              form={bannerForm}
              onChange={(patch) => setBannerForm((current) => ({ ...current, ...patch }))}
            />
            <div>
              <label className={labelClass}>Etiqueta</label>
              <input value={bannerForm.tag} onChange={(e) => setBannerForm({ ...bannerForm, tag: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Título *</label>
              <input required value={bannerForm.titulo} onChange={(e) => setBannerForm({ ...bannerForm, titulo: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea rows={2} value={bannerForm.descripcion} onChange={(e) => setBannerForm({ ...bannerForm, descripcion: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Botón principal</label>
                <input value={bannerForm.botonTexto} onChange={(e) => setBannerForm({ ...bannerForm, botonTexto: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Enlace</label>
                <input value={bannerForm.botonEnlace} onChange={(e) => setBannerForm({ ...bannerForm, botonEnlace: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Botón secundario</label>
                <input value={bannerForm.botonSecundarioTexto} onChange={(e) => setBannerForm({ ...bannerForm, botonSecundarioTexto: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Enlace secundario</label>
                <input value={bannerForm.botonSecundarioEnlace} onChange={(e) => setBannerForm({ ...bannerForm, botonSecundarioEnlace: e.target.value })} className={inputClass} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={bannerForm.activo} onChange={(e) => setBannerForm({ ...bannerForm, activo: e.target.checked })} />
              Visible en Inicio
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setBannerOpen(false)} className={ghostBtn}>Cancelar</button>
              <button type="submit" className={primaryBtn}>Publicar banner</button>
            </div>
          </form>
        </Modal>
      )}

      {blogOpen && (
        <Modal title={blog ? 'Editar artículo' : 'Nuevo artículo'} onClose={() => setBlogOpen(false)} wide>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (blog) MiloStore.updateBlogPost(blog.id, blogForm);
              else MiloStore.addBlogPost(blogForm);
              setBlogOpen(false);
            }}
            className="space-y-4"
          >
            <PhotoCropFields
              value={blogForm}
              onChange={setBlogForm}
              seed={blog?.id || 'blog'}
              label="Portada del artículo"
              frameRatio={16 / 10}
            />
            <div>
              <label className={labelClass}>Título *</label>
              <input required value={blogForm.titulo} onChange={(e) => setBlogForm({ ...blogForm, titulo: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Categoría</label>
                <input value={blogForm.categoria} onChange={(e) => setBlogForm({ ...blogForm, categoria: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Autor</label>
                <input value={blogForm.autor} onChange={(e) => setBlogForm({ ...blogForm, autor: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Tiempo de lectura</label>
              <input value={blogForm.tiempoLectura} onChange={(e) => setBlogForm({ ...blogForm, tiempoLectura: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Resumen</label>
              <textarea rows={2} value={blogForm.resumen} onChange={(e) => setBlogForm({ ...blogForm, resumen: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contenido</label>
              <textarea rows={6} value={blogForm.contenido} onChange={(e) => setBlogForm({ ...blogForm, contenido: e.target.value })} className={inputClass} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setBlogOpen(false)} className={ghostBtn}>Cancelar</button>
              <button type="submit" className={primaryBtn}>{blog ? 'Guardar' : 'Publicar'}</button>
            </div>
          </form>
        </Modal>
      )}

      {servicioOpen && (
        <Modal title={servicio ? 'Editar servicio' : 'Nuevo servicio'} onClose={() => setServicioOpen(false)} wide>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const payload = {
                ...servicioForm,
                duracionMinutos: Number(servicioForm.duracionMinutos) || 60,
                precio: Number(servicioForm.precio) || 0
              };
              if (servicio) MiloStore.updateServicio(servicio.id, payload);
              else MiloStore.addServicio(payload);
              setServicioOpen(false);
            }}
            className="space-y-4"
          >
            <PhotoCropFields
              value={servicioForm}
              onChange={setServicioForm}
              seed={servicio?.id || 'servicio'}
              label="Foto del tratamiento"
              frameRatio={3 / 2}
            />
            <div>
              <label className={labelClass}>Título *</label>
              <input required value={servicioForm.titulo} onChange={(e) => setServicioForm({ ...servicioForm, titulo: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Categoría</label>
                <input value={servicioForm.categoria} onChange={(e) => setServicioForm({ ...servicioForm, categoria: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Duración (min)</label>
                <input type="number" value={servicioForm.duracionMinutos} onChange={(e) => setServicioForm({ ...servicioForm, duracionMinutos: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Precio COP *</label>
              <input type="number" step="1" min="0" required value={servicioForm.precio} onChange={(e) => setServicioForm({ ...servicioForm, precio: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea rows={2} value={servicioForm.descripcion} onChange={(e) => setServicioForm({ ...servicioForm, descripcion: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Recomendado para</label>
              <input value={servicioForm.recomendado} onChange={(e) => setServicioForm({ ...servicioForm, recomendado: e.target.value })} className={inputClass} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setServicioOpen(false)} className={ghostBtn}>Cancelar</button>
              <button type="submit" className={primaryBtn}>Publicar en cabina</button>
            </div>
          </form>
        </Modal>
      )}

      {cliente && (
        <Modal title={`Ficha de ${cliente.nombre}`} onClose={() => setCliente(null)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              MiloStore.updateCliente(cliente.id, fichaForm);
              setCliente(null);
            }}
            className="space-y-4"
          >
            <div>
              <label className={labelClass}>Tipo de piel o perfil</label>
              <input value={fichaForm.tipoPiel} onChange={(e) => setFichaForm({ ...fichaForm, tipoPiel: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Diagnóstico (Mi Burbuja)</label>
              <textarea rows={2} value={fichaForm.diagnostico} onChange={(e) => setFichaForm({ ...fichaForm, diagnostico: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Activos recomendados</label>
              <textarea rows={2} value={fichaForm.activosRecomendados} onChange={(e) => setFichaForm({ ...fichaForm, activosRecomendados: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Próxima sesión</label>
              <input value={fichaForm.proximaSesion} onChange={(e) => setFichaForm({ ...fichaForm, proximaSesion: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Concierge Milo</label>
              <input value={fichaForm.skinConcierge} onChange={(e) => setFichaForm({ ...fichaForm, skinConcierge: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Notas internas CRM</label>
              <textarea rows={3} value={fichaForm.notasCRM} onChange={(e) => setFichaForm({ ...fichaForm, notasCRM: e.target.value })} className={inputClass} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCliente(null)} className={ghostBtn}>Cancelar</button>
              <button type="submit" className={primaryBtn}>Publicar en Mi Burbuja</button>
            </div>
          </form>
        </Modal>
      )}

      {promoOpen && (
        <Modal title="Barra promocional" onClose={() => setPromoOpen(false)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              MiloStore.saveAjustes(promoForm);
              setPromoOpen(false);
            }}
            className="space-y-4"
          >
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={promoForm.promoActivo !== false}
                onChange={(e) => setPromoForm({ ...promoForm, promoActivo: e.target.checked })}
              />
              Mostrar barra
            </label>
            <div>
              <label className={labelClass}>Texto</label>
              <input value={promoForm.promoTexto || ''} onChange={(e) => setPromoForm({ ...promoForm, promoTexto: e.target.value })} className={inputClass} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setPromoOpen(false)} className={ghostBtn}>Cancelar</button>
              <button type="submit" className={primaryBtn}>Publicar</button>
            </div>
          </form>
        </Modal>
      )}

      {circlesOpen && (
        <Modal title="Círculos de Inicio" onClose={() => setCirclesOpen(false)} className="max-w-5xl">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const current = MiloStore.getAjustes();
              MiloStore.saveAjustes({
                ...current,
                categoryCircles: circlesForm.circles,
                categoryCirclesAlign: circlesForm.align
              });
              setCirclesOpen(false);
            }}
            className="space-y-4"
          >
            <p className="text-sm text-neutral-500">
              Sube una foto por círculo, elige el recorte y arrastra la vista previa para cambiar el orden. Lo que quede dentro del círculo es lo que se publica.
            </p>
            <CategoryCirclesFields form={circlesForm} onChange={setCirclesForm} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCirclesOpen(false)} className={ghostBtn}>Cancelar</button>
              <button type="submit" className={primaryBtn}>Publicar</button>
            </div>
          </form>
        </Modal>
      )}

      {logoOpen && (
        <Modal title="Logo del sitio" onClose={() => setLogoOpen(false)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const current = MiloStore.getAjustes();
              MiloStore.saveAjustes({ ...current, logo: normalizeSiteLogo(logoForm) });
              setLogoOpen(false);
            }}
            className="space-y-4"
          >
            <p className="text-sm text-neutral-500">
              Sube la foto, recórtala y usa acercar, espejo o giro. Lo que quede dentro del círculo es lo que se publica junto al nombre.
            </p>
            <ImageFocusPicker
              src={logoForm.imagen}
              seed="site-logo"
              posX={logoForm.posX}
              posY={logoForm.posY}
              zoom={logoForm.zoom}
              flipX={logoForm.flipX}
              flipY={logoForm.flipY}
              rotate={logoForm.rotate}
              onChange={(patch) => setLogoForm((current) => ({ ...current, ...patch }))}
              grabHint="Agarra la foto y muévela: lo que quede dentro del círculo es el logo"
            />
            <ImageUploader
              compact
              label="Foto del logo"
              value={logoForm.imagen}
              onChange={(imagen) => setLogoForm((current) => ({ ...current, imagen }))}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setLogoOpen(false)} className={ghostBtn}>Cancelar</button>
              <button type="submit" className={primaryBtn}>Publicar</button>
            </div>
          </form>
        </Modal>
      )}

      {rewardsOpen && (
        <Modal title="Franja Rewards" onClose={() => setRewardsOpen(false)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const current = MiloStore.getAjustes();
              MiloStore.saveAjustes({ ...current, rewardsStrip: normalizeRewardsStrip(rewardsForm) });
              setRewardsOpen(false);
            }}
            className="space-y-4"
          >
            <p className="text-sm text-neutral-500">
              Elige el texto, qué va en negrita o cursiva, el tamaño y el espacio de la franja negra bajo el banner.
            </p>
            <RewardsStripFields form={rewardsForm} onChange={setRewardsForm} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setRewardsOpen(false)} className={ghostBtn}>Cancelar</button>
              <button type="submit" className={primaryBtn}>Publicar</button>
            </div>
          </form>
        </Modal>
      )}

      {homeTabsOpen && (
        <Modal title="Listados de Inicio" onClose={() => setHomeTabsOpen(false)} className="max-w-5xl">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const currentServicios = MiloStore.getServicios();
              const featuredById = new Map(featuredServicios.map((item) => [item.id, item]));
              MiloStore.saveServicios(currentServicios.map((item) => (
                featuredById.has(item.id) ? { ...item, ...featuredById.get(item.id) } : item
              )));
              const current = MiloStore.getAjustes();
              MiloStore.saveAjustes({
                ...current,
                homeTabRows: withHomeTabRows({
                  ...homeTabsForm,
                  picks: {
                    ...homeTabsForm.picks,
                    servicioIds: featuredServicios.map((item) => item.id).filter(Boolean)
                  }
                })
              });
              setHomeTabsOpen(false);
            }}
            className="space-y-4"
          >
            <p className="text-sm text-neutral-500">
              Primero acomoda las fotos de cabina: acercar, espejo, invertir y girar. Luego los nombres y enlaces.
            </p>
            <HomeTabRowsFields
              form={homeTabsForm}
              onChange={setHomeTabsForm}
              servicios={catalogServicios}
              featuredServicios={featuredServicios}
              onFeaturedServiciosChange={setFeaturedServicios}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setHomeTabsOpen(false)} className={ghostBtn}>Cancelar</button>
              <button type="submit" className={primaryBtn}>Publicar</button>
            </div>
          </form>
        </Modal>
      )}

      {homeStoryOpen && (
        <Modal
          title={homeStorySection === 'marcas' ? 'Marcas en vitrina' : homeStorySection === 'estetica' ? 'Estética y bienestar' : 'Pasillos de la casa'}
          onClose={() => setHomeStoryOpen(false)}
          className={homeStorySection === 'estetica' ? 'max-w-xl' : 'max-w-5xl'}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const current = MiloStore.getAjustes();
              MiloStore.saveAjustes({ ...current, homeStory: withHomeStory(homeStoryForm) });
              setHomeStoryOpen(false);
            }}
            className="space-y-4"
          >
            <p className="text-sm text-neutral-500">
              {homeStorySection === 'estetica'
                ? 'Edita el recuadro negro de Inicio. Las notas del blog se editan cada una desde su tarjeta.'
                : 'Sube foto, recorta, cambia títulos, textos y enlaces. Lo que quede en el recuadro es lo que se publica.'}
            </p>
            <HomeStoryFields form={homeStoryForm} onChange={setHomeStoryForm} section={homeStorySection} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setHomeStoryOpen(false)} className={ghostBtn}>Cancelar</button>
              <button type="submit" className={primaryBtn}>Publicar</button>
            </div>
          </form>
        </Modal>
      )}

      {tiendaPageOpen && (
        <Modal title="Cabecera de Tienda" onClose={() => setTiendaPageOpen(false)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const current = MiloStore.getAjustes();
              MiloStore.saveAjustes({ ...current, tiendaPage: withTiendaPage(tiendaPageForm) });
              setTiendaPageOpen(false);
            }}
            className="space-y-4"
          >
            <p className="text-sm text-neutral-500">
              Título y descripción que aparecen arriba de los pasillos en Tienda.
            </p>
            <div>
              <label className={labelClass}>Título</label>
              <input
                value={tiendaPageForm.title}
                onChange={(event) => setTiendaPageForm({ ...tiendaPageForm, title: event.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea
                rows={4}
                value={tiendaPageForm.description}
                onChange={(event) => setTiendaPageForm({ ...tiendaPageForm, description: event.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setTiendaPageOpen(false)} className={ghostBtn}>Cancelar</button>
              <button type="submit" className={primaryBtn}>Publicar</button>
            </div>
          </form>
        </Modal>
      )}
    </CmsEditContext.Provider>
  );
}

export function useCmsEdit() {
  const value = useContext(CmsEditContext);
  if (!value) {
    throw new Error('useCmsEdit debe usarse dentro de CmsEditProvider');
  }
  return value;
}

export function useVisualEdit() {
  const { profile } = useAuth();
  const location = useLocation();
  const gerente = isGerente(profile?.rol);
  const staff = isStaff(profile?.rol);
  const editing = staff && hasEditParam(location.search);
  return {
    editing,
    canEditCatalog: editing && gerente,
    canEditFicha: editing && staff
  };
}
