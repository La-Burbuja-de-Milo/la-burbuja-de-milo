import React, { useState, useEffect } from 'react';
import { MiloStore } from '../../services/miloStore';
import { X, ShoppingBag, Trash2, ArrowRight, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import AuroraButton from '../ui/AuroraButton';

export default function CartDrawer({ isOpen, onClose }) {
  const [items, setItems] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const syncCart = () => {
    setItems(MiloStore.getCarrito());
  };

  useEffect(() => {
    syncCart();
    window.addEventListener('milo_store_updated', syncCart);
    return () => window.removeEventListener('milo_store_updated', syncCart);
  }, []);

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const itemsEnCamino = items.filter(i => i.tipo === 'reserva_en_camino');
  const itemsInmediatos = items.filter(i => i.tipo !== 'reserva_en_camino');

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    // Registrar en clientes si no existe
    const clientes = MiloStore.getClientes();
    const existing = clientes.find(c => c.telefono === customerPhone);
    if (existing) {
      existing.pedidosCount = (existing.pedidosCount || 0) + 1;
      if (itemsEnCamino.length > 0) {
        existing.reservasActivas = (existing.reservasActivas || 0) + itemsEnCamino.length;
      }
      MiloStore.saveClientes([...clientes]);
    } else {
      MiloStore.saveClientes([
        {
          id: `cl_${Date.now()}`,
          nombre: customerName,
          telefono: customerPhone,
          email: '',
          tipoPiel: 'Evaluación pendiente',
          fechaRegistro: new Date().toISOString().split('T')[0],
          citasCount: 0,
          pedidosCount: 1,
          reservasActivas: itemsEnCamino.length,
          notasCRM: `Pedido realizado. Apartados: ${itemsEnCamino.map(i => i.nombre).join(', ') || 'Ninguno'}`
        },
        ...clientes
      ]);
    }

    MiloStore.clearCarrito();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-[#121215] h-full shadow-2xl border-l border-gray-200 dark:border-white/10 flex flex-col apple-scroll animate-in slide-in-from-right duration-300">
        
        {/* Cabecera */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Bolsa & Reservas</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {items.length} {items.length === 1 ? 'producto' : 'productos'} seleccionados
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 apple-scroll">
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">¡Pedido y Reserva Confirmada!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Hemos registrado tu apartado. Nos comunicaremos vía WhatsApp para coordinar tu entrega y despachos prioritarios.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-base font-medium text-gray-900 dark:text-white">Tu bolsa está vacía</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                Descubre nuestras fórmulas disponibles o reserva los productos botánicos que vienen en camino.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Alerta de productos en camino si hay */}
              {itemsEnCamino.length > 0 && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs flex items-start gap-2">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Tienes <strong>{itemsEnCamino.length} producto(s) en camino</strong>. Serán reservados con prioridad a tu nombre y enviados una vez arriben a cabina.
                  </span>
                </div>
              )}

              {/* Lista de productos */}
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {items.map((item) => (
                  <div key={`${item.id}-${item.tipo}`} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {item.tipo === 'reserva_en_camino' ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded">
                            Reserva (En camino)
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 rounded">
                            Disponible
                          </span>
                        )}
                        {item.fechaLlegada && (
                          <span className="text-[10px] text-gray-400">Arribo: {item.fechaLlegada}</span>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.nombre}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ${item.precio.toFixed(2)} x {item.cantidad}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </span>
                      <button
                        onClick={() => MiloStore.removeFromCarrito(item.id, item.tipo)}
                        className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulario rápido de confirmación */}
              <form onSubmit={handleCheckout} className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-3">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Datos de contacto para entrega/reserva
                </p>
                <input
                  type="text"
                  required
                  placeholder="Tu Nombre completo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <input
                  type="tel"
                  required
                  placeholder="Teléfono / WhatsApp (ej. 3001234567)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total a Pagar / Apartar:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">${total.toFixed(2)} USD</span>
                </div>

                <AuroraButton type="submit" className="w-full py-2.5 text-sm font-semibold mt-2">
                  Confirmar Pedido & Reservas
                </AuroraButton>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
