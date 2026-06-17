import { createClient } from '@supabase/supabase-js';
import { getUserHash } from '../utils/userHash';

// Mirrors the oneui pattern: a single Supabase client carrying the user's hash
// in the `x-user-hash` header. RLS policies on the DB read that header and only
// expose rows whose user_hash matches.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not set. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to .env'
  );
}

let cachedClient = null;
let cachedHash = null;

export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const currentHash = getUserHash();
  if (!currentHash) return null;
  if (cachedClient && cachedHash === currentHash) return cachedClient;

  cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { 'x-user-hash': currentHash } },
  });
  cachedHash = currentHash;
  return cachedClient;
}

export function resetClient() {
  cachedClient = null;
  cachedHash = null;
}
