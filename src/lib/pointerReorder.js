import { useRef, useState } from 'react';
import { movePasillo } from './pasillos';

export function indexFromPointer(container, selector, clientX, clientY, axis = 'x') {
  const nodes = [...(container?.querySelectorAll(selector) || [])];
  if (!nodes.length) return 0;
  let best = 0;
  let bestDist = Infinity;
  nodes.forEach((node, index) => {
    const box = node.getBoundingClientRect();
    const mid = axis === 'y' ? box.top + box.height / 2 : box.left + box.width / 2;
    const point = axis === 'y' ? clientY : clientX;
    const dist = Math.abs(point - mid);
    if (dist < bestDist) {
      bestDist = dist;
      best = index;
    }
  });
  return best;
}

export function usePointerReorder(items, onReorder, { axis = 'x', selector, threshold = 6 } = {}) {
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const itemsRef = useRef(items);
  const [draggingId, setDraggingId] = useState(null);
  itemsRef.current = items;

  const start = (event, id) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const from = itemsRef.current.findIndex((item) => item.id === id);
    dragRef.current = {
      id,
      lastIndex: from,
      startX: event.clientX,
      startY: event.clientY,
      moved: false
    };
    setDraggingId(id);
  };

  const move = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const delta = axis === 'y'
      ? Math.abs(event.clientY - drag.startY)
      : Math.abs(event.clientX - drag.startX);
    if (!drag.moved && delta < threshold) return;
    drag.moved = true;
    const toIndex = indexFromPointer(
      containerRef.current,
      selector,
      event.clientX,
      event.clientY,
      axis
    );
    if (toIndex === drag.lastIndex) return;
    drag.lastIndex = toIndex;
    onReorder(movePasillo(itemsRef.current, drag.id, toIndex));
  };

  const stop = () => {
    const drag = dragRef.current;
    const result = { id: drag?.id || null, moved: Boolean(drag?.moved) };
    dragRef.current = null;
    setDraggingId(null);
    return result;
  };

  return { containerRef, draggingId, start, move, stop };
}
