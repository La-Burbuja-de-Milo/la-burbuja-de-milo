import { createClient } from '@supabase/supabase-js';

// Las variables de entorno en Vercel y localmente a través de .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Advertencia: Faltan las variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY.');
}

// Inicializamos y exportamos el cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Generalmente false en backend serverless
  }
});
