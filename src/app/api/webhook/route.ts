import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { supabase } = await import('@/lib/supabase');
        const body = await request.json();

        console.log('📬 Webhook Received Body:', JSON.stringify(body, null, 2));

        const url = new URL(request.url);
        const urlType = url.searchParams.get('type');
        const urlClientId = url.searchParams.get('client_id');

        console.log(`🔍 Webhook Params - Type: ${urlType}, ClientID: ${urlClientId}`);

        // Determinar el tipo (Retell envía 'call' en el body si es el webhook final)
        const finalType = urlType || (body.call ? 'call' : body.type);
        const finalData = body.data || body;

        if (!finalType) {
            return NextResponse.json({ error: 'Missing type (order, call, lead)' }, { status: 400 });
        }

        let table = '';
        let dataToInsert = finalData;

        switch (finalType) {
            case 'call':
                table = 'calls';
                if (body.call) {
                    dataToInsert = {
                        client_id: urlClientId,
                        call_id: body.call.call_id,
                        customer_number: body.call.user_number,
                        duration: body.call.duration_ms ? (body.call.duration_ms / 1000).toString() : '0',
                        transcript: body.call.transcript,
                        status: body.call.call_status
                    };
                }
                break;
            case 'lead': table = 'leads'; break;
            case 'appointment': table = 'appointments'; break;
            case 'order':
                table = 'orders';

                // Extraer datos de manera más robusta (para diferentes versiones de payloads de Retell)
                const rawData = body.arguments ? (typeof body.arguments === 'string' ? JSON.parse(body.arguments) : body.arguments) : finalData;
                const items = rawData.items || [];

                let itemsList = 'Sin productos';
                if (Array.isArray(items) && items.length > 0) {
                    itemsList = items.map((i: any) => `• ${i.quantity}x ${i.item_name}${i.notes ? ` (${i.notes})` : ''}`).join('\n');
                } else if (typeof items === 'string') {
                    itemsList = items;
                }

                const finalNotes = `
                    Tipo: ${rawData.order_type === 'delivery' ? 'A domicilio' : 'Recoger'}
                    Dir: ${rawData.delivery_address || 'Sucursal'}
                    Utensilios: ${rawData.utensils ? 'Sí' : 'No'}
                    Comentarios: ${rawData.order_notes || ''}
                `.replace(/\s+/g, ' ').trim();

                dataToInsert = {
                    client_id: urlClientId || rawData.client_id,
                    customer_name: rawData.customer_name,
                    customer_phone: rawData.phone_number,
                    items: itemsList,
                    notes: finalNotes,
                    status: 'Pendiente',
                    total_price: rawData.total_price || null // Permitir que Sara envíe el precio
                };
                break;
            default:
                return NextResponse.json({ error: 'Invalid type: ' + finalType }, { status: 400 });
        }

        console.log(`📤 Inserting into [${table}]:`, dataToInsert);

        const { error, data: insertedData } = await supabase
            .from(table)
            .insert([dataToInsert])
            .select();

        if (error) {
            console.error(`❌ Supabase Error [${table}]:`, error);
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        console.log(`✅ Success inserting into ${table}`);
        return NextResponse.json({ success: true, table, data: insertedData });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
