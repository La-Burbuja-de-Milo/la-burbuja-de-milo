import { useState } from 'react';
import { CloudUpload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MiloStore } from '../../services/miloStore';

export default function PublishCatalogButton({ variant = 'admin' }) {
  const { isGerente: gerente, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const bar = variant === 'bar';

  if (loading || !gerente) return null;

  const publish = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const result = await MiloStore.publishCatalog();
      setStatus({
        ok: Boolean(result?.ok),
        text: result?.ok
          ? (result.message || 'Publicado en el sitio.')
          : (result?.error || 'No se pudo publicar.')
      });
    } catch (error) {
      setStatus({ ok: false, text: error?.message || 'No se pudo publicar.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={bar ? 'flex flex-wrap items-center justify-center gap-2' : 'flex flex-col items-end gap-1'}>
      <button
        type="button"
        disabled={busy}
        onClick={publish}
        className={bar
          ? 'inline-flex items-center gap-2 border border-white/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] disabled:opacity-60'
          : 'inline-flex items-center gap-2 bg-neutral-900 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900'}
      >
        <CloudUpload className="h-3.5 w-3.5" />
        {busy ? 'Publicando…' : 'Publicar al sitio'}
      </button>
      {status ? (
        <p className={`max-w-xs text-[11px] leading-snug ${
          status.ok
            ? (bar ? 'text-emerald-200' : 'text-emerald-700 dark:text-emerald-400')
            : (bar ? 'text-rose-200' : 'text-rose-600 dark:text-rose-400')
        }`}
        >
          {status.text}
        </p>
      ) : null}
    </div>
  );
}
