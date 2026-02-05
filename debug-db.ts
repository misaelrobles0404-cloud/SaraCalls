import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    const { data: clients } = await supabase.from('clients').select('id, business_name');
    console.log('CLIENTS:', clients?.map(c => `${c.id}:${c.business_name}`).join(' | '));

    const { data: calls } = await supabase.from('calls').select('created_at, retell_call_id, client_id').order('created_at', { ascending: false }).limit(3);
    console.log('CALLS:', calls?.map(c => `[${c.created_at}] ${c.retell_call_id} (Client:${c.client_id})`).join(' | '));

    const { data: orders } = await supabase.from('orders').select('created_at, id, client_id, total_price').order('created_at', { ascending: false }).limit(3);
    console.log('ORDERS:', orders?.map(o => `[${o.created_at}] ${o.id} (Client:${o.client_id}) $${o.total_price}`).join(' | '));
}

debug();
