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

        // Detectar si es una llamada a herramienta (Tool Call) o si solo enviaron argumentos
        const isToolCall = body.type === 'tool_call' || body.event_type === 'tool_call' || !!body.tool_call_id;
        const toolName = body.tool_name || body.tool_call?.name || body.arguments?.name || body.name;

        // HEURÍSTICA: Si no sabemos el tipo, intentamos adivinar por los campos presentes
        let inferredType = urlType;
        if (!inferredType) {
            if (isFinalCall) {
                inferredType = 'call';
            } else if (toolName === 'registra_pedido' || body.items || (body.arguments && (typeof body.arguments === 'string' ? body.arguments.includes('items') : body.arguments.items))) {
                inferredType = 'order';
            } else if (body.first_name || body.email || body.lead_score) {
                inferredType = 'lead';
            } else {
                inferredType = eventType;
            }
        }

        console.log(`🚀 Final Decision - Type: [${inferredType}] | Tool: [${toolName}] | Client: [${urlClientId}]`);

        let table = '';
        let dataToInsert: any = {};

        // Caso 1: REGISTRO DE LLAMADA (Webhook Final)
        if (inferredType === 'call' || isFinalCall) {
            table = 'calls';
            const callData = body.call || body;
            dataToInsert = {
                client_id: urlClientId || callData.client_id || body.client_id || '3c9fbb10-4892-4134-8f7e-509ab36121b2', // Fallback al de Hikari si falla todo
                call_id: callData.call_id || body.call_id,
                customer_number: callData.user_number || callData.customer_number || callData.from_number || 'Oculto',
                duration: callData.duration_ms ? (callData.duration_ms / 1000).toFixed(1) : (callData.duration ? callData.duration.toString() : '0'),
                transcript: callData.transcript || 'Sin transcripción',
                recording_url: callData.recording_url || '',
                status: callData.call_status || 'completed'
            };
        }
        // Caso 2: PEDIDO DE COMIDA (Tool Call)
        else if (inferredType === 'order' || toolName === 'registra_pedido') {
            table = 'orders';

            // Extraer argumentos de donde sea que estén (Retell es muy inconsistente aquí)
            let rawData = body;
            if (body.arguments) {
                rawData = typeof body.arguments === 'string' ? JSON.parse(body.arguments) : body.arguments;
            } else if (body.tool_call?.arguments) {
                rawData = typeof body.tool_call.arguments === 'string' ? JSON.parse(body.tool_call.arguments) : body.tool_call.arguments;
            } else if (body.data) {
                rawData = body.data;
            }

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
                client_id: urlClientId || rawData.client_id || body.client_id || '3c9fbb10-4892-4134-8f7e-509ab36121b2',
                customer_name: rawData.customer_name || rawData.nombre || 'Cliente Sin Nombre',
                customer_phone: rawData.phone_number || rawData.telefono || body.user_number || body.from_number || 'N/A',
                items: itemsList,
                notes: finalNotes,
                status: 'Pendiente',
                total_price: rawData.total_price || rawData.precio_total || null
            };
        }
        // Caso 3: LEADS (Genérico)
        else if (inferredType === 'lead') {
            table = 'leads';
            dataToInsert = {
                client_id: urlClientId || body.client_id || '3c9fbb10-4892-4134-8f7e-509ab36121b2',
                first_name: body.first_name || body.name || 'Sin nombre',
                last_name: body.last_name || '',
                email: body.email || '',
                phone: body.phone || body.user_number || '',
                status: 'Nuevo'
            };
        }

        if (!table) {
            console.warn('⚠️ Webhook bypassed: could not determine table for payload Keys:', Object.keys(body));
            return NextResponse.json({ success: true, message: 'Bypassed - No table matched' });
        }

        console.log(`📤 Final Insert to [${table}]:`, JSON.stringify(dataToInsert, null, 2));

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
