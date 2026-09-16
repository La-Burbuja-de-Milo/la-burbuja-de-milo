import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { isGerente, isStaff } from '../lib/roles';

const AuthContext = createContext({
  session: null,
  profile: null,
  rol: null,
  isGerente: false,
  isStaff: false,
  isAdmin: false,
  loading: true,
  configured: false,
  signOut: async () => {}
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(isSupabaseConfigured));

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) {
      setProfile(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from('perfiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.warn('No se pudo leer el perfil:', error.message);
        setProfile(data || null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      profile,
      rol: profile?.rol || null,
      isGerente: isGerente(profile?.rol),
      isStaff: isStaff(profile?.rol),
      isAdmin: isGerente(profile?.rol),
      loading,
      configured: isSupabaseConfigured,
      signOut: async () => {
        if (supabase) await supabase.auth.signOut();
      }
    }),
    [session, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
