import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, data } = body;

        // Validar que tengamos los datos necesarios
        if (!type || !data) {
            return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
        }

        let table = '';
        switch (type) {
            case 'call':
                table = 'calls';
                break;
            case 'lead':
                table = 'leads';
                break;
            case 'appointment':
                table = 'appointments';
                break;
            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        const { error } = await supabase
            .from(table)
            .insert([data]);

        if (error) {
            console.error('Supabase Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: `Data inserted into ${table}` });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
