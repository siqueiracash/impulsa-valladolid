import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

// Tenta inicializar com variáveis de ambiente (Vite build-time)
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (envUrl && envKey) {
  supabaseInstance = createClient(envUrl, envKey);
}

export const getSupabase = () => supabaseInstance;

export const initSupabase = (url: string, key: string) => {
  if (!supabaseInstance && url && key) {
    supabaseInstance = createClient(url, key);
    console.log("[SUPABASE] Inicializado dinamicamente via API config");
  }
  return supabaseInstance;
};

export const saveLeadDirectly = async (leadData: any) => {
  const client = getSupabase();
  if (!client) {
    throw new Error("Supabase não inicializado. Verifique as configurações.");
  }

  const { error } = await client.from('leads').insert([leadData]);
  if (error) throw error;
  return { success: true };
};
