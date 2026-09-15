import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MiloStore } from '../../services/miloStore';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import AuroraButton from '../../components/ui/AuroraButton';
import { Sparkles, Clock, ShoppingBag, Check, Info, X, ShieldCheck } from 'lucide-react';

export default function TiendaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filtroParam = searchParams.get('filtro');

  const [pasillos, setPasillos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [activePasillo, setActivePasillo] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState(filtroParam === 'en-camino' ? 'en-camino' : 'todos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedNotice, setAddedNotice] = useState(null);

  const loadData = () => {
    setPasillos(MiloStore.getPasillos());
    setProductos(MiloStore.getProductos());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('milo_store_updated', loadData);
    return () => window.removeEventListener('milo_store_updated', loadData);
  }, []);

  useEffect(() => {
    if (filtroParam === 'en-camino') {
      setFiltroTipo('en-camino');
    }
  }, [filtroParam]);

  // Filtrado de productos
  const filteredProducts = productos.filter((p) => {
    // Filtro por pasillo
    if (activePasillo !== 'todos' && p.pasillo !== activePasillo) {
      return false;
    }
    // Filtro por disponibilidad / en camino
    if (filtroTipo === 'disponibles' && p.enCamino) return false;
    if (filtroTipo === 'en-camino' && !p.enCamino) return false;
    return true;
  });

  const countEnCamino = productos.filter(p => p.enCamino).length;

  const handleAddToCart = (producto, tipo) => {
    MiloStore.addToCarrito(producto, tipo);
    setAddedNotice(`${producto.nombre} añadido a tu bolsa ✨`);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Tienda Ética & Pasillos" 
        description="Fórmulas botánicas puras, cosmecéutica de alta penetración y productos exclusivos en camino."
        glow="default"
      />

      {/* Alerta de confirmación rápida */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom duration-300">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* NAVEGACIÓN POR PASILLOS (TABS HORIZONTALES) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 apple-scroll -mx-3 px-3 sm:mx-0 sm:px-0">
        {pasillos.map((pas) => (
          <button
            key={pas.id}
            onClick={() => setActivePasillo(pas.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activePasillo === pas.id
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md shadow-gray-500/10'
                : 'bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/5'
            }`}
          >
            {pas.nombre}
          </button>
        ))}
      </div>

      {/* FILTRO DE DISPONIBILIDAD Y EN CAMINO */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-gray-100/70 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltroTipo('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtroTipo === 'todos'
                ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Todos ({productos.length})
          </button>
          
          <button
            onClick={() => setFiltroTipo('disponibles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtroTipo === 'disponibles'
                ? 'bg-white dark:bg-white/20 text-emerald-600 dark:text-emerald-300 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Disponibles en Cabina
          </button>
          
          <button
            onClick={() => setFiltroTipo('en-camino')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtroTipo === 'en-camino'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>En Camino / Apartar ({countEnCamino})</span>
          </button>
        </div>

        <span className="text-xs text-gray-500 dark:text-gray-400">
          Mostrando {filteredProducts.length} productos
        </span>
      </div>

      {/* GRID DE PRODUCTOS */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <p className="text-base font-medium text-gray-900 dark:text-white">No encontramos productos en este pasillo con el filtro seleccionado</p>
          <button
            onClick={() => { setActivePasillo('todos'); setFiltroTipo('todos'); }}
            className="text-xs text-pink-600 dark:text-pink-400 font-semibold hover:underline"
          >
            Ver todos los productos disponibles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <GlassCard 
              key={prod.id} 
              className={`flex flex-col justify-between group transition-all duration-300 p-5 ${
                prod.enCamino 
                  ? 'border-purple-300/60 dark:border-purple-500/30 shadow-purple-500/5' 
                  : 'hover:shadow-md'
              }`}
            >
              {/* Encabezado de la tarjeta */}
              <div>
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200/50 dark:from-gray-900/60 dark:to-gray-800/40 rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 to-purple-500/10 group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Icono temático */}
                  <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-600 group-hover:scale-110 group-hover:text-pink-400 transition-all duration-300" />

                  {/* Etiquetas / Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {prod.enCamino ? (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white rounded-md shadow-sm">
                        En Camino
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-black/60 backdrop-blur-md text-gray-900 dark:text-white rounded-md">
                        {prod.tag || 'Disponible'}
                      </span>
                    )}
                  </div>

                  {prod.enCamino && (
                    <span className="absolute bottom-3 left-3 right-3 px-2 py-1 text-[10px] text-center font-medium bg-purple-900/80 backdrop-blur-md text-white rounded-md">
                      Llegada estimada: {prod.fechaLlegada || 'Próximamente'}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                      {prod.pasillo}
                    </span>
                    <button
                      onClick={() => setSelectedProduct(prod)}
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                      title="Ver detalles de la fórmula"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 
                    onClick={() => setSelectedProduct(prod)}
                    className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors cursor-pointer"
                  >
                    {prod.nombre}
                  </h3>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {prod.descripcion}
                  </p>
                </div>
              </div>

              {/* Pie de tarjeta con precios y botones de acción */}
              <div className="mt-5 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                    {prod.enCamino ? 'Preventa' : 'Precio'}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ${prod.precio.toFixed(2)}
                  </span>
                </div>

                {prod.enCamino ? (
                  <button
                    onClick={() => handleAddToCart(prod, 'reserva_en_camino')}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20 hover:opacity-90 active:scale-95 transition-all"
                  >
                    Apartar
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddToCart(prod, 'compra')}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 active:scale-95 transition-all"
                  >
                    Comprar
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* MODAL DE DETALLE DE PRODUCTO (REGLA 5 AURORA: MODAL CENTRADO) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white/95 dark:bg-[#151518]/95 backdrop-blur-3xl rounded-[2rem] border border-white/50 dark:border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden apple-scroll max-h-[90vh]">
            {/* Glow orbe ambiental */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {selectedProduct.enCamino ? (
                  <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full">
                    Producto en Camino (Preventa)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 rounded-full">
                    Disponible Inmediato
                  </span>
                )}
                <span className="text-xs text-gray-400 uppercase font-medium">
                  {selectedProduct.pasillo}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {selectedProduct.nombre}
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {selectedProduct.descripcion}
              </p>

              {/* Ingredientes Activos */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-pink-500" />
                  Activos de la Fórmula
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {selectedProduct.ingredientes || 'Fórmulas testeadas dermatológicamente sin alérgenos.'}
                </p>
              </div>

              {/* Modo de Uso */}
              {selectedProduct.modoUso && (
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Modo de Uso Recomendado:
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {selectedProduct.modoUso}
                  </p>
                </div>
              )}

              {/* Información de entrega / preventa */}
              {selectedProduct.enCamino && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-600 dark:text-purple-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    Arribo estimado a cabina: <strong>{selectedProduct.fechaLlegada}</strong>. Cupos apartados: <strong>{selectedProduct.reservasActuales || 0}/{selectedProduct.cuposReserva || 20}</strong>.
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Total:</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${selectedProduct.precio.toFixed(2)} USD
                  </span>
                </div>

                <AuroraButton
                  onClick={() => {
                    handleAddToCart(selectedProduct, selectedProduct.enCamino ? 'reserva_en_camino' : 'compra');
                    setSelectedProduct(null);
                  }}
                  className="px-6 py-2.5 text-sm font-semibold"
                >
                  {selectedProduct.enCamino ? 'Apartar Producto en Preventa' : 'Añadir a la Bolsa'}
                </AuroraButton>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
