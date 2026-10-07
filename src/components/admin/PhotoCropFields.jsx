import React from 'react';
import ImageUploader from './ImageUploader';
import ImageFocusPicker from './ImageFocusPicker';
import { normalizeMediaCrop } from '../../lib/mediaCrop';

export default function PhotoCropFields({
  value = {},
  onChange,
  seed = 'foto',
  label = 'Foto',
  shape = 'rect',
  frameRatio = 4 / 3,
  grabHint = 'Agarra la foto y muévela: lo que quede dentro del recuadro es lo que se publica'
}) {
  const crop = normalizeMediaCrop(value);
  return (
    <div className="space-y-3">
      <ImageUploader
        compact
        label={label}
        value={value.imagen}
        onChange={(imagen) => onChange({ ...value, imagen })}
      />
      <ImageFocusPicker
        src={value.imagen}
        seed={seed}
        posX={crop.posX}
        posY={crop.posY}
        zoom={crop.zoom}
        flipX={crop.flipX}
        flipY={crop.flipY}
        rotate={crop.rotate}
        shape={shape}
        frameRatio={frameRatio}
        grabHint={grabHint}
        onChange={(patch) => onChange({ ...value, ...patch })}
      />
    </div>
  );
}
