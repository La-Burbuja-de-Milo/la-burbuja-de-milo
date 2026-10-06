import React, { useEffect, useRef } from 'react';
import { sanitizeRewardsHtml } from '../../lib/rewardsStrip';

const tools = [
  { cmd: 'bold', label: 'N', title: 'Negrita' },
  { cmd: 'italic', label: 'C', title: 'Cursiva' },
  { cmd: 'underline', label: 'S', title: 'Subrayado' }
];

export default function RichTextField({ label, value, onChange, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const next = value || '';
    if (sanitizeRewardsHtml(node.innerHTML) !== sanitizeRewardsHtml(next)) {
      node.innerHTML = next;
    }
  }, [value]);

  const emit = () => {
    if (!ref.current) return;
    onChange(sanitizeRewardsHtml(ref.current.innerHTML));
  };

  const apply = (cmd) => {
    ref.current?.focus();
    document.execCommand('styleWithCSS', false, false);
    document.execCommand(cmd, false, null);
    emit();
  };

  return (
    <div className={className}>
      {label ? (
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300">
          {label}
        </span>
      ) : null}
      <div className="mb-1 flex gap-1">
        {tools.map((tool) => (
          <button
            key={tool.cmd}
            type="button"
            title={tool.title}
            aria-label={tool.title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => apply(tool.cmd)}
            className="min-w-8 border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
          >
            {tool.label}
          </button>
        ))}
        <span className="self-center pl-1 text-[10px] text-neutral-400">
          Selecciona texto y aplica negrita, cursiva o subrayado.
        </span>
      </div>
      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        className="min-h-[4.5rem] w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white"
        onInput={emit}
        onBlur={emit}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          document.execCommand('insertLineBreak');
          emit();
        }}
      />
    </div>
  );
}
