import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tvyhsjcxscoyqkhnazwa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseAnonKey && supabaseAnonKey !== 'YOUR_ANON_KEY_HERE';

if (!isConfigured) {
  console.warn(
    'Supabase has not been fully configured yet. Please update the VITE_SUPABASE_ANON_KEY value in your .env file. The application will fall back to local storage.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'placeholder-anon-key');

export const ROLE_LEVELS = {
  'COMMUNITY_MEMBER': 1,
  'MEMBER': 1,
  'CORE_MEMBER': 2,
  'VOLUNTEER': 3,
  'ADMIN': 4
};

export { isConfigured };
