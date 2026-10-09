import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TIENDA_BANNER_FRAME,
  TIENDA_BANNER_HEIGHT,
  goTiendaHref,
  tiendaFeedPhotoStyle,
  toCapitalCase,
  withTiendaFeed
} from '../../lib/tiendaFeed';
import ProductVisual from './ProductVisual';

function Photo({ src, seed, crop }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={tiendaFeedPhotoStyle({ imagen: src, ...crop })}
      />
    );
  }
  return <ProductVisual seed={seed} variant="hero" className="absolute inset-0 h-full w-full" />;
}

export default function TiendaHero({ feed }) {
  const navigate = useNavigate();
  const slides = withTiendaFeed({ tiendaFeed: feed }).hero.filter((item) => item.active);
  const [index, setIndex] = useState(0);
  const gesture = useRef(null);

  useEffect(() => {
    setIndex((current) => (slides.length ? current % slides.length : 0));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index] || slides[0];

  if (!slides.length) return null;

  return (
    <section
      className="touch-pan-y px-1 pb-2 pt-1 sm:px-2"
      aria-label="Ofertas de la tienda"
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        gesture.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        const start = gesture.current;
        gesture.current = null;
        if (!start || slides.length < 2) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
        setIndex((current) => (dx < 0 ? (current + 1) % slides.length : (current - 1 + slides.length) % slides.length));
      }}
      onPointerCancel={() => { gesture.current = null; }}
    >
      <div className={`relative ${TIENDA_BANNER_HEIGHT} ${TIENDA_BANNER_FRAME}`}>
        <Photo src={slide.imagen} seed={slide.id || slide.title} crop={slide} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pb-4 pt-12">
          {slide.tag ? (
            <p className="text-[11px] font-normal text-white/80">{toCapitalCase(slide.tag)}</p>
          ) : null}
          <h2 className="text-xl font-normal leading-tight text-white sm:text-2xl">{toCapitalCase(slide.title)}</h2>
          {slide.button ? (
            <button
              type="button"
              onClick={() => goTiendaHref(slide.to, navigate)}
              className="mt-1 text-[13px] font-normal text-white underline decoration-white/60 underline-offset-4"
            >
              {toCapitalCase(slide.button)}
            </button>
          ) : null}
        </div>
      </div>
      {slides.length > 1 ? (
        <div className="mt-4 flex justify-center gap-1.5">
          {slides.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Ver ${item.title}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full ${i === index ? 'w-5 bg-neutral-900 dark:bg-white' : 'w-1.5 bg-neutral-300 dark:bg-neutral-600'}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
