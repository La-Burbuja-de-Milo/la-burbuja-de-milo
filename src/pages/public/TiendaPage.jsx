import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MiloStore } from '../../services/miloStore';
import ProductCard from '../../components/shop/ProductCard';
import ProductVisual from '../../components/shop/ProductVisual';
import { Clock, ShoppingBag, Check, X, ShieldCheck } from 'lucide-react';
import { useCmsEdit, useVisualEdit } from '../../context/CmsEditContext';
import { formatCOP } from '../../lib/money';
import PresentacionPicker from '../../components/shop/PresentacionPicker';
import { findVariante, stockEstado } from '../../lib/variantes';
import { pasilloLabels, productInPasillo, productPasillos } from '../../lib/pasillos';

export default function TiendaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { canEditCatalog } = useVisualEdit();
  const { openProduct } = useCmsEdit();
  const filtroParam = searchParams.get('filtro');
  const pasilloParam = searchParams.get('pasillo');
  const queryParam = searchParams.get('q') || '';
  const marcaParam = (searchParams.get('marca') || '').toLowerCase();

  const [pasillos, setPasillos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const activePasillo = marcaParam ? '' : (pasilloParam || 'todos');
  const [filtroTipo, setFiltroTipo] = useState(filtroParam === 'en-camino' ? 'en-camino' : 'todos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVarianteId, setSelectedVarianteId] = useState('');
  const [addedNotice, setAddedNotice] = useState(null);

  const loadData = () => {
    setPasillos(MiloStore.getPasillos());
    setProductos(MiloStore.getProductos());
    setMarcas(MiloStore.getMarcas());
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

  const countEnCamino = productos.filter((p) => p.enCamino).length;

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
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-neutral-900 dark:text-white">Tienda</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
          Salud estética para rostro, cuerpo y bienestar. Marcas como fuXion, Riman y fórmulas de cabina.
          {queryParam ? ` Resultados para “${queryParam}”.` : ''}
          {marcaParam ? ` Filtro de marca: ${marcaParam}.` : ''}
        </p>
      </div>

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

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-neutral-200 py-3 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltroTipo('todos')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all ${
              filtroTipo === 'todos'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Todos ({productos.length})
          </button>

          <button
            onClick={() => setFiltroTipo('disponibles')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all ${
              filtroTipo === 'disponibles'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Disponibles
          </button>

          <button
            onClick={() => setFiltroTipo('en-camino')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all ${
              filtroTipo === 'en-camino'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>En camino ({countEnCamino})</span>
          </button>
        </div>

        <span className="text-xs text-neutral-500">
          Mostrando {filteredProducts.length} productos
        </span>
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
                const first = varianteId
                  || (prod.variantes || []).find((item) => prod.enCamino || Number(item.stock) > 0)?.id
                  || prod.variantes?.[0]?.id
                  || '';
                setSelectedProduct(prod);
                setSelectedVarianteId(first);
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

function ProductDetail({ product, canEditCatalog, openProduct, varianteId, onVariante, onClose, onAdd }) {
  const variante = findVariante(product, varianteId) || product.variantes?.[0];
  const activeId = variante?.id || varianteId;
  const agotada = !product.enCamino && stockEstado(product, variante) === 'agotado';
  const tipo = product.enCamino ? 'reserva_en_camino' : 'compra';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto bg-white p-6 text-neutral-900 shadow-2xl apple-scroll dark:bg-neutral-950 dark:text-white sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          aria-label="Cerrar detalle"
        >
          <X className="w-4 h-4" />
        </button>

        <ProductVisual
          seed={product.id}
          src={product.imagen}
          variant="hero"
          fit="contain"
          className="mb-5 aspect-[5/4] w-full"
        />
        {canEditCatalog && (
          <button
            type="button"
            onClick={() => openProduct(product)}
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline"
          >
            Editar producto
          </button>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
              {product.enCamino ? 'Preventa' : 'Disponible'}
            </span>
            <span className="text-xs uppercase tracking-wider text-neutral-400">
              {[product.marca, ...pasilloLabels(product, pasillos)].filter(Boolean).join(' · ')}
            </span>
          </div>

          <h2 className="text-2xl font-medium text-neutral-900 dark:text-white">
            {product.nombre}
          </h2>

          <PresentacionPicker product={product} value={activeId} onChange={onVariante} />

          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {product.descripcion}
          </p>

          <div className="space-y-1 border border-neutral-200 p-4 dark:border-neutral-800">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 dark:text-neutral-300">
              <ShieldCheck className="w-4 h-4" />
              Activos de la fórmula
            </span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {product.ingredientes || 'Fórmulas de cabina y bienestar seleccionadas por el equipo Milo.'}
            </p>
          </div>

          {product.modoUso && (
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 dark:text-neutral-300">
                Modo de uso
              </span>
              <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {product.modoUso}
              </p>
            </div>
          )}

          {product.enCamino && (
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Arribo estimado: <strong>{product.fechaLlegada}</strong>. Cupos: {product.reservasActuales || 0}/{product.cuposReserva || 20}.
            </p>
          )}

          <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <span className="text-2xl font-medium text-neutral-900 dark:text-white">
              {formatCOP(variante?.precio ?? product.precio)}
            </span>
            <button
              type="button"
              disabled={agotada}
              onClick={() => onAdd(product, tipo, activeId)}
              className="bg-neutral-900 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
            >
              {product.enCamino ? 'Apartar' : agotada ? 'Sin stock' : 'Quick buy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
