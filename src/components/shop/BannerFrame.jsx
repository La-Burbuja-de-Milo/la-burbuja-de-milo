import React, { useEffect, useRef, useState } from 'react';
import ProductVisual from './ProductVisual';
import {
  BANNER_STAGE_CLASS,
  bannerFotos,
  bannerMatClass,
  findBannerEstilo,
  findBannerLayout,
  findBannerTransicion,
  measureBannerPhotoBox
} from '../../lib/bannerFrames';

function padded(estilo) {
  return estilo === 'galeria' || estilo === 'polaroid' || estilo === 'redondeado' || estilo === 'dorado' || estilo === 'sombra';
}

function Photo({ foto, src, seed }) {
  const crop = typeof foto === 'object' && foto ? foto : { src };
  const image = crop.src || src || '';
  return (
    <ProductVisual
      seed={seed}
      src={image}
      posX={crop.posX}
      posY={crop.posY}
      zoom={crop.zoom}
      flipX={crop.flipX}
      flipY={crop.flipY}
      rotate={crop.rotate}
      focalCrop={Boolean(image)}
      variant="hero"
      className="absolute inset-0 h-full w-full"
    />
  );
}

function FrameCell({ foto, src, seed, estilo, className = '', rotate = 0, motion = 'instantaneo', delay = 0, style }) {
  const polaroid = estilo === 'polaroid';
  const sombra = estilo === 'sombra';
  const filo = estilo === 'filo';
  const dorado = estilo === 'dorado';
  const round = estilo === 'redondeado';
  const positioned = /\babsolute\b/.test(className);
  const motionClass = motion && motion !== 'instantaneo' ? `banner-motion-${motion}` : '';

  return (
    <div
      className={`min-h-0 min-w-0 ${positioned ? '' : 'relative h-full w-full'} ${className}`}
      style={{
        ...(rotate ? { transform: `rotate(${rotate}deg)` } : null),
        ...style
      }}
    >
      <div
        className={[
          'absolute inset-0 overflow-hidden',
          polaroid ? 'bg-white p-[4%] pb-[14%] shadow-md' : '',
          sombra && !polaroid ? 'bg-white p-[3%] shadow-lg' : '',
          round ? 'rounded-2xl' : '',
          filo ? 'shadow-[inset_0_0_0_3px_#171717] dark:shadow-[inset_0_0_0_3px_#fff]' : '',
          dorado ? 'shadow-[inset_0_0_0_3px_#c6a15b]' : '',
          motionClass
        ].filter(Boolean).join(' ')}
        style={delay ? { animationDelay: `${delay}s` } : undefined}
      >
        <div className={`relative h-full w-full overflow-hidden ${round && !polaroid ? 'rounded-[14px]' : ''}`}>
          <Photo foto={foto} src={src} seed={seed} />
        </div>
      </div>
    </div>
  );
}

function GridFrame({ className, estilo, gridClass, matClass, children }) {
  return (
    <div
      className={`grid h-full w-full min-h-0 ${gridClass} ${padded(estilo) ? 'gap-2 p-2' : 'gap-0 p-0'} ${matClass} ${className}`}
    >
      {children}
    </div>
  );
}

function motionClassName(motion) {
  return motion && motion !== 'instantaneo' ? `banner-motion-${motion}` : '';
}

function DiagonalFrame({ className, seed, photo, inverted, motion = 'instantaneo', matClass }) {
  const top = inverted
    ? 'polygon(0 0, 100% 0, 100% 100%)'
    : 'polygon(0 0, 100% 0, 0 100%)';
  const bottom = inverted
    ? 'polygon(0 0, 100% 100%, 0 100%)'
    : 'polygon(100% 0, 100% 100%, 0 100%)';
  const seam = inverted
    ? 'polygon(99.4% 100%, 100% 100%, 0.6% 0, 0 0)'
    : 'polygon(99.4% 0, 100% 0, 0.6% 100%, 0 100%)';
  const motionClass = motionClassName(motion);
  const cascade = motion === 'cascada';

  return (
    <div className={`relative h-full w-full overflow-hidden ${matClass} ${className}`}>
      <div
        className={`absolute inset-0 overflow-hidden ${motionClass}`}
        style={{ clipPath: top, animationDelay: cascade ? '0s' : undefined }}
      >
        <Photo foto={photo(0)} seed={`${seed}-a`} />
      </div>
      <div
        className={`absolute inset-0 overflow-hidden ${motionClass}`}
        style={{ clipPath: bottom, animationDelay: cascade ? '0.16s' : undefined }}
      >
        <Photo foto={photo(1)} seed={`${seed}-b`} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-white" style={{ clipPath: seam }} />
    </div>
  );
}

export function BannerStage({ banner, className = '' }) {
  return (
    <div className={`${BANNER_STAGE_CLASS} ${bannerMatClass(banner)} ${className}`}>
      <BannerFrame banner={banner} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

export function BannerPublishPreview({ banner, className = '' }) {
  const hostRef = useRef(null);
  const [box, setBox] = useState(() => measureBannerPhotoBox());
  const [hostW, setHostW] = useState(640);

  useEffect(() => {
    const read = () => {
      setBox(measureBannerPhotoBox());
      if (hostRef.current) setHostW(hostRef.current.clientWidth);
    };
    read();
    window.addEventListener('resize', read);
    const observer = hostRef.current ? new ResizeObserver(read) : null;
    if (hostRef.current) observer?.observe(hostRef.current);
    return () => {
      window.removeEventListener('resize', read);
      observer?.disconnect();
    };
  }, []);

  const scale = box.width && hostW ? Math.min(1, hostW / box.width) : 1;
  const previewH = Math.max(1, Math.round(box.height * scale));

  return (
    <div className={className}>
      <div
        ref={hostRef}
        className={`relative overflow-hidden ${bannerMatClass(banner)}`}
        style={{ height: previewH }}
      >
        <div
          className="absolute left-0 top-0 overflow-hidden"
          style={{
            width: box.width,
            height: box.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left'
          }}
        >
          <BannerFrame banner={banner} className="h-full w-full" />
        </div>
      </div>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {box.desktop ? 'Escritorio' : 'Móvil'} · {Math.round(box.width)} × {Math.round(box.height)} px · mismo recuadro que Inicio
      </p>
    </div>
  );
}

export default function BannerFrame({ banner, className = '' }) {
  const fotos = bannerFotos(banner);
  const layout = findBannerLayout(banner?.marcoLayout);
  const estilo = findBannerEstilo(banner?.marcoEstilo).id;
  const motion = findBannerTransicion(banner?.transicion).id;
  const seed = banner?.id || 'hero';
  const matClass = bannerMatClass(fotos);
  const photo = (index) => fotos[index] || null;
  const cascade = motion === 'cascada';
  const cell = (index, extra = '') => (
    <FrameCell
      key={`${seed}-${index}`}
      foto={photo(index)}
      seed={`${seed}-${index}`}
      estilo={estilo}
      motion={motion}
      delay={cascade ? index * 0.16 : 0}
      className={extra}
    />
  );

  if (layout.id === 'diagonal') {
    return <DiagonalFrame className={className} seed={seed} photo={photo} inverted={false} motion={motion} matClass={matClass} />;
  }

  if (layout.id === 'diagonal-inv') {
    return <DiagonalFrame className={className} seed={seed} photo={photo} inverted motion={motion} matClass={matClass} />;
  }

  if (layout.id === 'escalon') {
    const frame = estilo === 'lleno' ? 'polaroid' : estilo;
    return (
      <div className={`relative h-full w-full overflow-hidden ${matClass} ${className}`}>
        <FrameCell foto={photo(0)} seed={`${seed}-a`} estilo={frame} motion={motion} delay={cascade ? 0 : 0} rotate={-7} className="absolute" style={{ left: '6%', top: '10%', width: '48%', height: '58%', zIndex: 1 }} />
        <FrameCell foto={photo(1)} seed={`${seed}-b`} estilo={frame} motion={motion} delay={cascade ? 0.16 : 0} rotate={5} className="absolute" style={{ right: '5%', top: '12%', width: '47%', height: '54%', zIndex: 2 }} />
        <FrameCell foto={photo(2)} seed={`${seed}-c`} estilo={frame} motion={motion} delay={cascade ? 0.32 : 0} rotate={-2} className="absolute" style={{ left: '18%', bottom: '8%', width: '58%', height: '44%', zIndex: 3 }} />
      </div>
    );
  }

  if (layout.id === 'paralela') {
    return (
      <GridFrame className={className} estilo={estilo} matClass={matClass} gridClass="grid-cols-2 grid-rows-[minmax(0,1fr)]">
        {cell(0)}
        {cell(1)}
      </GridFrame>
    );
  }

  if (layout.id === 'asimetrica') {
    return (
      <GridFrame className={className} estilo={estilo} matClass={matClass} gridClass="grid-cols-[1.7fr_1fr] grid-rows-[minmax(0,1fr)]">
        {cell(0)}
        {cell(1)}
      </GridFrame>
    );
  }

  if (layout.id === 'vertical') {
    return (
      <GridFrame className={className} estilo={estilo} matClass={matClass} gridClass="grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
        {cell(0)}
        {cell(1)}
      </GridFrame>
    );
  }

  if (layout.id === 'trio') {
    return (
      <GridFrame className={className} estilo={estilo} matClass={matClass} gridClass="grid-cols-2 grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
        {cell(0, 'row-span-2')}
        {cell(1)}
        {cell(2)}
      </GridFrame>
    );
  }

  if (layout.id === 'columnas') {
    return (
      <GridFrame className={className} estilo={estilo} matClass={matClass} gridClass="grid-cols-3 grid-rows-[minmax(0,1fr)]">
        {cell(0)}
        {cell(1)}
        {cell(2)}
      </GridFrame>
    );
  }

  if (layout.id === 'mosaico' || (layout.id === 'personalizado' && fotos.length >= 4)) {
    const count = layout.id === 'personalizado' ? Math.min(6, Math.max(4, fotos.length)) : 4;
    const cols = count > 4 ? 'grid-cols-3' : 'grid-cols-2';
    const rows = count > 4 ? 'grid-rows-[minmax(0,1fr)_minmax(0,1fr)]' : 'grid-rows-[minmax(0,1fr)_minmax(0,1fr)]';
    return (
      <GridFrame className={className} estilo={estilo} matClass={matClass} gridClass={`${cols} ${rows}`}>
        {Array.from({ length: count }, (_, index) => cell(index))}
      </GridFrame>
    );
  }

  if (layout.id === 'personalizado') {
    const count = Math.max(2, fotos.length || 2);
    return (
      <GridFrame className={className} estilo={estilo} matClass={matClass} gridClass="grid-cols-2 grid-rows-[repeat(auto-fit,minmax(0,1fr))]">
        {Array.from({ length: count }, (_, index) => cell(index, count === 3 && index === 0 ? 'col-span-2' : ''))}
      </GridFrame>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${matClass} ${padded(estilo) ? 'p-2' : ''} ${className}`}>
      <FrameCell foto={photo(0)} seed={seed} estilo={estilo} motion={motion} />
    </div>
  );
}
