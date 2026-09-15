import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import AuroraButton from '../../components/ui/AuroraButton';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/mi-burbuja';

  useEffect(() => {
    if (session) {
      navigate(from, { replace: true });
    }
  }, [session, from, navigate]);

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
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <GlassCard className="w-full max-w-sm p-6 sm:p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inicia sesión</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Ingresa tu correo para recibir un enlace mágico. Sin contraseñas.
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Revisa tu correo: enviamos un enlace a <strong>{email}</strong>.
            </p>
            <p className="text-xs text-gray-500">
              Si no llega en un minuto, mira spam. El primer usuario en entrar queda como admin.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-semibold text-gray-600 dark:text-gray-300 ml-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm transition-all text-gray-900 dark:text-white"
              />
            </div>

            {errorMessage ? (
              <p className="text-xs text-rose-500">{errorMessage}</p>
            ) : null}

            <AuroraButton type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar enlace mágico'}
            </AuroraButton>
          </form>
        )}

        <div className="mt-6 text-center">
          <button onClick={() => navigate(-1)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            &larr; Volver
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
