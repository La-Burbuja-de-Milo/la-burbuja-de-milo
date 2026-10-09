import React, { useEffect, useId, useRef } from 'react';
import { ChevronLeft, Pencil, ShieldCheck, X } from 'lucide-react';
import ProductVisual from './ProductVisual';
import PresentacionPicker from './PresentacionPicker';
import { formatCOP } from '../../lib/money';
import { pasilloLabels } from '../../lib/pasillos';
import { findVariante, pickVarianteId, stockEstado } from '../../lib/variantes';
import { visualCropProps } from '../../lib/mediaCrop';

export { pickVarianteId };

const HISTORY_KEY = 'miloProductDetail';
let consumeHistoryTimer = 0;

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
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  const closingRef = useRef(false);
  const allowBackdropCloseRef = useRef(false);
  onCloseRef.current = onClose;

  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    onCloseRef.current?.();
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.clearTimeout(consumeHistoryTimer);
    if (!window.history.state?.[HISTORY_KEY]) {
      const previousState = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
      window.history.pushState({ ...previousState, [HISTORY_KEY]: true }, '');
    }

    const onPopState = () => {
      closingRef.current = true;
      onCloseRef.current?.();
    };
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      requestClose();
    };

    window.addEventListener('popstate', onPopState);
    document.addEventListener('keydown', onKey);
    const backdropTimer = window.setTimeout(() => {
      allowBackdropCloseRef.current = true;
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(backdropTimer);
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('keydown', onKey);
      consumeHistoryTimer = window.setTimeout(() => {
        if (window.history.state?.[HISTORY_KEY]) window.history.back();
      }, 0);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onClick={(event) => {
        if (!allowBackdropCloseRef.current) return;
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto bg-white p-6 text-neutral-900 shadow-2xl apple-scroll dark:bg-neutral-950 dark:text-white sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={requestClose}
          className="absolute left-3 top-4 z-10 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white sm:hidden"
          aria-label="Volver"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={requestClose}
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
            aria-label="Editar producto"
            title="Editar producto"
            className="mb-4 inline-flex h-8 w-8 items-center justify-center bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
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

          <h2 id={titleId} className="text-2xl font-medium text-neutral-900 dark:text-white">
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
