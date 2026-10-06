import React from 'react';
import { isPngSource } from '../../lib/imageSrc';

function compressImage(file, maxSize = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    const png = file.type === 'image/png' || /\.png$/i.test(file.name || '');
    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(png ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', quality));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la imagen'));
    };
    image.src = objectUrl;
  });
}

export default function ImageUploader({ label = 'Fotografía', value, onChange, compact = false, aspect = '' }) {
  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = () => onChange(String(reader.result || ''));
      reader.readAsDataURL(file);
    }
  };

  const previewBox = aspect
    ? `relative ${aspect} w-full`
    : compact
      ? 'relative h-28 w-full'
      : 'relative h-40 w-full';

  return (
    <div className="space-y-2">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300">{label}</span>
      <div className={`overflow-hidden border border-neutral-200 dark:border-neutral-700 ${isPngSource(value) ? 'bg-white' : 'bg-[#f6f6f6] dark:bg-neutral-900'} ${previewBox}`}>
        {value ? (
          <img src={value} alt="" className="absolute inset-0 block h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-400">
            Sin foto
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="cursor-pointer border border-neutral-900 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] dark:border-white">
          Subir foto
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
        </label>
        <input
          type="url"
          placeholder="O pega una URL https://"
          value={value && value.startsWith('http') ? value : ''}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1 border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            Quitar
          </button>
        ) : null}
      </div>
    </div>
  );
}
