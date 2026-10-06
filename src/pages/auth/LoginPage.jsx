import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { homeForRole, isStaff } from '../../lib/roles';

const inputClass =
  'w-full border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, profile, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!session || loading) return;

    const requested = location.state?.from?.pathname;
    if (requested && requested !== '/login') {
      if (requested.startsWith('/admin') && !isStaff(profile?.rol)) {
        navigate('/mi-burbuja', { replace: true });
        return;
      }
      navigate(requested, { replace: true });
      return;
    }

    navigate(homeForRole(profile?.rol), { replace: true });
  }, [session, profile, loading, location.state, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      setErrorMessage('Supabase aún no está configurado.');
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSent(true);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center bg-white px-4 text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <h1 className="text-3xl font-medium tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Ingresa tu correo para recibir un enlace. Sin contraseñas.
      </p>

      {sent ? (
        <div className="mt-8 space-y-3 border border-neutral-200 p-6 text-sm">
          <p>Revisa tu correo: enviamos un enlace a <strong>{email}</strong>.</p>
          <p className="text-xs text-neutral-500">Si no llega, mira spam. El registro libre crea una cuenta de cliente.</p>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-300">
              Correo
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className={inputClass}
            />
          </div>
          {errorMessage ? <p className="text-xs text-neutral-700">{errorMessage}</p> : null}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-neutral-900 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
          >
            {isLoading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
      )}

      <button type="button" onClick={() => navigate(-1)} className="mt-6 text-left text-xs uppercase tracking-[0.14em] text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
        Volver
      </button>
    </div>
  );
}
