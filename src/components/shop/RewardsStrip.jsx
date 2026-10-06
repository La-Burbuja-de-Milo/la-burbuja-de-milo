import React from 'react';
import EditHotspot from '../admin/EditHotspot';
import { normalizeRewardsStrip, rewardsStripVars } from '../../lib/rewardsStrip';

export default function RewardsStrip({ strip, editable, onEdit, onAction }) {
  const cfg = normalizeRewardsStrip(strip);
  if (!cfg.visible && !editable) return null;

  return (
    <EditHotspot enabled={editable} onEdit={onEdit} label="Editar franja" tone="light" placement="left">
      <section
        className={`milo-rewards-strip border-b border-neutral-200 bg-neutral-950 px-4 text-white lg:px-16 ${
          cfg.visible ? '' : 'opacity-40'
        }`}
        style={rewardsStripVars(cfg)}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 sm:gap-3">
          <p
            className="milo-rewards-copy min-w-0"
            dangerouslySetInnerHTML={{ __html: cfg.html }}
          />
          <button
            type="button"
            onClick={onAction}
            className="shrink-0 border border-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.18em]"
          >
            {cfg.buttonText}
          </button>
        </div>
      </section>
    </EditHotspot>
  );
}
