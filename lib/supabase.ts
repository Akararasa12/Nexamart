import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  console.warn('Warning: NEXT_PUBLIC_SUPABASE_URL is missing from environment variables.');
}

// Client for public operations (anon role)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for secure administrative operations (service role)
// If SUPABASE_SERVICE_ROLE_KEY is not defined, fall back to anon key
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
