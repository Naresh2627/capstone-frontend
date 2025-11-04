import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // Automatically refresh expired tokens
    persistSession: true, // Persist session in localStorage
    detectSessionInUrl: true, // Detect session from URL (for OAuth callbacks)
    flowType: 'pkce', // Use PKCE flow for better security (Auth v2 default)
    debug: import.meta.env.DEV // Enable debug logs in development
  }
})