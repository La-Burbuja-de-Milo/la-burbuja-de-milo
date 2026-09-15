// POST /api/perfiles/setup
// Para capturar los datos bio-estéticos iniciales (tipo de piel, sensibilidades)

import { supabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const { userId, tipo_piel, sensibilidades } = req.body;

  if (!userId || !tipo_piel) {
    return res.status(400).json({ error: 'Faltan datos requeridos.' });
  }

  try {
    // Asumiendo que hay una tabla 'perfiles' en la base de datos
    const { data, error } = await supabase
      .from('perfiles')
      .upsert({ 
        id: userId, 
        tipo_piel, 
        sensibilidades: sensibilidades || [] 
      })
      .select();

    if (error) throw error;

    return res.status(200).json({ message: 'Perfil actualizado correctamente.', data });
  } catch (error) {
    console.error('Error configurando perfil:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
}
