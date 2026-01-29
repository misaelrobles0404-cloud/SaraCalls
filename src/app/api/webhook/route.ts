import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { supabase } = await import('@/lib/supabase');
        const body = await request.json();

        console.log('📬 Webhook Received Body:', JSON.stringify(body, null, 2));

        // Determinar el tipo de evento y los datos
        const url = new URL(request.url);
        const urlType = url.searchParams.get('type');
        const urlClientId = url.searchParams.get('client_id');

        // Retell puede enviar el evento en body.event_type o body.type
        const eventType = body.event_type || body.type;

        // Si el body tiene un objeto 'call', probablemente es el webhook final de Retell
        const isFinalCall = !!body.call;

        // Detectar si es una llamada a herramienta (Tool Call) de Retell
        const isToolCall = body.type === 'tool_call' || body.event_type === 'tool_call' || !!body.tool_call_id;
        const toolName = body.tool_name || body.tool_call?.name || body.arguments?.name;

        // Determinar el tipo final de manera inteligente
        let finalType = urlType;
        if (!finalType) {
            if (isFinalCall) finalType = 'call';
            else if (isToolCall || toolName === 'registra_pedido') finalType = 'order';
            else finalType = eventType;
        }

        console.log(`🚀 Processing [${finalType}] | Tool: [${toolName}] | Client: [${urlClientId}]`);

        let table = '';
        let dataToInsert: any = {};

        if (finalType === 'call' || isFinalCall) {
            table = 'calls';
            const callData = body.call || body;
            dataToInsert = {
                client_id: urlClientId || callData.client_id,
                call_id: callData.call_id || body.call_id,
                customer_number: callData.user_number || callData.customer_number || 'Oculto',
                duration: callData.duration_ms ? (callData.duration_ms / 1000).toFixed(1) : '0',
                transcript: callData.transcript || 'Sin transcripción',
                recording_url: callData.recording_url || '',
                status: callData.call_status || 'completed'
            };
        }
        else if (finalType === 'order' || toolName === 'registra_pedido') {
            table = 'orders';

            // Extraer argumentos de cualquier lugar posible (body.arguments, body.args, body.data.args, etc)
            const args = body.arguments || body.args || body.tool_call?.arguments || (body.data?.arguments) || body;
            const rawData = typeof args === 'string' ? JSON.parse(args) : args;

            console.log('📦 Extracted Order Data:', JSON.stringify(rawData, null, 2));

            const items = rawData.items || [];
            let itemsList = 'Sin productos';

            if (Array.isArray(items) && items.length > 0) {
                itemsList = items.map((i: any) => `• ${i.quantity}x ${i.item_name}${i.notes ? ` (${i.notes})` : ''}`).join('\n');
            } else if (typeof items === 'string') {
                itemsList = items;
            }

            const finalNotes = `
                Tipo: ${(rawData.order_type === 'delivery' || rawData.tipo === 'domicilio') ? 'A domicilio' : 'Recoger'}
                Dir: ${rawData.delivery_address || rawData.direccion || 'Sucursal'}
                Utensilios: ${rawData.utensils ? 'Sí' : 'No'}
                Comentarios: ${rawData.order_notes || rawData.notas || ''}
            `.replace(/\s+/g, ' ').trim();

            dataToInsert = {
                client_id: urlClientId || rawData.client_id || body.client_id,
                customer_name: rawData.customer_name || rawData.nombre || 'Cliente Sin Nombre',
                customer_phone: rawData.phone_number || rawData.telefono || body.user_number || 'N/A',
                items: itemsList,
                notes: finalNotes,
                status: 'Pendiente',
                total_price: rawData.total_price || rawData.precio_total || null
            };
        }
        else if (finalType === 'lead') {
            table = 'leads';
            dataToInsert = {
                client_id: urlClientId,
                ...body
            };
        }

        if (!table) {
            console.warn('⚠️ No table matched for event:', finalType);
            return NextResponse.json({ error: 'Unsupported event type' }, { status: 400 });
        }

        console.log(`📤 Inserting into [${table}]:`, JSON.stringify(dataToInsert, null, 2));

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
