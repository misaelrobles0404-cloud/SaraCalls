
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log(`URL: ${supabaseUrl}`);

    // Try to fetch from 'calls' table - expecting it to exist based on SQL files
    // We use .select('count', { count: 'exact', head: true }) to just check existence/permission without fetching data
    const { count, error } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Connection failed or table "calls" not accessible:', error.message);
        // Try a simpler query if specific table fails (e.g. maybe RLS blocks anon)
        console.log('Trying simpler health check...');
        // There isn't a generic "ping", but we can check auth
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.error('Auth check also failed:', authError.message);
        } else {
            console.log('Auth service is reachable.');
        }
    } else {
        console.log(`Success! Connection established. Found ${count !== null ? count : 'unknown'} records in "calls".`);
    }
}

testConnection();
