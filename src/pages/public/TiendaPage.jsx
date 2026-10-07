import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MiloStore } from '../../services/miloStore';
import ProductCard from '../../components/shop/ProductCard';
import ProductDetail, { pickVarianteId } from '../../components/shop/ProductDetail';
import { ShoppingBag, Check } from 'lucide-react';
import { useCmsEdit, useVisualEdit } from '../../context/CmsEditContext';
import EditHotspot from '../../components/admin/EditHotspot';
import { findVariante } from '../../lib/variantes';
import { productInPasillo, productPasillos } from '../../lib/pasillos';
import { withTiendaPage } from '../../lib/tiendaPage';

export default function TiendaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { canEditCatalog } = useVisualEdit();
  const { openProduct, openTiendaPage } = useCmsEdit();
  const filtroParam = searchParams.get('filtro');
  const pasilloParam = searchParams.get('pasillo');
  const queryParam = searchParams.get('q') || '';
  const marcaParam = (searchParams.get('marca') || '').toLowerCase();

  const [pasillos, setPasillos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [tiendaPage, setTiendaPage] = useState(() => withTiendaPage(MiloStore.getAjustes()));
  const activePasillo = marcaParam ? '' : (pasilloParam || 'todos');
  const [filtroTipo, setFiltroTipo] = useState(filtroParam === 'en-camino' ? 'en-camino' : 'todos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVarianteId, setSelectedVarianteId] = useState('');
  const [addedNotice, setAddedNotice] = useState(null);

  const loadData = () => {
    setPasillos(MiloStore.getPasillos());
    setProductos(MiloStore.getProductos());
    setMarcas(MiloStore.getMarcas());
    setTiendaPage(withTiendaPage(MiloStore.getAjustes()));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('milo_store_updated', loadData);
    return () => window.removeEventListener('milo_store_updated', loadData);
  }, []);

  useEffect(() => {
    if (filtroParam === 'en-camino') setFiltroTipo('en-camino');
  }, [filtroParam]);

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

  const handleAddToCart = (producto, tipo, varianteId) => {
    const added = MiloStore.addToCarrito(producto, tipo, varianteId);
    const variante = findVariante(producto, varianteId);
    const label = variante?.nombre ? `${producto.nombre} · ${variante.nombre}` : producto.nombre;
    if (!added) {
      setAddedNotice(`No hay stock de ${label}`);
    } else {
      setAddedNotice(`${label} añadido a tu bolsa`);
    }
    setTimeout(() => setAddedNotice(null), 2500);
  };

  const selectPasillo = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === 'todos') next.delete('pasillo');
    else next.set('pasillo', id);
    next.delete('marca');
    setSearchParams(next);
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

  return (
    <div className="flex flex-col gap-8">
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

      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-neutral-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg">
          <Check className="w-4 h-4" />
          <span>{addedNotice}</span>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-2 apple-scroll -mx-3 px-3 sm:mx-0 sm:px-0">
        {pasillos.map((pas) => (
          <button
            key={pas.id}
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

      <div className="flex items-center gap-2 overflow-x-auto pb-1 apple-scroll -mx-3 px-3 sm:mx-0 sm:px-0">
        {marcas.map((marca) => {
          const active = marcaParam === marca.nombre.toLowerCase() || marcaParam === marca.id;
          return (
            <button
              key={marca.id}
              type="button"
              onClick={() => selectMarca(marca)}
              className={`whitespace-nowrap px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                active
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {marca.nombre}
            </button>
          );
        })}
      </div>

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
        <div className="grid grid-cols-2 items-stretch gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickBuy={handleAddToCart}
              onOpen={(prod, varianteId) => {
                setSelectedProduct(prod);
                setSelectedVarianteId(pickVarianteId(prod, varianteId));
              }}
            />
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
          onClose={() => {
            setSelectedProduct(null);
            setSelectedVarianteId('');
          }}
          onAdd={(product, tipo, varianteId) => {
            handleAddToCart(product, tipo, varianteId);
            setSelectedProduct(null);
            setSelectedVarianteId('');
          }}
        />
      )}
    </div>
  );
}
