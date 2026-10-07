import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MiloStore } from '../../services/miloStore';
import ProductCard from '../../components/shop/ProductCard';
import ProductDetail, { pickVarianteId } from '../../components/shop/ProductDetail';
import ProductVisual from '../../components/shop/ProductVisual';
import { BannerStage } from '../../components/shop/BannerFrame';
import { BANNER_PHOTO_SLOT_CLASS, bannerMatClass, findBannerTransicion } from '../../lib/bannerFrames';
import { categoryRowClass, withCategoryCircles } from '../../lib/categoryCircles';
import { productInPasillo } from '../../lib/pasillos';
import { normalizeRewardsStrip } from '../../lib/rewardsStrip';
import { homeTabRowActionClass, pickFeaturedServicios, tabRowClass, withHomeTabRows } from '../../lib/homeTabRows';
import { storyCardVisualProps, withHomeStory } from '../../lib/homeStory';
import { visualCropProps } from '../../lib/mediaCrop';
import EditHotspot from '../../components/admin/EditHotspot';
import RewardsStrip from '../../components/shop/RewardsStrip';
import { useCmsEdit, useVisualEdit } from '../../context/CmsEditContext';
import { withEditParam } from '../../lib/visualEdit';
import { formatCOP } from '../../lib/money';

function SectionHeader({ title, tabs, activeTab, onTab, actionLabel, onAction, align = 'center', centered, editable, onEdit }) {
  const body = (
    <div className={`mb-6 flex flex-col gap-3 ${centered ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:gap-4'}`}>
      <div className={`flex items-end ${tabs ? `hide-scrollbar min-w-0 flex-nowrap gap-2.5 overflow-x-auto sm:flex-1 sm:gap-5 ${tabRowClass(align)}` : centered ? 'justify-center' : 'flex-wrap gap-5'}`}>
        {tabs ? (
          tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTab(tab.id)}
              className={`shrink-0 whitespace-nowrap text-base font-medium tracking-tight sm:text-2xl lg:text-3xl ${
                activeTab === tab.id
                  ? 'text-neutral-900 dark:text-white'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))
        ) : (
          <h2 className="text-2xl font-medium tracking-tight text-neutral-900 dark:text-white sm:text-3xl">{title}</h2>
        )}
      </div>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className={`shrink-0 text-sm font-medium underline-offset-4 hover:underline ${centered ? '' : homeTabRowActionClass(align)}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );

  return (
    <EditHotspot enabled={editable} onEdit={onEdit} label="Editar listado">
      {body}
    </EditHotspot>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { canEditCatalog } = useVisualEdit();
  const { openBanner, openProduct, openServicio, openCategoryCircles, openRewards, openHomeTabs, openHomePasillos, openHomeMarcas, openHomeEstetica, bannerOpen } = useCmsEdit();
  const go = (to) => navigate(canEditCatalog ? withEditParam(to) : to);
  const [banners, setBanners] = useState([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [productos, setProductos] = useState([]);
  const [pasillos, setPasillos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVarianteId, setSelectedVarianteId] = useState('');
  const [servicios, setServicios] = useState([]);
  const [productTab, setProductTab] = useState('bestsellers');
  const [picksTab, setPicksTab] = useState('cabina');
  const [notice, setNotice] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [categoryCircles, setCategoryCircles] = useState(() => withCategoryCircles(MiloStore.getAjustes()));
  const [rewardsStrip, setRewardsStrip] = useState(() => normalizeRewardsStrip(MiloStore.getAjustes().rewardsStrip));
  const [homeTabRows, setHomeTabRows] = useState(() => withHomeTabRows(MiloStore.getAjustes()));
  const [homeStory, setHomeStory] = useState(() => withHomeStory(MiloStore.getAjustes()));

  const loadData = () => {
    setBanners(MiloStore.getBanners().filter((banner) => banner.activo));
    setProductos(MiloStore.getProductos());
    setPasillos(MiloStore.getPasillos());
    const ajustes = MiloStore.getAjustes();
    const allServicios = MiloStore.getServicios();
    setServicios(pickFeaturedServicios(allServicios, withHomeTabRows(ajustes).picks.servicioIds));
    setCategoryCircles(withCategoryCircles(ajustes));
    setRewardsStrip(normalizeRewardsStrip(ajustes.rewardsStrip));
    setHomeTabRows(withHomeTabRows(ajustes));
    setHomeStory(withHomeStory(ajustes));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('milo_store_updated', loadData);
    return () => window.removeEventListener('milo_store_updated', loadData);
  }, []);

  const slides = banners.length
    ? banners
    : [{
        id: 'fallback',
        tag: 'CENTRO DE ESTÉTICA Y BIENESTAR',
        titulo: 'Rostro, cuerpo y bienestar.',
        descripcion: 'Cabina facial y corporal, protocolos de bienestar y tienda con marcas como fuXion y Riman.',
        botonTexto: 'Agendar valoración',
        botonEnlace: '/citas',
        botonSecundarioTexto: 'Explorar tienda',
        botonSecundarioEnlace: '/tienda',
      }];

  useEffect(() => {
    if (bannerOpen) setPaused(true);
  }, [bannerOpen]);

  useEffect(() => {
    if (paused || bannerOpen || slides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setCurrentBannerIdx((idx) => (idx + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [paused, bannerOpen, slides.length, currentBannerIdx]);

  const bannerGesture = useRef(null);

  const isBannerControl = (target) => Boolean(target?.closest?.('button, a, input, textarea, select, label'));

  const onBannerPointerDown = (event) => {
    if (event.button && event.button !== 0) return;
    if (isBannerControl(event.target)) return;
    bannerGesture.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };
  };

  const onBannerPointerEnd = (event) => {
    const start = bannerGesture.current;
    bannerGesture.current = null;
    if (!start || start.pointerId !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (absX > 40 && absX > absY * 1.15) {
      if (slides.length < 2) return;
      setCurrentBannerIdx((idx) => (dx > 0
        ? (idx - 1 + slides.length) % slides.length
        : (idx + 1) % slides.length));
      return;
    }
    if (absX < 12 && absY < 12) {
      setPaused((value) => !value);
    }
  };

  const onBannerKeyDown = (event) => {
    if (slides.length < 2) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setCurrentBannerIdx((idx) => (idx - 1 + slides.length) % slides.length);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setCurrentBannerIdx((idx) => (idx + 1) % slides.length);
    }
  };

  const activeBanner = slides[currentBannerIdx] || slides[0];
  const bannerMotion = findBannerTransicion(activeBanner?.transicion).id;
  const copyMotion = bannerMotion === 'cascada' ? 'fundido' : bannerMotion;
  const copyMotionClass = copyMotion !== 'instantaneo' ? `banner-motion-${copyMotion}` : '';

  const tabbedProducts = useMemo(() => {
    if (productTab === 'nuevos') {
      return productos.filter((item) => item.tag === 'Nuevo' || item.tag === 'Preventa').slice(0, 8);
    }
    if (productTab === 'camino') {
      return productos.filter((item) => item.enCamino).slice(0, 8);
    }
    const bestsellers = productos.filter((item) => ['Bestseller', 'Favorito', 'Popular', 'Esencial'].includes(item.tag));
    return (bestsellers.length ? bestsellers : productos).slice(0, 8);
  }, [productos, productTab]);

  const shownProducts = tabbedProducts.length ? tabbedProducts : productos.slice(0, 8);

  const handleQuickBuy = (product, tipo, varianteId) => {
    const added = MiloStore.addToCarrito(product, tipo, varianteId);
    setNotice(added ? `${product.nombre} se añadió a tu bolsa` : `No hay stock de ${product.nombre}`);
    window.setTimeout(() => setNotice(''), 2500);
  };

  const openProductDetail = (product, varianteId) => {
    setSelectedProduct(product);
    setSelectedVarianteId(pickVarianteId(product, varianteId));
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
    setSelectedVarianteId('');
  };

  const submitNewsletter = (event) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;
    MiloStore.addNewsletterEmail(newsletterEmail);
    setNewsletterDone(true);
  };

  return (
    <div className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg">
          {notice}
        </div>
      )}

      <section
        className="relative touch-pan-y select-none bg-[#f4f1ea]"
        tabIndex={0}
        aria-roledescription="carrusel"
        aria-label={paused
          ? 'Banner en pausa. Toca para reanudar. Desliza para cambiar de publicación.'
          : 'Banner. Toca para pausar. Desliza a los lados para cambiar de publicación.'}
        onPointerDown={onBannerPointerDown}
        onPointerUp={onBannerPointerEnd}
        onPointerCancel={() => { bannerGesture.current = null; }}
        onKeyDown={onBannerKeyDown}
      >
        <EditHotspot enabled={canEditCatalog} onEdit={() => openBanner(activeBanner)} className="block">
        <div className="mx-auto grid max-w-[1440px] lg:min-h-[72vh] lg:grid-cols-2 lg:items-stretch">
          <div
            key={`copy-${activeBanner.id}-${currentBannerIdx}`}
            className={`order-2 flex min-h-[16.75rem] flex-col justify-center px-5 py-7 sm:min-h-[18rem] sm:py-10 lg:order-1 lg:min-h-0 lg:px-16 ${copyMotionClass}`}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
              {activeBanner.tag || 'La Burbuja de Milo'}
            </p>
            <h1 className="line-clamp-3 min-h-[3.3em] max-w-xl text-3xl font-medium leading-[1.1] tracking-tight text-neutral-900 dark:text-white sm:min-h-0 sm:text-5xl lg:text-6xl">
              {activeBanner.titulo}
            </h1>
            <p className="mt-4 line-clamp-3 min-h-[4.5rem] max-w-lg text-sm leading-relaxed text-neutral-600 sm:mt-5 sm:min-h-0 sm:text-base">
              {activeBanner.descripcion}
            </p>
            <div className="mt-6 flex flex-nowrap gap-2 sm:mt-8 sm:gap-3">
              <button
                type="button"
                onClick={() => go(activeBanner.botonEnlace || '/citas')}
                className="min-w-0 flex-1 whitespace-nowrap bg-neutral-900 px-2 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white sm:flex-none sm:px-6 sm:py-3 sm:text-[11px] sm:tracking-[0.18em]"
              >
                {activeBanner.botonTexto || 'Shop now'}
              </button>
              <button
                type="button"
                onClick={() => go(activeBanner.botonSecundarioEnlace || '/tienda')}
                className="min-w-0 flex-1 whitespace-nowrap border border-neutral-900 px-2 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-900 dark:border-white dark:text-white sm:flex-none sm:px-6 sm:py-3 sm:text-[11px] sm:tracking-[0.18em]"
              >
                {activeBanner.botonSecundarioTexto || 'Ver tienda'}
              </button>
            </div>
          </div>
          <div className={`order-1 lg:order-2 ${BANNER_PHOTO_SLOT_CLASS} ${bannerMatClass(activeBanner)}`}>
            <div
              key={`photo-${activeBanner.id}-${currentBannerIdx}`}
              className="absolute inset-0"
            >
              <BannerStage banner={activeBanner} className="absolute inset-0" />
            </div>
            {slides.length > 1 ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center bg-gradient-to-t from-black/40 to-transparent pb-3 pt-10">
                <div className="pointer-events-auto flex items-center gap-1.5" role="tablist" aria-label="Publicaciones del banner">
                  {slides.map((slide, index) => {
                    const current = index === currentBannerIdx;
                    return (
                      <button
                        key={slide.id || index}
                        type="button"
                        role="tab"
                        aria-label={`Publicación ${index + 1} de ${slides.length}`}
                        aria-selected={current}
                        onClick={() => setCurrentBannerIdx(index)}
                        className={`rounded-full transition-[width,background-color] duration-300 ${
                          current
                            ? 'h-1.5 w-5 bg-white'
                            : 'h-1.5 w-1.5 bg-white/55 hover:bg-white/80'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        </EditHotspot>
      </section>

      <RewardsStrip
        strip={rewardsStrip}
        editable={canEditCatalog}
        onEdit={openRewards}
        onAction={() => {
          const href = rewardsStrip.buttonHref || '/login';
          if (/^https?:/i.test(href)) {
            window.location.assign(href);
            return;
          }
          go(href);
        }}
      />

      <section className="mx-auto max-w-[1440px] px-5 py-12 lg:px-16">
        <EditHotspot enabled={canEditCatalog} onEdit={openCategoryCircles} label="Editar círculos" className="block">
          <div className="hide-scrollbar overflow-x-auto">
            <div className={`flex min-w-full w-max gap-2.5 sm:gap-6 ${categoryRowClass(categoryCircles.align)}`}>
              {categoryCircles.circles.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => go(category.to)}
                  className="w-[4.35rem] shrink-0 text-center sm:w-28 md:w-36"
                >
                  <ProductVisual
                    seed={category.seed}
                    src={category.imagen}
                    posX={category.posX}
                    posY={category.posY}
                    zoom={category.zoom}
                    flipX={category.flipX}
                    flipY={category.flipY}
                    rotate={category.rotate}
                    focalCrop
                    className="mx-auto aspect-square w-full rounded-full"
                  />
                  <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-700 sm:mt-3 sm:text-xs sm:tracking-[0.12em]">
                    {category.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </EditHotspot>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-6 lg:px-16">
        <SectionHeader
          tabs={homeTabRows.products.tabs}
          align={homeTabRows.products.align}
          activeTab={productTab}
          onTab={setProductTab}
          actionLabel={homeTabRows.products.actionLabel}
          onAction={() => {
            const to = homeTabRows.products.actionTo || '/tienda';
            if (productTab === 'camino' && (to === '/tienda' || to === '/tienda/')) {
              go('/tienda?filtro=en-camino');
              return;
            }
            go(to);
          }}
          editable={canEditCatalog}
          onEdit={openHomeTabs}
        />
        <div className="grid grid-cols-2 items-stretch gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shownProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickBuy={handleQuickBuy}
              onOpen={openProductDetail}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-16 lg:px-16">
        <SectionHeader
          tabs={homeTabRows.picks.tabs}
          align={homeTabRows.picks.align}
          activeTab={picksTab}
          onTab={setPicksTab}
          actionLabel={homeTabRows.picks.actionLabel}
          onAction={() => go(homeTabRows.picks.actionTo || '/citas')}
          editable={canEditCatalog}
          onEdit={openHomeTabs}
        />
        {picksTab === 'cabina' ? (
          <div className="grid auto-rows-fr grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {servicios.map((servicio) => (
              <EditHotspot key={servicio.id} enabled={canEditCatalog} onEdit={() => openServicio(servicio)} className="h-full">
              <article className="flex h-full min-h-0 flex-col border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-950">
                <ProductVisual {...visualCropProps(servicio)} className="h-48 w-full shrink-0" />
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">{servicio.categoria}</p>
                  <h3 className="mt-2 line-clamp-2 min-h-[2.75rem] text-base font-medium leading-snug text-neutral-900 dark:text-white">{servicio.titulo}</h3>
                  <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-neutral-500">{servicio.descripcion}</p>
                  <p className="mt-auto pt-4 text-sm font-semibold">{formatCOP(servicio.precio)}</p>
                  <button
                    type="button"
                    onClick={() => go(`/citas?servicio=${servicio.id}`)}
                    className="mt-4 w-full border border-neutral-900 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] hover:bg-neutral-900 hover:text-white"
                  >
                    Apartar cita
                  </button>
                </div>
              </article>
              </EditHotspot>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 items-stretch gap-x-4 gap-y-10 md:grid-cols-4">
            {productos.filter((item) => item.enCamino || item.precio < 140000).slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickBuy={handleQuickBuy}
                onOpen={openProductDetail}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#f6f6f6] py-16 dark:bg-neutral-900">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-16">
          <SectionHeader
            title={homeStory.pasillos.title}
            actionLabel={homeStory.pasillos.actionLabel}
            onAction={() => go(homeStory.pasillos.actionTo || '/tienda')}
            centered
            editable={canEditCatalog}
            onEdit={openHomePasillos}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {homeStory.pasillos.items.map((item) => (
              <EditHotspot key={item.id} enabled={canEditCatalog} onEdit={openHomePasillos} label="Editar pasillo">
                <button
                  type="button"
                  onClick={() => go(item.to)}
                  className="group overflow-hidden bg-white text-left dark:bg-neutral-950"
                >
                  <ProductVisual
                    {...storyCardVisualProps(item)}
                    variant="hero"
                    className="h-56 w-full"
                  />
                  <div className="p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">{item.title}</h3>
                    <p className="mt-2 text-sm text-neutral-500">{item.copy}</p>
                  </div>
                </button>
              </EditHotspot>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-16 lg:px-16">
        <SectionHeader
          title={homeStory.marcas.title}
          actionLabel={homeStory.marcas.actionLabel}
          onAction={() => go(homeStory.marcas.actionTo || '/tienda')}
          editable={canEditCatalog}
          onEdit={openHomeMarcas}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {homeStory.marcas.items.map((item) => (
            <EditHotspot key={item.id} enabled={canEditCatalog} onEdit={openHomeMarcas} label="Editar marca">
              <button
                type="button"
                onClick={() => go(item.to)}
                className="group grid overflow-hidden bg-[#f6f6f6] text-left dark:bg-neutral-900 md:grid-cols-2"
              >
                <ProductVisual
                  {...storyCardVisualProps(item)}
                  variant="hero"
                  className="h-48 w-full md:h-full"
                />
                <div className="flex flex-col justify-center p-6">
                  <h3 className="text-2xl font-medium tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">{item.copy}</p>
                  <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em]">{item.cta || 'Shop now'}</span>
                </div>
              </button>
            </EditHotspot>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-16 lg:px-16">
        <SectionHeader title="New arrivals" />
        <div className="grid gap-6 lg:grid-cols-3">
          {['bienestar', 'corporal', 'skincare']
            .map((pasillo) => productos.find((item) => productInPasillo(item, pasillo)))
            .filter(Boolean)
            .concat(productos)
            .filter((item, index, list) => list.findIndex((entry) => entry.id === item.id) === index)
            .slice(0, 3)
            .map((product) => (
            <EditHotspot key={product.id} enabled={canEditCatalog} onEdit={() => openProduct(product)}>
            <article className="flex flex-col">
              <button type="button" onClick={() => openProductDetail(product)} className="text-left">
                <ProductVisual {...visualCropProps(product, { seed: `${product.id}-editorial` })} variant="hero" className="h-64 w-full" />
                <h3 className="mt-4 text-xl font-medium text-neutral-900 dark:text-white">{product.nombre}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{product.descripcion}</p>
              </button>
              <button
                type="button"
                onClick={() => openProductDetail(product)}
                className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
              >
                Ver ficha <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </article>
            </EditHotspot>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-8 lg:px-16">
        <EditHotspot enabled={canEditCatalog} onEdit={openHomeEstetica} label="Editar bloque" tone="light" placement="left">
          <article className="bg-neutral-950 p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">{homeStory.estetica.tag}</p>
            <h2 className="mt-4 text-2xl font-medium">{homeStory.estetica.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              {homeStory.estetica.copy}
            </p>
          </article>
        </EditHotspot>
      </section>

      <section className="mt-8 bg-neutral-100 px-5 py-12">
        <div className="mx-auto flex max-w-[720px] flex-col items-center text-center">
          <h2 className="text-2xl font-medium text-neutral-900 dark:text-white">
            Recibe preventas, citas de cabina y novedades de bienestar
          </h2>
          {newsletterDone ? (
            <p className="mt-4 text-sm text-neutral-600">Listo. Te escribiremos con las próximas preventas.</p>
          ) : (
            <form onSubmit={submitNewsletter} className="mt-6 flex w-full max-w-md gap-2">
              <label className="sr-only" htmlFor="newsletter-email">Correo</label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder="Tu correo"
                className="h-12 flex-1 border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none dark:border-neutral-500 dark:bg-neutral-950 dark:text-white"
              />
              <button type="submit" className="bg-neutral-900 px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                Sign me up
              </button>
            </form>
          )}
        </div>
      </section>
      {selectedProduct && (
        <ProductDetail
          product={productos.find((item) => item.id === selectedProduct.id) || selectedProduct}
          pasillos={pasillos}
          canEditCatalog={canEditCatalog}
          openProduct={openProduct}
          varianteId={selectedVarianteId}
          onVariante={setSelectedVarianteId}
          onClose={closeProductDetail}
          onAdd={(product, tipo, varianteId) => {
            handleQuickBuy(product, tipo, varianteId);
            closeProductDetail();
          }}
        />
      )}
    </div>
  );
}
