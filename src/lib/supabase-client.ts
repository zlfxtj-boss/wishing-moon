import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'your_supabase_project_url' ||
      supabaseAnonKey === 'your_supabase_anon_key' ||
      !supabaseUrl.startsWith('https://')) {
    console.warn('Supabase credentials not configured. Auth features disabled.');
    return null as any;
  }

  // Re-create client if URL changed (e.g., after Vercel env update)
  if (supabaseClient && (supabaseClient as any).supabaseUrl !== supabaseUrl) {
    supabaseClient = null as any;
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}
