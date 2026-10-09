import React from 'react';
import CategoryCirclesFields from './CategoryCirclesFields';
import { createTiendaMarca } from '../../lib/tiendaMarcas';

export default function TiendaMarcasFields({ form, onChange }) {
  const circles = Array.isArray(form?.circles) ? form.circles : [];

  return (
    <CategoryCirclesFields
      form={form}
      onChange={onChange}
      orderHint="Arrastra los círculos para cambiar el orden. Elige cómo se sientan sobre el carrusel de Tienda."
      editableLabels
      allowAdd
      onCreate={(nombre) => onChange({
        ...form,
        circles: [...circles, createTiendaMarca(nombre, circles)]
      })}
    />
  );
}
