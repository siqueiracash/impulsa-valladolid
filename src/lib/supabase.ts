import { createClient } from '@supabase/supabase-js';

// Função para obter variáveis de ambiente de forma mais robusta
const getEnv = (key: string) => {
  return import.meta.env[key] || (typeof process !== 'undefined' ? process.env[key] : undefined);
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Somente inicializa se as chaves existirem para evitar erro de tela branca
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn('Supabase URL or Anon Key is missing. Audit saving will be disabled.');
}
