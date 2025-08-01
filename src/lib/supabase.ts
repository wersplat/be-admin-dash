import { createClient } from '@supabase/supabase-js';

// Check if we're in the browser
const isClient = typeof window !== 'undefined';

// Initialize the Supabase client with a singleton pattern
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (!isClient) {
    throw new Error('Supabase client can only be accessed on the client side');
  }

  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseInstance;
};

// For backward compatibility
export const supabase = isClient ? getSupabase() : null;
