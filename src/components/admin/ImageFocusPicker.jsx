import React, { useEffect, useRef, useState } from 'react';
import ProductVisual from '../shop/ProductVisual';
import {
  CIRCLE_ZOOM_MAX,
  CIRCLE_ZOOM_MIN,
  imageCoverSize,
  mapPointerDelta,
  normalizeRotate,
  panCropPosition
} from '../../lib/categoryCircles';
import { isPngSource } from '../../lib/imageSrc';

function coverFor(ratio, zoom, viewportEl) {
  const box = viewportEl?.getBoundingClientRect();
  const containerRatio = box && box.height > 1 ? box.width / box.height : 1;
  return imageCoverSize(ratio, zoom, containerRatio);
}

export default function ImageFocusPicker({
  src = '',
  seed = 'foto',
  posX = 50,
  posY = 50,
  zoom = 1,
  flipX = false,
  flipY = false,
  rotate = 0,
  onChange,
  shape = 'circle',
  frameRatio = 4 / 3,
  emptyHint = 'Sube una foto para recortar',
  grabHint = 'Agarra la foto y muévela: lo que quede dentro del recuadro es lo que se publica'
}) {
  const viewportRef = useRef(null);
  const dragRef = useRef(null);
  const [ratio, setRatio] = useState(null);
  const crop = { posX, posY, zoom, flipX, flipY, rotate };
  const circle = shape === 'circle';

  useEffect(() => {
    if (!src) {
      setRatio(null);
      return undefined;
    }
    const img = new Image();
    img.onload = () => {
      const next = img.naturalWidth / Math.max(1, img.naturalHeight);
      setRatio(Number.isFinite(next) && next > 0 ? next : 1);
    };
    img.src = src;
    return undefined;
  }, [src]);

  const movePhoto = (clientX, clientY) => {
    const start = dragRef.current;
    const box = viewportRef.current?.getBoundingClientRect();
    if (!start || !box) return;
    const mapped = mapPointerDelta(
      ((clientX - start.x) / box.width) * 100,
      ((clientY - start.y) / box.height) * 100,
      start
    );
    onChange(panCropPosition({
      posX: start.posX,
      posY: start.posY,
      dxPct: mapped.dx,
      dyPct: mapped.dy,
      widthPct: start.widthPct,
      heightPct: start.heightPct
    }));
  };

  const safeFrameRatio = Number.isFinite(frameRatio) && frameRatio > 0 ? frameRatio : 4 / 3;
  const frameStyle = { aspectRatio: String(safeFrameRatio) };

  return (
    <div className="space-y-2">
      <div
        className={`relative overflow-hidden bg-[#d8d2c8] dark:bg-neutral-800 ${
          circle
            ? 'mx-auto flex h-52 w-52 items-center justify-center'
            : 'flex w-full items-center justify-center px-8 py-10'
        } ${src ? 'cursor-grab touch-none select-none active:cursor-grabbing' : ''}`}
        style={src ? { touchAction: 'none' } : undefined}
        aria-label={src ? 'Arrastrar foto para recortar' : undefined}
        role={src ? 'img' : undefined}
        onPointerDown={(event) => {
          if (!src) return;
          event.preventDefault();
          event.stopPropagation();
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            /* capture can fail on synthetic events */
          }
          const cover = coverFor(ratio, zoom, viewportRef.current);
          dragRef.current = {
            x: event.clientX,
            y: event.clientY,
            posX,
            posY,
            widthPct: cover.widthPct,
            heightPct: cover.heightPct,
            flipX,
            flipY,
            rotate
          };
        }}
        onPointerMove={(event) => {
          if (!dragRef.current) return;
          event.preventDefault();
          movePhoto(event.clientX, event.clientY);
        }}
        onPointerUp={() => { dragRef.current = null; }}
        onPointerCancel={() => { dragRef.current = null; }}
      >
        <div
          ref={viewportRef}
          className={circle
            ? 'relative aspect-square w-36 overflow-visible rounded-full'
            : 'relative w-full overflow-visible'}
          style={circle ? undefined : frameStyle}
        >
          <ProductVisual
            seed={seed}
            src={src}
            posX={posX}
            posY={posY}
            zoom={zoom}
            flipX={flipX}
            flipY={flipY}
            rotate={rotate}
            focalCrop
            clip={false}
            className={`pointer-events-none absolute inset-0 h-full w-full ${isPngSource(src) ? 'bg-white' : 'bg-transparent'}`}
          />
        </div>
        <div
          className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center ${
            circle ? '' : 'px-8 py-10'
          }`}
          aria-hidden="true"
        >
          <div
            className={circle ? 'aspect-square w-36 rounded-full' : 'w-full'}
            style={{
              ...(circle ? null : frameStyle),
              boxShadow: '0 0 0 2px rgba(255,255,255,0.92), 0 0 0 999px rgba(28, 25, 22, 0.48)'
            }}
          />
        </div>
      </div>
      <p className="text-center text-[10px] text-neutral-400">
        {src ? grabHint : emptyHint}
      </p>
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Acercar</span>
        <input
          type="range"
          min={CIRCLE_ZOOM_MIN}
          max={CIRCLE_ZOOM_MAX}
          step="0.05"
          value={zoom}
          onChange={(event) => onChange({ zoom: Number(event.target.value) })}
          className="w-full"
        />
      </label>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => onChange({ flipX: !flipX })}
          className={`border px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
            flipX
              ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
              : 'border-neutral-300 text-neutral-600 dark:border-neutral-600 dark:text-neutral-300'
          }`}
        >
          Espejo
        </button>
        <button
          type="button"
          onClick={() => onChange({ flipY: !flipY })}
          className={`border px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
            flipY
              ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
              : 'border-neutral-300 text-neutral-600 dark:border-neutral-600 dark:text-neutral-300'
          }`}
        >
          Invertir
        </button>
        <button
          type="button"
          onClick={() => onChange({ rotate: normalizeRotate(crop.rotate + 90) })}
          className="border border-neutral-300 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600 dark:border-neutral-600 dark:text-neutral-300"
        >
          Girar{rotate ? ` ${rotate}°` : ''}
        </button>
        <button
          type="button"
          onClick={() => onChange({ posX: 50, posY: 50, zoom: 1, flipX: false, flipY: false, rotate: 0 })}
          className="border border-neutral-300 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600 dark:border-neutral-600 dark:text-neutral-300"
        >
          Centrar
        </button>
      </div>
    </div>
  );
}
