import React from 'react';
import ProductVisual from './ProductVisual';
import EditHotspot from '../admin/EditHotspot';
import { PrecioTarjeta } from './PresentacionPicker';
import { useCmsEdit, useVisualEdit } from '../../context/CmsEditContext';
import { hasNamedVariantes } from '../../lib/variantes';

export default function ProductCard({ product, onQuickBuy, onOpen }) {
  const tipo = product.enCamino ? 'reserva_en_camino' : 'compra';
  const { canEditCatalog } = useVisualEdit();
  const { openProduct } = useCmsEdit();
  const soldOut = !product.enCamino && Number(product.stock) <= 0;
  const elegir = hasNamedVariantes(product);

  return (
    <article className="group flex h-full flex-col bg-white dark:bg-neutral-950">
      <EditHotspot enabled={canEditCatalog} onEdit={() => openProduct(product)}>
        <button
          type="button"
          onClick={() => onOpen?.(product)}
          className="relative block w-full text-left"
        >
          <ProductVisual seed={product.id} src={product.imagen} className="aspect-square w-full" />
          {product.tag && (
            <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-white">
              {product.tag}
            </span>
          )}
          {product.enCamino && (
            <span className="absolute bottom-3 left-3 right-3 bg-neutral-900/90 px-2 py-1 text-center text-[10px] font-medium text-white">
              Llegada: {product.fechaLlegada || 'Pronto'}
            </span>
          )}
          {soldOut && (
            <span className="absolute bottom-3 left-3 right-3 bg-neutral-900/90 px-2 py-1 text-center text-[10px] font-medium text-white">
              Sin stock
            </span>
          )}
        </button>
      </EditHotspot>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <button
          type="button"
          onClick={() => onOpen?.(product)}
          className="line-clamp-2 min-h-[2.6rem] text-left text-sm leading-snug text-neutral-800 hover:underline dark:text-neutral-100"
        >
          {product.nombre}
        </button>
        <p className="mt-1 min-h-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
          {product.marca || '\u00a0'}
        </p>
        <PrecioTarjeta
          product={product}
          onPick={elegir ? (varianteId) => onOpen?.(product, varianteId) : undefined}
        />
        <div className="mt-auto pt-4">
          <button
            type="button"
            disabled={soldOut}
            onClick={() => (elegir ? onOpen?.(product) : onQuickBuy?.(product, tipo))}
            className="w-full border border-neutral-900 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-neutral-900"
          >
            {soldOut ? 'Sin stock' : 'Quick buy'}
          </button>
        </div>
      </div>
    </article>
  );
}
