import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MiloStore } from '../../services/miloStore';
import ProductCard from '../../components/shop/ProductCard';
import ProductDetail, { pickVarianteId } from '../../components/shop/ProductDetail';
import { Check, Search, ShoppingBag, X } from 'lucide-react';
import { useCmsEdit, useVisualEdit } from '../../context/CmsEditContext';
import EditHotspot from '../../components/admin/EditHotspot';
import { findVariante } from '../../lib/variantes';
import { productInPasillo, productPasillos } from '../../lib/pasillos';
import { withTiendaPage } from '../../lib/tiendaPage';
import { categoryRowClass, withTiendaMarcas } from '../../lib/tiendaMarcas';
import { groupTiendaFeed, tiendaFeedColumns, withTiendaFeed } from '../../lib/tiendaFeed';
import ProductVisual from '../../components/shop/ProductVisual';
import TiendaHero from '../../components/shop/TiendaHero';
import TiendaFeedInsert from '../../components/shop/TiendaFeedInsert';

export default function TiendaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { canEditCatalog } = useVisualEdit();
  const { openProduct, openTiendaPage, openPasillos, openTiendaMarcas, openTiendaFeed } = useCmsEdit();
  const filtroParam = searchParams.get('filtro');
  const pasilloParam = searchParams.get('pasillo');
  const queryParam = searchParams.get('q') || '';
  const productoParam = searchParams.get('producto') || '';
  const marcaParam = (searchParams.get('marca') || '').toLowerCase();
  const enCaminoLink = pasilloParam === 'en-camino' || filtroParam === 'en-camino';

  const [pasillos, setPasillos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [tiendaPage, setTiendaPage] = useState(() => withTiendaPage(MiloStore.getAjustes()));
  const [tiendaFeed, setTiendaFeed] = useState(() => withTiendaFeed(MiloStore.getAjustes()));
  const [tiendaMarcas, setTiendaMarcas] = useState(() => withTiendaMarcas(MiloStore.getAjustes(), MiloStore.getMarcas()));
  const activePasillo = marcaParam ? '' : (pasilloParam === 'en-camino' ? 'todos' : (pasilloParam || 'todos'));
  const [filtroTipo, setFiltroTipo] = useState(enCaminoLink ? 'en-camino' : 'todos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVarianteId, setSelectedVarianteId] = useState('');
  const [addedNotice, setAddedNotice] = useState(null);
  const [gridColumns, setGridColumns] = useState(() => tiendaFeedColumns());

  const loadData = () => {
    setPasillos(MiloStore.getPasillos());
    setProductos(MiloStore.getProductos());
    setMarcas(MiloStore.getMarcas());
    const ajustes = MiloStore.getAjustes();
    setTiendaPage(withTiendaPage(ajustes));
    setTiendaFeed(withTiendaFeed(ajustes));
    setTiendaMarcas(withTiendaMarcas(ajustes, MiloStore.getMarcas()));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('milo_store_updated', loadData);
    return () => window.removeEventListener('milo_store_updated', loadData);
  }, []);

  useEffect(() => {
    const syncColumns = () => setGridColumns(tiendaFeedColumns(window.innerWidth));
    syncColumns();
    window.addEventListener('resize', syncColumns);
    return () => window.removeEventListener('resize', syncColumns);
  }, []);

  useEffect(() => {
    if (enCaminoLink) setFiltroTipo('en-camino');
  }, [enCaminoLink]);

  useEffect(() => {
    if (!productoParam || !productos.length) return;
    const found = productos.find((item) => String(item.id) === String(productoParam));
    if (!found) return;
    setSelectedProduct(found);
    setSelectedVarianteId(pickVarianteId(found));
  }, [productoParam, productos]);

  const filteredProducts = productos.filter((p) => {
    if (!marcaParam && activePasillo && activePasillo !== 'todos' && !productInPasillo(p, activePasillo)) return false;
    if (filtroTipo === 'disponibles' && p.enCamino) return false;
    if (filtroTipo === 'en-camino' && !p.enCamino) return false;
    if (queryParam) {
      const q = queryParam.toLowerCase();
      const haystack = `${p.nombre} ${p.descripcion} ${p.ingredientes || ''} ${productPasillos(p).join(' ')} ${p.marca || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (marcaParam && String(p.marca || '').toLowerCase() !== marcaParam) return false;
    return true;
  });

  const notifyCart = (producto, added, varianteId) => {
    const variante = findVariante(producto, varianteId);
    const label = variante?.nombre ? `${producto.nombre} · ${variante.nombre}` : producto.nombre;
    setAddedNotice(added ? `${label} añadido a tu bolsa` : `No hay stock de ${label}`);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  const handleAddToCart = (producto, tipo, varianteId) => {
    notifyCart(producto, MiloStore.addToCarrito(producto, tipo, varianteId), varianteId);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
    setSelectedVarianteId('');
    if (!searchParams.get('producto')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('producto');
    setSearchParams(next, { replace: true });
  };

  const selectPasillo = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === 'todos') next.delete('pasillo');
    else next.set('pasillo', id);
    next.delete('marca');
    if (id !== 'en-camino') {
      next.delete('filtro');
      setFiltroTipo('todos');
    }
    setSearchParams(next);
  };

  const setBusqueda = (value) => {
    const next = new URLSearchParams(searchParams);
    if (String(value || '').trim()) next.set('q', value);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  };

  const selectMarca = (marca) => {
    const next = new URLSearchParams(searchParams);
    const value = String(marca.nombre || '').toLowerCase();
    const active = marcaParam === value || marcaParam === marca.id;
    if (active) {
      next.delete('marca');
    } else {
      next.set('marca', value);
      next.delete('pasillo');
    }
    setSearchParams(next);
  };

  const feedGroups = groupTiendaFeed(filteredProducts, tiendaFeed, gridColumns);

  return (
    <div className="flex flex-col gap-8">
      <EditHotspot enabled={canEditCatalog} onEdit={openTiendaFeed} label="Editar piezas de tienda" tone="light" className="-mx-4 -mt-8 lg:-mx-8">
        <TiendaHero feed={tiendaFeed} />
      </EditHotspot>

      <div className="flex flex-col gap-4">
        <EditHotspot enabled={canEditCatalog} onEdit={openTiendaPage} label="Editar cabecera">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-neutral-900 dark:text-white">{tiendaPage.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
              {tiendaPage.description}
              {queryParam ? ` Resultados para “${queryParam}”.` : ''}
              {marcaParam ? ` Filtro de marca: ${marcaParam}.` : ''}
            </p>
          </div>
        </EditHotspot>

        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="relative"
        >
          <label className="sr-only" htmlFor="busqueda-tienda">Buscar producto</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-900 dark:text-white" strokeWidth={1.75} />
          <input
            id="busqueda-tienda"
            type="search"
            value={queryParam}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar producto"
            autoComplete="off"
            className="h-11 w-full border border-neutral-200 bg-white py-0 pl-10 pr-10 text-sm font-normal text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-white [&::-webkit-search-cancel-button]:hidden"
          />
          {queryParam ? (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-neutral-900 dark:text-white"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          ) : null}
        </form>
      </div>

      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-neutral-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg">
          <Check className="w-4 h-4" />
          <span>{addedNotice}</span>
        </div>
      )}

      <EditHotspot enabled={canEditCatalog} onEdit={openPasillos} label="Editar pasillos" className={canEditCatalog ? 'pt-10' : ''}>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 apple-scroll -mx-3 px-3 sm:mx-0 sm:px-0">
          {pasillos.map((pas) => (
            <button
              key={pas.id}
              type="button"
              onClick={() => selectPasillo(pas.id)}
              className={`whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-all ${
                activePasillo === pas.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'border border-neutral-200 text-neutral-600 hover:border-neutral-900 dark:border-neutral-800 dark:text-neutral-400'
              }`}
            >
              {pas.nombre}
            </button>
          ))}
        </div>
      </EditHotspot>

      <EditHotspot enabled={canEditCatalog} onEdit={openTiendaMarcas} label="Editar marcas" className={canEditCatalog ? 'pt-10' : ''}>
        <div className="hide-scrollbar overflow-x-auto -mx-3 px-3 py-2 sm:mx-0 sm:px-0">
          <div className={`flex min-w-full w-max gap-3 sm:gap-5 ${categoryRowClass(tiendaMarcas.align)}`}>
            {tiendaMarcas.circles.map((marca) => {
              const catalog = marcas.find((item) => item.id === marca.id);
              const active = marcaParam === String(marca.label || '').toLowerCase()
                || marcaParam === marca.id
                || (catalog && (marcaParam === catalog.nombre.toLowerCase() || marcaParam === catalog.id));
              return (
                <button
                  key={marca.id}
                  type="button"
                  onClick={() => selectMarca(catalog || { id: marca.id, nombre: marca.label })}
                  className="w-20 shrink-0 text-center focus:outline-none sm:w-24"
                >
                  <span
                    className={`mx-auto block aspect-square w-full rounded-full p-0.5 ${
                      active ? 'ring-2 ring-neutral-900 dark:ring-white' : ''
                    }`}
                  >
                    <ProductVisual
                      seed={marca.seed}
                      src={marca.imagen}
                      posX={marca.posX}
                      posY={marca.posY}
                      zoom={marca.zoom}
                      flipX={marca.flipX}
                      flipY={marca.flipY}
                      rotate={marca.rotate}
                      focalCrop
                      className="aspect-square h-full w-full rounded-full"
                    />
                  </span>
                  <span className={`mt-1.5 block text-[10px] font-medium uppercase leading-tight tracking-[0.08em] sm:text-[11px] ${
                    active ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                  >
                    {marca.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </EditHotspot>

      <div className="flex items-center justify-center gap-2 overflow-x-auto border-y border-neutral-200 py-3 apple-scroll dark:border-neutral-800">
        {[
          { id: 'todos', label: 'Todos' },
          { id: 'disponibles', label: 'Disponibles' },
          { id: 'en-camino', label: 'En camino' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFiltroTipo(tab.id)}
            className={`whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-all ${
              filtroTipo === tab.id
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'border border-neutral-200 text-neutral-600 hover:border-neutral-900 dark:border-neutral-800 dark:text-neutral-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-3 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-900">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <p className="text-base font-medium text-neutral-900 dark:text-white">
            No encontramos productos con el filtro seleccionado
          </p>
          <button
            onClick={() => {
              setFiltroTipo('todos');
              setSearchParams({});
            }}
            className="text-xs font-semibold uppercase tracking-[0.14em] underline"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {feedGroups.map((group, index) => (
            group.kind === 'insert' ? (
              <EditHotspot
                key={group.insert.id}
                enabled={canEditCatalog}
                onEdit={openTiendaFeed}
                label="Editar sugerencia"
              >
                <TiendaFeedInsert
                  insert={group.insert}
                  pasillos={pasillos}
                  products={productos}
                  currentPasillo={activePasillo}
                  onOpen={(prod, varianteId) => {
                    setSelectedProduct(prod);
                    setSelectedVarianteId(pickVarianteId(prod, varianteId));
                  }}
                />
              </EditHotspot>
            ) : (
              <div key={`products-${index}`} className="grid grid-cols-2 items-stretch gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                {group.products.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onAdded={notifyCart}
                    onOpen={(prod, varianteId) => {
                      setSelectedProduct(prod);
                      setSelectedVarianteId(pickVarianteId(prod, varianteId));
                    }}
                  />
                ))}
              </div>
            )
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductDetail
          product={
            productos.find((item) => item.id === selectedProduct.id) || selectedProduct
          }
          pasillos={pasillos}
          canEditCatalog={canEditCatalog}
          openProduct={openProduct}
          varianteId={selectedVarianteId}
          onVariante={setSelectedVarianteId}
          onClose={closeProductDetail}
          onAdd={(product, tipo, varianteId) => {
            handleAddToCart(product, tipo, varianteId);
            closeProductDetail();
          }}
        />
      )}
    </div>
  );
}
