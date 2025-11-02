import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Fallback to anon key if service key is not available
  const key = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  console.log('Creating service client with key type:', supabaseServiceKey ? 'service' : 'anon')
  
  return createClient<Database>(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}