import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Duidelijke foutmelding + voorkomt "white screen without clue"
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars', {
    VITE_SUPABASE_URL: !!supabaseUrl,
    VITE_SUPABASE_ANON_KEY: !!supabaseAnonKey,
  });

  throw new Error(
    'Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env and restart the dev server.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
