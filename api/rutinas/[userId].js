// GET /api/rutinas/[userId]
// Para recuperar la rutina activa del usuario

import { supabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido. Usa GET.' });
  }

  // En Vercel, req.query.[param] te da el parámetro dinámico
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'El ID de usuario es requerido.' });
  }

  try {
    const { data, error } = await supabase
      .from('rutinas')
      .select('*')
      .eq('user_id', userId)
      .eq('activa', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 es 'No rows found'
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'No se encontró una rutina activa para este usuario.' });
    }

    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error recuperando rutina:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
}
