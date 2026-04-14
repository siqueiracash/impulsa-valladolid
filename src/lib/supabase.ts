import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const saveLeadDirectly = async (leadData: any) => {
  if (!supabase) {
    throw new Error("Supabase não configurado no cliente (VITE_SUPABASE_URL/KEY ausentes)");
  }

  const { error } = await supabase.from('leads').insert([leadData]);
  if (error) throw error;
  return { success: true };
};
