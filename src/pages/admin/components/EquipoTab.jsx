import React, { useEffect, useState } from 'react';
import { UserPlus, Shield } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { ROLE_HINTS, ROLE_LABELS, ROLES, isGerente } from '../../../lib/roles';

const ROLE_OPTIONS = [ROLES.GERENTE, ROLES.ASESOR, ROLES.USUARIO];
const inputClass = 'border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-500 dark:bg-neutral-950 dark:text-white dark:focus:border-white';
const panel = 'border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950';

function roleLabel(rol) {
  return ROLE_LABELS[rol] || rol;
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
      setMessage(`${existing.email} ahora es ${roleLabel(form.rol)}.`);
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

    setMessage(`Invitación enviada a ${email} como ${roleLabel(form.rol)}.`);
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
      <div className="border border-neutral-200 p-5 sm:p-6 dark:border-neutral-700">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center border border-neutral-900 dark:border-white">
            <UserPlus className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-medium">Crear cuenta del equipo</h3>
            <p className="text-sm text-neutral-500">El correo recibe un enlace y entra con el rol que elijas.</p>
          </div>
        </div>

        <form onSubmit={handleInvite} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className={inputClass}
          />
          <input
            type="email"
            required
            placeholder="correo@equipo.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
          <select
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value })}
            className={inputClass}
          >
            {ROLE_OPTIONS.map((rol) => (
              <option key={rol} value={rol}>
                {ROLE_LABELS[rol]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-neutral-900 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
            disabled={isSaving}
          >
            {isSaving ? 'Enviando...' : 'Invitar'}
          </button>
        </form>

        <p className="mt-3 text-[11px] text-neutral-400">{ROLE_HINTS[form.rol]}</p>
        {message ? <p className="mt-2 text-xs text-neutral-700 dark:text-neutral-300">{message}</p> : null}
        {errorMessage ? <p className="mt-2 text-xs text-neutral-900 dark:text-white">{errorMessage}</p> : null}
      </div>

      {pendientes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Invitaciones pendientes</h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {pendientes.map((item) => (
              <div key={item.id} className={`${panel} flex items-center justify-between gap-3`}>
                <div>
                  <p className="text-sm font-medium">{item.nombre || item.email}</p>
                  <p className="text-xs text-neutral-500">{item.email}</p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {roleLabel(item.rol)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Cuentas activas</h4>
        <div className="grid grid-cols-1 gap-3">
          {cuentas.map((cuenta) => (
            <div key={cuenta.id} className={`${panel} flex flex-col justify-between gap-3 sm:flex-row sm:items-center`}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-neutral-900 dark:border-white">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {cuenta.nombre || 'Sin nombre'}
                    {cuenta.id === session?.user?.id ? (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-neutral-400">Tú</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-neutral-500">{cuenta.email}</p>
                </div>
              </div>

              {isGerente(profile?.rol) && cuenta.id !== session?.user?.id ? (
                <select
                  value={cuenta.rol}
                  onChange={(e) => handleRoleChange(cuenta.id, e.target.value)}
                  className={`${inputClass} text-xs font-semibold`}
                >
                  {ROLE_OPTIONS.map((rol) => (
                    <option key={rol} value={rol}>
                      {ROLE_LABELS[rol]}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {roleLabel(cuenta.rol)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
