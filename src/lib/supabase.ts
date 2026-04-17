import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

// 1. Intenta inicializar con variables de entorno de Vite (Build-time)
// Esto funciona en Vercel si las variables están en el Dashboard de Vercel
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (envUrl && envKey) {
  console.log("[SUPABASE] Inicializado vía variables de entorno (Vite)");
  supabaseInstance = createClient(envUrl, envKey);
}

export const getSupabase = () => supabaseInstance;

// 2. Función para inicializar dinámicamente (Runtime fallback)
export const initSupabase = (url: string, key: string) => {
  if (!supabaseInstance && url && key) {
    supabaseInstance = createClient(url, key);
    console.log("[SUPABASE] Inicializado dinámicamente vía API config");
  }
  return supabaseInstance;
};

export const saveLeadDirectly = async (leadData: any) => {
  const client = getSupabase();
  if (!client) {
    throw new Error("Supabase no inicializado. Verifique si las variables VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY están configuradas.");
  }

  const { error } = await client.from('leads').insert([leadData]);
  if (error) throw error;
  return { success: true };
};
