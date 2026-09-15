// POST /api/auth/login
// Implementación de login sin contraseña (OTP) usando Supabase

import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  if (!isSupabaseConfigured) {
    return res.status(503).json({ error: 'Supabase aún no está configurado.' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El email es requerido.' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) throw error;

    return res.status(200).json({ message: 'OTP enviado correctamente. Revisa tu correo.', data });
  } catch (error) {
    console.error('Error enviando OTP:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
}
