import React, { useEffect, useState } from 'react';
import { UserPlus, Shield } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import GlassCard from '../../../components/ui/GlassCard';
import AuroraButton from '../../../components/ui/AuroraButton';
import { ROLE_HINTS, ROLE_LABELS, ROLES, isGerente } from '../../../lib/roles';

const ROLE_OPTIONS = [ROLES.GERENTE, ROLES.ASESOR, ROLES.USUARIO];

function roleBadgeClass(rol) {
  if (rol === ROLES.GERENTE) return 'bg-rose-500/15 text-rose-500';
  if (rol === ROLES.ASESOR) return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400';
  return 'bg-pink-500/15 text-pink-600 dark:text-pink-400';
}

export default function EquipoTab() {
  const { session, profile } = useAuth();
  const [cuentas, setCuentas] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    rol: ROLES.ASESOR
  });

  const loadEquipo = async () => {
    if (!supabase) return;

    const [{ data: perfilesData }, { data: invitacionesData }] = await Promise.all([
      supabase.from('perfiles').select('id, email, nombre, rol, created_at').order('created_at', { ascending: false }),
      supabase.from('invitaciones').select('*').order('created_at', { ascending: false })
    ]);

    setCuentas(perfilesData || []);
    setInvitaciones(invitacionesData || []);
  };

  useEffect(() => {
    loadEquipo();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!supabase || !session?.user) return;

    setIsSaving(true);
    setMessage('');
    setErrorMessage('');

    const email = form.email.trim().toLowerCase();
    const existing = cuentas.find((cuenta) => cuenta.email?.toLowerCase() === email);

    if (existing) {
      const { error } = await supabase.from('perfiles').update({
        rol: form.rol,
        nombre: form.nombre.trim() || existing.nombre
      }).eq('id', existing.id);

      setIsSaving(false);
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setMessage(`${existing.email} ahora es ${ROLE_LABELS[form.rol]}.`);
      setForm({ nombre: '', email: '', rol: ROLES.ASESOR });
      await loadEquipo();
      return;
    }

    const { error: inviteError } = await supabase.from('invitaciones').upsert(
      {
        email,
        nombre: form.nombre.trim() || null,
        rol: form.rol,
        created_by: session.user.id,
        used_at: null
      },
      { onConflict: 'email' }
    );

    if (inviteError) {
      setIsSaving(false);
      setErrorMessage(inviteError.message);
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nombre: form.nombre.trim() || undefined }
      }
    });

    setIsSaving(false);

    if (otpError) {
      setErrorMessage(`La invitación se guardó, pero no se pudo enviar el correo: ${otpError.message}`);
      await loadEquipo();
      return;
    }

    setMessage(`Invitación enviada a ${email} como ${ROLE_LABELS[form.rol]}.`);
    setForm({ nombre: '', email: '', rol: ROLES.ASESOR });
    await loadEquipo();
  };

  const handleRoleChange = async (cuentaId, nuevoRol) => {
    if (!supabase || cuentaId === session?.user?.id) return;

    const { error } = await supabase.from('perfiles').update({ rol: nuevoRol }).eq('id', cuentaId);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    await loadEquipo();
  };

  const pendientes = invitaciones.filter((item) => !item.used_at);

  return (
    <div className="space-y-6">
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
            <UserPlus className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Crear cuenta del equipo</h3>
            <p className="text-xs text-gray-500">El correo recibe un enlace mágico y entra con el rol que elijas.</p>
          </div>
        </div>

        <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
          />
          <input
            type="email"
            required
            placeholder="correo@equipo.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
          />
          <select
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value })}
            className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white"
          >
            {ROLE_OPTIONS.map((rol) => (
              <option key={rol} value={rol}>
                {ROLE_LABELS[rol]}
              </option>
            ))}
          </select>
          <AuroraButton type="submit" className="w-full py-2.5 text-xs font-semibold" disabled={isSaving}>
            {isSaving ? 'Enviando...' : 'Invitar y enviar acceso'}
          </AuroraButton>
        </form>

        <p className="mt-3 text-[11px] text-gray-400">{ROLE_HINTS[form.rol]}</p>
        {message ? <p className="mt-2 text-xs text-emerald-500">{message}</p> : null}
        {errorMessage ? <p className="mt-2 text-xs text-rose-500">{errorMessage}</p> : null}
      </GlassCard>

      {pendientes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Invitaciones pendientes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendientes.map((item) => (
              <GlassCard key={item.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.nombre || item.email}</p>
                  <p className="text-xs text-gray-500">{item.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${roleBadgeClass(item.rol)}`}>
                  {ROLE_LABELS[item.rol]}
                </span>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Cuentas activas</h4>
        <div className="grid grid-cols-1 gap-3">
          {cuentas.map((cuenta) => (
            <GlassCard key={cuenta.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {cuenta.nombre || 'Sin nombre'}
                    {cuenta.id === session?.user?.id ? (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-gray-400">Tú</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-gray-500">{cuenta.email}</p>
                </div>
              </div>

              {isGerente(profile?.rol) && cuenta.id !== session?.user?.id ? (
                <select
                  value={cuenta.rol}
                  onChange={(e) => handleRoleChange(cuenta.id, e.target.value)}
                  className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-900 dark:text-white"
                >
                  {ROLE_OPTIONS.map((rol) => (
                    <option key={rol} value={rol}>
                      {ROLE_LABELS[rol]}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${roleBadgeClass(cuenta.rol)}`}>
                  {ROLE_LABELS[cuenta.rol] || cuenta.rol}
                </span>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
