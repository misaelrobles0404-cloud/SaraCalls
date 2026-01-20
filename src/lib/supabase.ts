import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey || (typeof window !== 'undefined' && supabaseUrl.includes('your_supabase_url_here'))) {
    console.error("⚠️ ERROR: No se han configurado las llaves de Supabase en .env.local o Vercel.");
}

export const supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
)
