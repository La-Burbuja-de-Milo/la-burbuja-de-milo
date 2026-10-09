import React, { useEffect, useRef, useState } from 'react';
import { Heart, Plus, Share2, ShoppingCart, Star } from 'lucide-react';
import ProductVisual from './ProductVisual';
import EditHotspot from '../admin/EditHotspot';
import { PresentacionSelect } from './PresentacionPicker';
import { useCmsEdit, useVisualEdit } from '../../context/CmsEditContext';
import { findVariante, pickVarianteId, stockEstado } from '../../lib/variantes';
import { visualCropProps } from '../../lib/mediaCrop';
import { formatCOP } from '../../lib/money';
import { productPermalink, productRating, shareChannels, shareProductNative } from '../../lib/productSocial';
import { MiloStore } from '../../services/miloStore';

const overlayBtn =
  'absolute z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.12)] ring-1 ring-black/10 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-950 dark:text-white dark:ring-white/20';

function FastCartIcon({ className = 'h-4 w-4' }) {
  return (
    <span className={`inline-flex items-center ${className}`} aria-hidden>
      <svg
        viewBox="0 0 8 16"
        className="h-[15px] w-[7px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      >
        <path d="M1 4h6" />
        <path d="M0 8h7" />
        <path d="M1 12h5" />
      </svg>
      <ShoppingCart className="h-4 w-4 -ml-0.5" strokeWidth={1.75} />
    </span>
  );
}

function RatingStars({ value }) {
  return (
    <div className="flex min-h-4 items-center gap-0.5" aria-label={`Calificación ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, value - (star - 1)));
        return (
          <span key={star} className="relative h-3.5 w-3.5 shrink-0 text-neutral-400 dark:text-neutral-500">
            <Star className="absolute inset-0 h-3.5 w-3.5 text-neutral-200 dark:text-neutral-700" strokeWidth={1.5} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="h-3.5 w-3.5 fill-current" strokeWidth={1.5} />
            </span>
          </span>
        );
      })}
      <span className="ml-1 text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500">{value.toFixed(1)}</span>
    </div>
  );
}

function ShareButton({ product }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const copyLink = async () => {
    const url = productPermalink(product);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      setOpen(false);
    } catch {
      window.prompt('Copia el enlace del producto', url);
    }
  };

  const onShare = () => {
    setOpen((current) => !current);
  };

  const onMore = async () => {
    setOpen(false);
    await shareProductNative(product);
  };

  return (
    <div ref={rootRef} className={`relative ${open ? 'z-40' : ''}`}>
      <button
        type="button"
        aria-label="Compartir producto"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Compartir"
        onClick={onShare}
        className="flex h-5 w-5 items-center justify-center text-neutral-900 dark:text-white"
      >
        <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
      {open ? (
        <ul
          role="menu"
          aria-label="Compartir"
          className="absolute right-0 top-full z-40 mt-1 min-w-[9.5rem] border border-neutral-200 bg-white py-1 shadow-[0_12px_28px_rgba(23,23,23,0.12)] dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
        >
          {shareChannels(product).map((channel) => (
            <li key={channel.id} role="none">
              <a
                role="menuitem"
                href={channel.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="block px-3 py-1.5 text-[11px] font-normal text-neutral-800 hover:bg-[#f6f6f6] dark:text-neutral-100 dark:hover:bg-neutral-900"
              >
                {channel.label}
              </a>
            </li>
          ))}
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={copyLink}
              className="block w-full px-3 py-1.5 text-left text-[11px] font-normal text-neutral-800 hover:bg-[#f6f6f6] dark:text-neutral-100 dark:hover:bg-neutral-900"
            >
              {copied ? 'Enlace copiado' : 'Copiar enlace'}
            </button>
          </li>
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? (
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={onMore}
                className="block w-full px-3 py-1.5 text-left text-[11px] font-normal text-neutral-800 hover:bg-[#f6f6f6] dark:text-neutral-100 dark:hover:bg-neutral-900"
              >
                Más opciones
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

export default function ProductCard({ product, onAdded, onOpen }) {
  const tipo = product.enCamino ? 'reserva_en_camino' : 'compra';
  const { canEditCatalog } = useVisualEdit();
  const { openProduct } = useCmsEdit();
  const [varianteId, setVarianteId] = useState(() => pickVarianteId(product));
  const [favorito, setFavorito] = useState(() => MiloStore.isFavorito(product.id));
  const rating = productRating(product);

  useEffect(() => {
    setVarianteId(pickVarianteId(product));
  }, [product.id]);

  useEffect(() => {
    const sync = () => setFavorito(MiloStore.isFavorito(product.id));
    sync();
    window.addEventListener('milo_store_updated', sync);
    return () => window.removeEventListener('milo_store_updated', sync);
  }, [product.id]);

  const variante = findVariante(product, varianteId);
  const agotada = !product.enCamino && stockEstado(product, variante) === 'agotado';
  const precio = variante?.precio ?? product.precio;

  const addToCart = (openCart) => {
    const added = MiloStore.addToCarrito(product, tipo, varianteId);
    if (added && openCart) {
      MiloStore.openCarrito();
      return;
    }
    onAdded?.(product, added, varianteId);
  };

  return (
    <article className="group relative z-0 flex h-full flex-col border border-neutral-200 bg-white has-[[aria-expanded=true]]:z-40 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="relative">
        <EditHotspot enabled={canEditCatalog} onEdit={() => openProduct(product)}>
          <button
            type="button"
            onClick={() => onOpen?.(product, varianteId)}
            className="relative block w-full text-left"
          >
            <ProductVisual {...visualCropProps(product)} className="aspect-square w-full" />
            {product.tag && (
              <span className="absolute left-2 top-2 bg-white px-1.5 py-px text-[8px] font-medium uppercase tracking-[0.08em] text-neutral-800 shadow-sm dark:bg-neutral-950 dark:text-white">
                {product.tag}
              </span>
            )}
            {product.enCamino && (
              <span className="absolute bottom-3 left-3 right-10 bg-neutral-900/90 px-2 py-1 text-center text-[10px] font-medium text-white">
                Llegada: {product.fechaLlegada || 'Pronto'}
              </span>
            )}
            {agotada && (
              <span className="absolute bottom-3 left-3 right-10 bg-neutral-900/90 px-2 py-1 text-center text-[10px] font-medium text-white">
                Sin stock
              </span>
            )}
          </button>
        </EditHotspot>

        <button
          type="button"
          aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={favorito}
          title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          onClick={() => setFavorito(MiloStore.toggleFavorito(product.id))}
          className={`${overlayBtn} top-1.5 ${canEditCatalog ? 'right-11' : 'right-1.5'}`}
        >
          <Heart className={`h-3 w-3 ${favorito ? 'fill-current' : ''}`} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          aria-label="Agregar al carrito"
          title="Agregar al carrito"
          disabled={agotada}
          onClick={() => addToCart(false)}
          className={`${overlayBtn} bottom-1.5 right-1.5`}
        >
          <Plus className="h-3 w-3" strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex flex-1 flex-col">
        <button
          type="button"
          onClick={() => onOpen?.(product, varianteId)}
          title={product.nombre}
          className="block truncate bg-neutral-900 px-3 py-1.5 text-left text-[13px] leading-none text-white hover:underline dark:bg-white dark:text-neutral-900"
        >
          {product.nombre}
        </button>
        <p className="min-h-4 px-3 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-900 dark:text-white">
          {product.marca || '\u00a0'}
        </p>
        <div className="flex items-center justify-between gap-2 px-3">
          <RatingStars value={rating} />
          <ShareButton product={product} />
        </div>
        <div className="flex flex-1 flex-col px-3 pb-2">
          <PresentacionSelect product={product} value={varianteId} onChange={setVarianteId} />
          <p className={`mt-1.5 h-5 text-[13px] leading-5 tabular-nums tracking-tight ${agotada ? 'text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>
            {agotada ? 'Agotada' : formatCOP(precio)}
          </p>
          <div className="mt-auto pt-2">
            <button
              type="button"
              aria-label="Ir a caja"
              title="Ir a caja"
              disabled={agotada}
              onClick={() => addToCart(true)}
              className="flex h-9 w-full items-center justify-center gap-2 border border-neutral-900 bg-transparent text-[12px] font-medium tracking-tight text-neutral-900 disabled:opacity-40 dark:border-white dark:text-white"
            >
              Ir a caja
              <FastCartIcon />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
