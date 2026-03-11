import Constants from 'expo-constants';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  || (Constants.expoConfig?.extra?.supabaseUrl as string | undefined)
  || '';

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  || (Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined)
  || '';

export const supabaseRealtime: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 2,
        },
      },
    })
  : null;

export const isSupabaseRealtimeEnabled = Boolean(supabaseRealtime);
