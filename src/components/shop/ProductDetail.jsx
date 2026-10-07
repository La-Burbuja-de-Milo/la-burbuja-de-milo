import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import ProductVisual from './ProductVisual';
import PresentacionPicker from './PresentacionPicker';
import { formatCOP } from '../../lib/money';
import { pasilloLabels } from '../../lib/pasillos';
import { findVariante, stockEstado } from '../../lib/variantes';
import { visualCropProps } from '../../lib/mediaCrop';

export function pickVarianteId(product, varianteId = '') {
  return varianteId
    || (product.variantes || []).find((item) => product.enCamino || Number(item.stock) > 0)?.id
    || product.variantes?.[0]?.id
    || '';
}

export default function ProductDetail({
  product,
  pasillos = [],
  canEditCatalog,
  openProduct,
  varianteId,
  onVariante,
  onClose,
  onAdd
}) {
  const variante = findVariante(product, varianteId) || product.variantes?.[0];
  const activeId = variante?.id || varianteId;
  const agotada = !product.enCamino && stockEstado(product, variante) === 'agotado';
  const tipo = product.enCamino ? 'reserva_en_camino' : 'compra';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto bg-white p-6 text-neutral-900 shadow-2xl apple-scroll dark:bg-neutral-950 dark:text-white sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          aria-label="Cerrar detalle"
        >
          <X className="w-4 h-4" />
        </button>

        <ProductVisual
          {...visualCropProps(product)}
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
