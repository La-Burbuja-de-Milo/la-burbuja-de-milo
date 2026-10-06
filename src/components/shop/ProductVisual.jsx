import React, { useEffect, useRef, useState } from 'react';
import { categoryCircleImageStyle, circleImageTransform } from '../../lib/categoryCircles';
import { isPngSource } from '../../lib/imageSrc';

const PALETTES = [
  { bg: '#f3f0ea', bottle: '#6ec4c6', cap: '#cfd4d8', accent: '#1f6f73' },
  { bg: '#f6f1ea', bottle: '#111111', cap: '#c6a15b', accent: '#d9c4a3' },
  { bg: '#eef2ef', bottle: '#ffffff', cap: '#8a6a3d', accent: '#c5d4c8' },
  { bg: '#f7eee8', bottle: '#e7cfc0', cap: '#5c4033', accent: '#f3ddd0' },
  { bg: '#eef1f6', bottle: '#dce7f2', cap: '#111111', accent: '#9bb4c9' },
  { bg: '#f4efe6', bottle: '#b7c7b1', cap: '#d8c39a', accent: '#6e7f68' },
  { bg: '#f8f4f0', bottle: '#f2d6de', cap: '#2c2c2c', accent: '#e8b7c4' },
  { bg: '#f1eee8', bottle: '#d9d2c5', cap: '#8c7b61', accent: '#eee8dc' },
];

function hashSeed(seed) {
  return String(seed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function PumpBottle({ x, color, cap }) {
  return (
    <g transform={`translate(${x} 28)`}>
      <rect x="22" y="0" width="8" height="14" rx="1" fill={cap} />
      <rect x="16" y="12" width="20" height="6" rx="1" fill={cap} />
      <path d="M10 22h32l-4 86H14z" fill={color} />
      <path d="M14 22h24v18H14z" fill={cap} opacity="0.35" />
    </g>
  );
}

function JarBottle({ x, color, cap }) {
  return (
    <g transform={`translate(${x} 58)`}>
      <rect x="8" y="0" width="56" height="10" rx="2" fill={cap} />
      <rect x="4" y="8" width="64" height="72" rx="6" fill={color} />
      <rect x="4" y="8" width="64" height="16" fill={cap} opacity="0.25" />
    </g>
  );
}

function DropperBottle({ x, color, cap }) {
  return (
    <g transform={`translate(${x} 18)`}>
      <ellipse cx="26" cy="10" rx="8" ry="10" fill={cap} />
      <rect x="16" y="16" width="20" height="8" rx="1" fill={cap} />
      <path d="M12 26h28c2 0 6 6 6 14v70c0 8-6 14-14 14H20c-8 0-14-6-14-14V40c0-8 4-14 6-14z" fill={color} />
    </g>
  );
}

export default function ProductVisual({
  seed = 'p1',
  variant = 'card',
  className = '',
  src = '',
  fit = 'cover',
  posX = 50,
  posY = 50,
  zoom = 1,
  flipX = false,
  flipY = false,
  rotate = 0,
  focalCrop = false,
  clip = true,
  mat = 'auto'
}) {
  const [measured, setMeasured] = useState({ src, ratio: null });
  const boxRef = useRef(null);
  const [boxRatio, setBoxRatio] = useState(1);
  if (measured.src !== src) {
    setMeasured({ src, ratio: null });
  }
  const ratio = measured.src === src ? measured.ratio : null;
  const png = isPngSource(src);
  const whiteMat = mat === 'white' || png;
  const photoBg = whiteMat ? 'bg-white' : 'bg-[#efeae2]';
  const photoStyle = whiteMat ? { backgroundColor: '#ffffff' } : undefined;
  const needsTransform = Boolean(flipX || flipY || rotate);

  useEffect(() => {
    if (!focalCrop) return undefined;
    const el = boxRef.current;
    if (!el) return undefined;
    const read = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width > 1 && height > 1) setBoxRatio(width / height);
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [src, focalCrop]);

  if (src && focalCrop) {
    return (
      <div ref={boxRef} className={`relative ${photoBg} ${clip ? 'overflow-hidden' : 'overflow-visible'} ${className}`} style={photoStyle}>
        <div
          className="absolute inset-0"
          style={needsTransform
            ? {
                transform: circleImageTransform({ flipX, flipY, rotate }),
                transformOrigin: 'center center'
              }
            : undefined}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            onLoad={(event) => {
              const next = event.target.naturalWidth / Math.max(1, event.target.naturalHeight);
              setMeasured({
                src,
                ratio: Number.isFinite(next) && next > 0 ? next : 1
              });
            }}
            className="absolute block max-w-none select-none object-cover"
            style={categoryCircleImageStyle({ posX, posY, zoom }, ratio, boxRatio)}
          />
        </div>
      </div>
    );
  }

  if (src) {
    const contained = fit === 'contain';
    return (
      <div className={`relative overflow-hidden ${photoBg} ${className}`} style={photoStyle}>
        <img
          src={src}
          alt=""
          className={`absolute inset-0 block h-full w-full ${contained ? 'object-contain' : 'object-cover'}`}
        />
      </div>
    );
  }

  const hash = hashSeed(seed);
  const palette = PALETTES[hash % PALETTES.length];
  const shape = hash % 3;
  const isHero = variant === 'hero';

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: palette.bg }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)',
          backgroundSize: isHero ? '32px 32px' : '22px 22px',
        }}
      />
      <svg viewBox="0 0 200 180" className="relative h-full w-full" preserveAspectRatio="xMidYMax meet">
        {isHero ? (
          <>
            <DropperBottle x={18} color={palette.bottle} cap={palette.cap} />
            <PumpBottle x={72} color={palette.accent} cap={palette.cap} />
            <JarBottle x={124} color={palette.bottle} cap={palette.cap} />
          </>
        ) : shape === 0 ? (
          <PumpBottle x={74} color={palette.bottle} cap={palette.cap} />
        ) : shape === 1 ? (
          <JarBottle x={66} color={palette.bottle} cap={palette.cap} />
        ) : (
          <DropperBottle x={74} color={palette.bottle} cap={palette.cap} />
        )}
      </svg>
    </div>
  );
}
