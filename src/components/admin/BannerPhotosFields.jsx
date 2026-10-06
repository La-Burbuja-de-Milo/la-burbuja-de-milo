import React, { useEffect, useRef, useState } from 'react';
import ImageUploader from './ImageUploader';
import ImageFocusPicker from './ImageFocusPicker';
import ProductVisual from '../shop/ProductVisual';
import { BannerPublishPreview } from '../shop/BannerFrame';
import {
  BANNER_ESTILOS,
  BANNER_LAYOUTS,
  BANNER_TRANSICIONES,
  measureBannerPhotoBox,
  moveBannerFoto,
  normalizeBannerFoto,
  slotCountForLayout
} from '../../lib/bannerFrames';
import { isPngSource } from '../../lib/imageSrc';

const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300';

function LayoutThumb({ id, active }) {
  const fill = active ? 'bg-white/80 dark:bg-neutral-900/70' : 'bg-neutral-400/70 dark:bg-neutral-500/80';
  const wrap = 'grid h-8 w-full gap-px overflow-hidden';

  if (id === 'unica') return <div className={`h-8 w-full ${fill}`} />;
  if (id === 'paralela') {
    return (
      <div className={`${wrap} grid-cols-2`}>
        <div className={fill} />
        <div className={fill} />
      </div>
    );
  }
  if (id === 'asimetrica') {
    return (
      <div className={`${wrap} grid-cols-[1.6fr_1fr]`}>
        <div className={fill} />
        <div className={fill} />
      </div>
    );
  }
  if (id === 'vertical') {
    return (
      <div className={`${wrap} grid-rows-2`}>
        <div className={fill} />
        <div className={fill} />
      </div>
    );
  }
  if (id === 'diagonal' || id === 'diagonal-inv') {
    return (
      <div className="relative h-8 w-full overflow-hidden">
        <div className={`absolute inset-0 ${fill}`} style={{ clipPath: id === 'diagonal' ? 'polygon(0 0, 100% 0, 0 100%)' : 'polygon(0 0, 100% 0, 100% 100%)' }} />
        <div className={`absolute inset-0 ${fill} opacity-60`} style={{ clipPath: id === 'diagonal' ? 'polygon(100% 0, 100% 100%, 0 100%)' : 'polygon(0 0, 100% 100%, 0 100%)' }} />
      </div>
    );
  }
  if (id === 'trio') {
    return (
      <div className={`${wrap} grid-cols-2 grid-rows-2`}>
        <div className={`${fill} row-span-2`} />
        <div className={fill} />
        <div className={fill} />
      </div>
    );
  }
  if (id === 'columnas') {
    return (
      <div className={`${wrap} grid-cols-3`}>
        <div className={fill} />
        <div className={fill} />
        <div className={fill} />
      </div>
    );
  }
  if (id === 'mosaico') {
    return (
      <div className={`${wrap} grid-cols-2 grid-rows-2`}>
        <div className={fill} />
        <div className={fill} />
        <div className={fill} />
        <div className={fill} />
      </div>
    );
  }
  if (id === 'escalon') {
    return (
      <div className="relative h-8 w-full">
        <div className={`absolute left-[8%] top-[10%] h-[55%] w-[46%] rotate-[-8deg] ${fill}`} />
        <div className={`absolute right-[10%] top-[18%] h-[50%] w-[42%] rotate-[7deg] ${fill} opacity-80`} />
        <div className={`absolute bottom-[6%] left-[28%] h-[42%] w-[50%] rotate-[-3deg] ${fill} opacity-70`} />
      </div>
    );
  }
  return (
    <div className={`${wrap} grid-cols-3 grid-rows-2`}>
      <div className={fill} />
      <div className={fill} />
      <div className={fill} />
      <div className={`${fill} col-span-2`} />
      <div className={fill} />
    </div>
  );
}

function BannerOrderPreview({ fotos, onReorder, bannerId = 'banner' }) {
  const rowRef = useRef(null);
  const dragRef = useRef(null);
  const fotosRef = useRef(fotos);
  const [draggingIndex, setDraggingIndex] = useState(null);
  fotosRef.current = fotos;

  const indexFromX = (clientX) => {
    const nodes = [...(rowRef.current?.querySelectorAll('[data-foto-index]') || [])];
    if (!nodes.length) return 0;
    let best = 0;
    let bestDist = Infinity;
    nodes.forEach((node, index) => {
      const box = node.getBoundingClientRect();
      const dist = Math.abs(clientX - (box.left + box.width / 2));
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    return best;
  };

  const stopDrag = () => {
    dragRef.current = null;
    setDraggingIndex(null);
  };

  const moveDrag = (clientX) => {
    const drag = dragRef.current;
    if (!drag) return;
    const toIndex = indexFromX(clientX);
    if (toIndex === drag.lastIndex) return;
    drag.lastIndex = toIndex;
    onReorder(moveBannerFoto(fotosRef.current, drag.from, toIndex));
    drag.from = toIndex;
  };

  return (
    <div className="overflow-x-auto border border-neutral-200 bg-[#f4f1ea] p-3 dark:border-neutral-700">
      <div ref={rowRef} className="flex min-w-full w-max gap-3">
        {fotos.map((foto, index) => (
          <button
            key={foto.id || `orden-${index}`}
            type="button"
            data-foto-index={index}
            aria-label={`Mover foto ${index + 1}`}
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              dragRef.current = { from: index, lastIndex: index };
              setDraggingIndex(index);
            }}
            onPointerMove={(event) => moveDrag(event.clientX)}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            className={`w-16 shrink-0 touch-none select-none text-center ${
              draggingIndex === index ? 'cursor-grabbing opacity-70' : 'cursor-grab'
            }`}
          >
            <div className={`aspect-[4/3] overflow-hidden ${isPngSource(foto.src) ? 'bg-white' : 'bg-[#efeae2]'} ${
              draggingIndex === index ? 'ring-2 ring-neutral-900 dark:ring-white' : ''
            }`}
            >
              <ProductVisual
                seed={`banner-${bannerId}-${index}`}
                src={foto.src}
                posX={foto.posX}
                posY={foto.posY}
                zoom={foto.zoom}
                flipX={foto.flipX}
                flipY={foto.flipY}
                rotate={foto.rotate}
                focalCrop
                className="pointer-events-none h-full w-full"
              />
            </div>
            <span className="mt-1 block truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-neutral-600 dark:text-neutral-300">
              Foto {index + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BannerPhotosFields({ form, onChange, bannerId = 'banner' }) {
  const fotos = (Array.isArray(form.imagenes) ? form.imagenes : (form.imagen ? [form.imagen] : [''])).map((item, index) => {
    const foto = normalizeBannerFoto(item);
    return { ...foto, id: item?.id || foto.id || `${bannerId}-foto-${index}` };
  });
  const slots = slotCountForLayout(form.marcoLayout, fotos.length);
  const shown = Array.from({ length: Math.max(slots, 1) }, (_, index) => (
    fotos[index] || { ...normalizeBannerFoto(''), id: `${bannerId}-foto-${index}` }
  ));
  const [playKey, setPlayKey] = useState(0);
  const [frameRatio, setFrameRatio] = useState(() => {
    const box = measureBannerPhotoBox();
    return box.width / Math.max(1, box.height);
  });

  useEffect(() => {
    const read = () => {
      const box = measureBannerPhotoBox();
      setFrameRatio(box.width / Math.max(1, box.height));
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  useEffect(() => {
    setPlayKey((key) => key + 1);
  }, [form.transicion, form.marcoLayout, form.marcoEstilo]);

  const setFotos = (next) => {
    const imagenes = next.map((item, index) => {
      const foto = normalizeBannerFoto(item);
      return { ...foto, id: item?.id || foto.id || `${bannerId}-foto-${index}` };
    });
    onChange({ imagenes, imagen: imagenes.find((item) => item.src)?.src || '' });
  };

  const patchFoto = (index, patch) => {
    const next = [...shown];
    next[index] = normalizeBannerFoto({ ...next[index], ...patch });
    setFotos(next);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className={labelClass}>Portaretrato</p>
        <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          Elige cómo se componen las fotos en el hero: una, dos, diagonal, mosaico o a medida.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BANNER_LAYOUTS.map((layout) => {
          const selected = form.marcoLayout === layout.id;
          return (
            <button
              key={layout.id}
              type="button"
              onClick={() => onChange({ marcoLayout: layout.id })}
              className={`border px-2 py-2 text-left ${selected ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900' : 'border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300'}`}
            >
              <LayoutThumb id={layout.id} active={selected} />
              <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.12em]">{layout.label}</span>
              <span className={`mt-0.5 block text-[10px] leading-snug ${selected ? 'text-white/70 dark:text-neutral-500' : 'text-neutral-400'}`}>{layout.hint}</span>
            </button>
          );
        })}
      </div>
      <div>
        <p className={labelClass}>Marco</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {BANNER_ESTILOS.map((estilo) => (
            <button
              key={estilo.id}
              type="button"
              onClick={() => onChange({ marcoEstilo: estilo.id })}
              className={`border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${form.marcoEstilo === estilo.id ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900' : 'border-neutral-300 text-neutral-600 dark:border-neutral-600 dark:text-neutral-300'}`}
            >
              {estilo.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className={labelClass}>Transición</p>
        <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          Cómo aparecen las fotos al publicar y al cambiar de banner.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {BANNER_TRANSICIONES.map((item) => {
            const selected = (form.transicion || 'fundido') === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange({ transicion: item.id })}
                className={`border px-3 py-1.5 text-left ${selected ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900' : 'border-neutral-300 text-neutral-600 dark:border-neutral-600 dark:text-neutral-300'}`}
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.12em]">{item.label}</span>
                <span className={`mt-0.5 block text-[10px] leading-snug ${selected ? 'text-white/70 dark:text-neutral-500' : 'text-neutral-400'}`}>{item.hint}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className={labelClass}>Vista previa en Inicio</p>
            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              El portaretrato se dibuja al tamaño real del banner y se reduce para caber aquí. Así se publica.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPlayKey((key) => key + 1)}
            className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline"
          >
            Ver transición
          </button>
        </div>
        <div className="mt-2 overflow-hidden border border-neutral-200 bg-[#f4f1ea] dark:border-neutral-700">
          <BannerPublishPreview key={playKey} banner={{ ...form, imagenes: shown }} />
        </div>
      </div>
      {shown.length > 1 ? (
        <div>
          <p className={labelClass}>Orden de las fotos</p>
          <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            Arrastra las miniaturas con la mano para cambiar el orden en el portaretrato.
          </p>
          <div className="mt-2">
            <BannerOrderPreview bannerId={bannerId} fotos={shown} onReorder={setFotos} />
          </div>
        </div>
      ) : null}
      <div className={`grid gap-4 ${shown.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
        {shown.map((foto, index) => (
          <div key={`${bannerId}-${form.marcoLayout}-${foto.id || index}`} className="space-y-3 border border-neutral-200 p-3 dark:border-neutral-700">
            <p className={labelClass}>{shown.length > 1 ? `Foto ${index + 1}` : 'Foto del banner'}</p>
            <ImageFocusPicker
              src={foto.src}
              seed={`${bannerId}-${index}`}
              posX={foto.posX}
              posY={foto.posY}
              zoom={foto.zoom}
              flipX={foto.flipX}
              flipY={foto.flipY}
              rotate={foto.rotate}
              shape="rect"
              frameRatio={frameRatio}
              onChange={(patch) => patchFoto(index, patch)}
              grabHint="Agarra la foto y muévela: lo que quede dentro del recuadro es lo que se publica"
            />
            <ImageUploader
              compact
              label={shown.length > 1 ? `Archivo foto ${index + 1}` : 'Archivo del banner'}
              value={foto.src}
              onChange={(src) => patchFoto(index, { src })}
            />
          </div>
        ))}
      </div>
      {form.marcoLayout === 'personalizado' && (
        <div className="flex flex-wrap gap-3">
          {shown.length < 6 && (
            <button
              type="button"
              onClick={() => setFotos([...shown, normalizeBannerFoto('')])}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline"
            >
              Añadir otra foto
            </button>
          )}
          {shown.length > 2 && (
            <button
              type="button"
              onClick={() => setFotos(shown.slice(0, -1))}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 underline-offset-4 hover:underline"
            >
              Quitar última
            </button>
          )}
        </div>
      )}
    </div>
  );
}
