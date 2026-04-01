import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if Supabase is configured
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'your_supabase_project_url' ||
      supabaseAnonKey === 'your_supabase_anon_key' ||
      !supabaseUrl.startsWith('https://')) {
    console.error('Supabase not configured:', { supabaseUrl, hasKey: !!supabaseAnonKey })
    return null as any;
  }

  console.log('Creating Supabase server client with URL:', supabaseUrl)

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  )
}
