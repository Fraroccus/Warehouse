import { createClient } from '@supabase/supabase-js'

// Support both manual env vars and Vercel Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    import.meta.env.VITE_PUBLIC_SUPABASE_URL ||
                    import.meta.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
                        import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log configuration status (helpful for debugging)
console.log('Supabase Config:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'not set'
})

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here')

// Create Supabase client only if configured
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper to check if we should use offline mode
export const useOfflineMode = () => {
  return !isSupabaseConfigured || import.meta.env.VITE_USE_OFFLINE_MODE === 'true'
}
