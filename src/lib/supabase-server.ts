import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase para usar SOLO en API Routes (server-side).
 * Usa la Service Role Key para bypasear RLS donde sea necesario (webhooks, etc).
 * 
 * NUNCA importar este archivo desde componentes de cliente.
 */
export function createSupabaseServerClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("⚠️ ERROR: Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.")
    }

    return createClient(supabaseUrl, supabaseServiceKey)
}
