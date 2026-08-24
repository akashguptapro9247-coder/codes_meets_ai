// ==========================================================================
// CODE MEETS AI - SUPABASE CLIENT INITIALIZATION
// ==========================================================================
// IMPORTANT: Only uses public Anon Key. Never expose service_role key here.
// ==========================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

// Create the Supabase client instance (or a dummy client if unconfigured)
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

// Test actual database connectivity
export const checkSupabaseConnection = async () => {
  if (!supabase) {
    return {
      connected: false,
      configured: false,
      message: 'SUPABASE CREDENTIALS MISSING IN .env'
    };
  }

  try {
    const { data, error } = await supabase
      .from('event_settings')
      .select('id')
      .limit(1);

    if (error) {
      // If event_settings table doesn't exist yet, try users table
      const userCheck = await supabase.from('users').select('user_id').limit(1);
      if (userCheck.error) {
        return {
          connected: false,
          configured: true,
          message: `DATABASE ERROR: ${userCheck.error.message}`
        };
      }
    }

    return {
      connected: true,
      configured: true,
      message: 'SUPABASE LIVE & CONNECTED'
    };
  } catch (err) {
    return {
      connected: false,
      configured: true,
      message: `CONNECTION FAILED: ${err.message || 'Network error'}`
    };
  }
};
