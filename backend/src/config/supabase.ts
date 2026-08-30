import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/config/environment';

export const supabase: SupabaseClient = createClient(env.supabaseUrl, env.supabaseKey, {
  auth: {
    persistSession: false,
  },
});
