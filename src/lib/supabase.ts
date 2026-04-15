import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

// 1. Tenta inicializar com variáveis de ambiente do Vite (Build-time)
// Isso funciona no Vercel se as variáveis estiverem no Dashboard do Vercel
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (envUrl && envKey) {
  console.log("[SUPABASE] Inicializado via variáveis de ambiente (Vite)");
  supabaseInstance = createClient(envUrl, envKey);
}

export const getSupabase = () => supabaseInstance;

// 2. Função para inicializar dinamicamente (Runtime fallback)
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
    throw new Error("Supabase não inicializado. Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas.");
  }

  const { error } = await client.from('leads').insert([leadData]);
  if (error) throw error;
  return { success: true };
};
