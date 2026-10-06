import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Edit, Package, Plus, SlidersHorizontal } from 'lucide-react';
import { MiloStore } from '../../../services/miloStore';
import { esStockGenerico, etiquetaVariante, filasInventario, findVariante } from '../../../lib/variantes';
import { useCmsEdit } from '../../../context/CmsEditContext';

const inputClass = 'w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white';
const primaryBtn = 'inline-flex items-center justify-center gap-1.5 bg-neutral-900 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900';
const panel = 'border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-950';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300';

const MOTIVOS = {
  entrada: ['Compra a proveedor', 'Devolución de cliente', 'Inventario inicial', 'Traslado recibido', 'Otro'],
  salida: ['Uso en cabina', 'Merma o vencido', 'Muestra', 'Traslado enviado', 'Otro'],
  ajuste: ['Conteo físico', 'Corrección', 'Otro']
};

const TIPO_LABELS = {
  entrada: 'Entrada',
  salida: 'Salida',
  venta: 'Venta',
  ajuste: 'Ajuste'
};

const EMPTY_FORM = {
  productoId: '',
  varianteId: '',
  tipo: 'entrada',
  cantidad: '',
  motivo: MOTIVOS.entrada[0],
  nota: ''
};

function formatFecha(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '';
  return date.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

function estadoBadge(estado) {
  if (estado === 'agotado') return 'Agotado';
  if (estado === 'bajo') return 'Stock bajo';
  return 'En rango';
}

export default function InventarioTab() {
  const { openProduct } = useCmsEdit();
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const load = () => {
    setProductos(MiloStore.getProductos());
    setMovimientos(MiloStore.getMovimientos());
  };

  useEffect(() => {
    load();
    window.addEventListener('milo_store_updated', load);
    return () => window.removeEventListener('milo_store_updated', load);
  }, []);

  const cabina = useMemo(() => productos.filter((product) => !product.enCamino && !esStockGenerico(product)), [productos]);
  const pendientes = useMemo(
    () => productos.filter((product) => !product.enCamino && esStockGenerico(product)),
    [productos]
  );
  const filas = useMemo(() => filasInventario(cabina), [cabina]);
  const alertas = useMemo(
    () => filas.filter((row) => ['agotado', 'bajo'].includes(row.estado)),
    [filas]
  );
  const selected = cabina.find((product) => product.id === form.productoId);
  const selectedVariante = selected ? findVariante(selected, form.varianteId) : null;
  const kardex = movimientos.filter((movement) => {
    if (filtroProducto && movement.productoId !== filtroProducto) return false;
    if (filtroTipo && movement.tipo !== filtroTipo) return false;
    return true;
  });

  const openForm = (productoId = '', tipo = 'entrada', varianteId = '') => {
    const product = cabina.find((item) => item.id === productoId);
    const variante = product ? findVariante(product, varianteId) : null;
    const motivos = MOTIVOS[tipo] || MOTIVOS.entrada;
    setForm({
      ...EMPTY_FORM,
      productoId,
      varianteId: variante?.id || product?.variantes?.[0]?.id || '',
      tipo,
      motivo: motivos[0],
      cantidad: tipo === 'ajuste' && variante ? String(variante.stock ?? '') : ''
    });
    setErrorMessage('');
    setFormOpen(true);
  };

  const handleTipo = (tipo) => {
    const motivos = MOTIVOS[tipo] || MOTIVOS.entrada;
    setForm((current) => ({
      ...current,
      tipo,
      motivo: motivos[0],
      cantidad: tipo === 'ajuste' && selectedVariante ? String(selectedVariante.stock) : current.cantidad
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = MiloStore.registrarMovimiento({
      productoId: form.productoId,
      varianteId: form.varianteId,
      tipo: form.tipo,
      cantidad: form.cantidad,
      motivo: form.motivo,
      nota: form.nota,
      origen: 'manual'
    });
    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }
    setFormOpen(false);
    setForm(EMPTY_FORM);
    setErrorMessage('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium">Inventario de cabina</h3>
          <p className="text-sm text-neutral-500">
            Entradas, salidas, ajustes y el kardex por presentación. Las preventas siguen con cupos, no con stock. Los productos genéricos se confirman al guardar su ficha.
          </p>
        </div>
        <button type="button" onClick={() => openForm()} className={primaryBtn}>
          <Plus className="h-4 w-4" /> Registrar movimiento
        </button>
      </div>

      {pendientes.length > 0 && (
        <div className={`${panel} p-5`}>
          <div className="mb-4 flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-3">
            <Package className="h-4 w-4 text-neutral-500" />
            <h4 className="text-sm font-medium">Stock genérico pendiente</h4>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pendientes.map((product) => (
              <div key={product.id} className="flex items-center justify-between border border-neutral-200 dark:border-neutral-700 p-3">
                <div>
                  <p className="text-sm font-medium">{product.nombre}</p>
                  <p className="text-xs text-neutral-500">{product.stock} unidades · aún no entra al kardex</p>
                </div>
                <button
                  type="button"
                  onClick={() => openProduct(product)}
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline"
                >
                  Confirmar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {alertas.length > 0 && (
        <div className={`${panel} p-5`}>
          <div className="mb-4 flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-3">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <h4 className="text-sm font-medium">Alertas de stock mínimo</h4>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {alertas.map((row) => (
                <div key={row.key} className="flex items-center justify-between border border-neutral-200 dark:border-neutral-700 p-3">
                  <div>
                    <p className="text-sm font-medium">{row.producto.nombre}</p>
                    <p className="text-xs text-neutral-500">
                      {etiquetaVariante(row.variante) || 'Presentación única'} · {row.variante.stock} en cabina · mínimo {row.variante.stockMinimo || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${row.estado === 'agotado' ? 'text-red-700' : 'text-amber-700'}`}>
                      {estadoBadge(row.estado)}
                    </span>
                    <button type="button" onClick={() => openForm(row.producto.id, 'entrada', row.variante.id)} className="text-[11px] font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline">
                      Entrada
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className={`${panel} overflow-hidden`}>
        <div className="overflow-x-auto apple-scroll">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-[#f6f6f6] uppercase tracking-[0.12em] text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                    <th className="p-3.5">Producto</th>
                <th className="p-3.5">Presentación</th>
                <th className="p-3.5">Precio</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Mínimo</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Movimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filas.map((row) => {
                const { producto, variante, estado } = row;
                return (
                  <tr key={row.key}>
                    <td className="p-3.5">
                      <p className="font-medium text-neutral-900 dark:text-white">{producto.nombre}</p>
                      <p className="text-[11px] text-neutral-400">{producto.marca || producto.tag}</p>
                    </td>
                    <td className="p-3.5">
                      <input
                        defaultValue={variante.nombre || ''}
                        key={`${row.key}-nombre-${variante.nombre || ''}`}
                        placeholder="Única"
                        onBlur={(event) => {
                          const nombre = event.target.value;
                          if (nombre === (variante.nombre || '')) return;
                          MiloStore.updateVarianteCatalogo(producto.id, variante.id, { nombre });
                        }}
                        className={`${inputClass} min-w-[8rem]`}
                      />
                    </td>
                    <td className="p-3.5">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={variante.precio ?? ''}
                        key={`${row.key}-precio-${variante.precio ?? ''}`}
                        onBlur={(event) => {
                          const precio = Number(event.target.value) || 0;
                          if (precio === (Number(variante.precio) || 0)) return;
                          MiloStore.updateVarianteCatalogo(producto.id, variante.id, { precio });
                        }}
                        className={`${inputClass} w-28`}
                      />
                    </td>
                    <td className="p-3.5 font-medium">{variante.stock}</td>
                    <td className="p-3.5">{variante.stockMinimo ?? 3}</td>
                    <td className={`p-3.5 uppercase tracking-[0.12em] ${estado === 'agotado' ? 'text-red-700' : estado === 'bajo' ? 'text-amber-700' : 'text-neutral-500'}`}>
                      {estadoBadge(estado)}
                    </td>
                    <td className="p-3.5 text-right">
                      <button type="button" onClick={() => openProduct(producto)} className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white" title="Editar ficha">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => openForm(producto.id, 'entrada', variante.id)} className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white" title="Entrada">
                        <ArrowDownToLine className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => openForm(producto.id, 'salida', variante.id)} className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white" title="Salida">
                        <ArrowUpFromLine className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => openForm(producto.id, 'ajuste', variante.id)} className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white" title="Ajuste">
                        <SlidersHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h4 className="text-base font-medium">Kardex</h4>
            <p className="text-sm text-neutral-500">Historial de cada unidad que entra o sale de cabina.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:w-[28rem]">
            <select value={filtroProducto} onChange={(event) => setFiltroProducto(event.target.value)} className={inputClass}>
              <option value="">Todos los productos</option>
              {cabina.map((product) => (
                <option key={product.id} value={product.id}>{product.nombre}</option>
              ))}
            </select>
            <select value={filtroTipo} onChange={(event) => setFiltroTipo(event.target.value)} className={inputClass}>
              <option value="">Todos los tipos</option>
              {Object.entries(TIPO_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className={`${panel} overflow-hidden`}>
          <div className="overflow-x-auto apple-scroll">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-[#f6f6f6] uppercase tracking-[0.12em] text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
                <tr>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Producto</th>
                  <th className="p-3.5">Presentación</th>
                  <th className="p-3.5">Tipo</th>
                  <th className="p-3.5">Cantidad</th>
                  <th className="p-3.5">Antes / después</th>
                  <th className="p-3.5">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {kardex.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-neutral-400">Aún no hay movimientos con ese filtro.</td>
                  </tr>
                )}
                {kardex.map((movement) => (
                  <tr key={movement.id}>
                    <td className="p-3.5 text-neutral-500">{formatFecha(movement.fecha)}</td>
                    <td className="p-3.5 font-medium">{movement.productoNombre}</td>
                    <td className="p-3.5 text-neutral-500">{movement.varianteNombre || 'Única'}</td>
                    <td className="p-3.5 uppercase tracking-[0.12em] text-neutral-500">{TIPO_LABELS[movement.tipo] || movement.tipo}</td>
                    <td className="p-3.5">
                      {movement.delta > 0 ? '+' : ''}{movement.delta}
                    </td>
                    <td className="p-3.5 text-neutral-500">{movement.stockAntes} → {movement.stockDespues}</td>
                    <td className="p-3.5">
                      <p>{movement.motivo}</p>
                      {movement.nota ? <p className="text-[11px] text-neutral-400">{movement.nota}</p> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6 text-neutral-900 apple-scroll dark:bg-neutral-950 dark:text-white sm:p-8">
            <button type="button" onClick={() => setFormOpen(false)} className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white" aria-label="Cerrar">
              ×
            </button>
            <div className="mb-5 flex items-center gap-2 pr-8">
              <Package className="h-5 w-5" />
              <h3 className="text-xl font-medium tracking-tight">Registrar movimiento</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Producto</label>
                <select
                  required
                  value={form.productoId}
                  onChange={(event) => {
                    const product = cabina.find((item) => item.id === event.target.value);
                    setForm({
                      ...form,
                      productoId: event.target.value,
                      varianteId: product?.variantes?.[0]?.id || ''
                    });
                  }}
                  className={inputClass}
                >
                  <option value="">Selecciona un producto</option>
                  {cabina.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {selected && (selected.variantes || []).length > 0 && (
                <div>
                  <label className={labelClass}>Presentación</label>
                  <select
                    required
                    value={form.varianteId}
                    onChange={(event) => setForm({ ...form, varianteId: event.target.value })}
                    className={inputClass}
                  >
                    {(selected.variantes || []).map((variante) => (
                      <option key={variante.id} value={variante.id}>
                        {etiquetaVariante(variante) || 'Única'} · {variante.stock} en cabina
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className={labelClass}>Tipo</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {['entrada', 'salida', 'ajuste'].map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => handleTipo(tipo)}
                      className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${form.tipo === tipo ? 'bg-neutral-900 text-white' : 'border border-neutral-300 text-neutral-500'}`}
                    >
                      {TIPO_LABELS[tipo]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{form.tipo === 'ajuste' ? 'Nuevo stock' : 'Cantidad'}</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.cantidad}
                    onChange={(event) => setForm({ ...form, cantidad: event.target.value })}
                    className={inputClass}
                  />
                  {selectedVariante && (
                    <p className="mt-1 text-[11px] text-neutral-400">Stock actual: {selectedVariante.stock}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Motivo</label>
                  <select value={form.motivo} onChange={(event) => setForm({ ...form, motivo: event.target.value })} className={inputClass}>
                    {(MOTIVOS[form.tipo] || MOTIVOS.entrada).map((motivo) => (
                      <option key={motivo} value={motivo}>{motivo}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Nota</label>
                <input value={form.nota} onChange={(event) => setForm({ ...form, nota: event.target.value })} className={inputClass} placeholder="Opcional" />
              </div>
              {errorMessage && <p className="text-sm text-red-700">{errorMessage}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Cancelar
                </button>
                <button type="submit" className={primaryBtn}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
