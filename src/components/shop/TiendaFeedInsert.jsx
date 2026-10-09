import React, { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TIENDA_BANNER_FRAME,
  TIENDA_BANNER_HEIGHT,
  goTiendaHref,
  resolveInsertSuggestions,
  suggestShapeClass,
  tiendaFeedPhotoStyle,
  toCapitalCase
} from '../../lib/tiendaFeed';
import { visualCropProps } from '../../lib/mediaCrop';
import ProductVisual from './ProductVisual';

function SuggestionVisual({ item }) {
  const shape = suggestShapeClass(item.shape);
  const frame = shape.frame || 'aspect-square w-[3.6rem] sm:w-16';
  const product = item.product;
  const src = item.imagen || product?.imagen || '';
  return (
    <span className={`relative block overflow-hidden bg-[#efeae2] ${frame} ${shape.className}`}>
      {src || product ? (
        <ProductVisual
          {...visualCropProps(product || item, { src, seed: item.seed || item.id, focalCrop: Boolean(src) })}
          className="h-full w-full"
        />
      ) : (
        <ProductVisual seed={item.seed || item.id || item.label} className="h-full w-full" />
      )}
    </span>
  );
}

function PeekBanner({ insert, navigate }) {
  return (
    <button
      type="button"
      onClick={() => goTiendaHref(insert.to, navigate)}
      className={`relative block w-full text-left ${TIENDA_BANNER_HEIGHT} ${TIENDA_BANNER_FRAME}`}
    >
      {insert.imagen ? (
        <img
          src={insert.imagen}
          alt=""
          className="absolute inset-0 h-full w-full"
          style={tiendaFeedPhotoStyle(insert)}
        />
      ) : (
        <ProductVisual seed={insert.id || insert.title} variant="hero" className="absolute inset-0 h-full w-full" />
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-10">
        <span className="block text-lg font-normal leading-tight text-white">
          {toCapitalCase(insert.title || 'Mira esto')}
        </span>
      </span>
    </button>
  );
}

export default function TiendaFeedInsert({
  insert,
  pasillos = [],
  products = [],
  currentPasillo = '',
  excludeIds = [],
  onOpen
}) {
  const navigate = useNavigate();
  const seedRef = useRef(`${insert?.id || 'insert'}-${Math.random().toString(36).slice(2)}`);
  const suggestions = useMemo(
    () => resolveInsertSuggestions(insert, {
      products,
      pasillos,
      currentPasillo,
      excludeIds,
      seed: seedRef.current
    }),
    [insert, products, pasillos, currentPasillo, excludeIds]
  );

  if (!insert) return null;

  if (insert.type === 'peek') {
    return <PeekBanner insert={insert} navigate={navigate} />;
  }

  if (!suggestions.length) return null;

  return (
    <div className="flex items-center gap-3 py-1">
      {insert.title ? (
        <p className="hidden w-[4.5rem] shrink-0 text-[11px] font-normal leading-tight text-neutral-400 sm:block">
          {toCapitalCase(insert.title)}
        </p>
      ) : null}
      <div className="hide-scrollbar flex min-w-0 flex-1 items-end gap-3 overflow-x-auto py-1">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.kind === 'product' && item.product) {
                onOpen?.(item.product);
                return;
              }
              goTiendaHref(item.to, navigate);
            }}
            className="w-[4.1rem] shrink-0 text-center sm:w-[4.4rem]"
          >
            <SuggestionVisual item={item} />
            <span className="mt-1 block truncate text-[11px] font-normal text-neutral-500">
              {toCapitalCase(item.label)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
