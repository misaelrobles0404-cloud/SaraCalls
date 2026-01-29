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

        // Función para validar UUID
        const isValidUUID = (uuid: string) => {
            const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return regex.test(uuid);
        };

        const finalClientId = (urlClientId || body.client_id || '3c9fbb10-4892-4134-8f7e-509ab36121b2').trim();

        if (!isValidUUID(finalClientId)) {
            console.error('❌ Invalid Client ID Format:', finalClientId);
            return NextResponse.json({ error: 'Invalid client_id' }, { status: 400 });
        }

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

        console.log(`🚀 Final Decision - Type: [${inferredType}] | Client: [${finalClientId}]`);

        let table = '';
        let dataToInsert: any = {};

        // Caso 1: REGISTRO DE LLAMADA (Webhook Final)
        if (inferredType === 'call' || isFinalCall) {
            table = 'calls';
            const callData = body.call || body;
            dataToInsert = {
                client_id: finalClientId,
                call_id: callData.call_id || body.call_id || 'Unknown',
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
            }

            console.log('📦 Extracted Order Data:', JSON.stringify(rawData, null, 2));

            // Manejar tanto array como objeto único de productos
            const itemsRaw = rawData.items || rawData;
            const itemsArray = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];

            let itemsList = 'Sin productos';
            if (itemsArray.length > 0 && itemsArray[0].item_name) {
                itemsList = itemsArray.map((i: any) => `• ${i.quantity || 1}x ${i.item_name}${i.notes ? ` (${i.notes})` : ''}`).join('\n');
            } else if (typeof rawData.items === 'string') {
                itemsList = rawData.items;
            }

            const finalNotes = [
                `Tipo: ${(rawData.order_type === 'delivery' || rawData.tipo === 'domicilio') ? 'A domicilio' : 'Recoger'}`,
                `Dir: ${rawData.delivery_address || rawData.direccion || 'Sucursal'}`,
                `Comentarios: ${rawData.order_notes || rawData.notas || ''}`,
                `Utensilios: ${rawData.utensils ? 'Sí' : 'No'}`
            ].join('\n');

            // Detección ultra-robusta de precio
            const detectedPrice = [
                rawData.total_price,
                rawData.total,
                rawData.amount,
                rawData.precio_total,
                rawData.precio,
                rawData.total_amount
            ].find(v => v !== undefined && v !== null);

            dataToInsert = {
                client_id: finalClientId,
                customer_name: rawData.customer_name || rawData.nombre || 'Cliente',
                customer_phone: rawData.phone_number || rawData.telefono || body.user_number || body.from_number || body.customer_number || 'N/A',
                items: itemsList,
                notes: finalNotes + (detectedPrice === undefined || detectedPrice === null || detectedPrice === 0 ? `\n\n⚠️ DEBUG JSON: ${JSON.stringify(rawData)}` : ''),
                status: 'Pendiente',
                total_price: detectedPrice
            };
        }
        // Caso 3: LEADS (Genérico)
        else if (inferredType === 'lead') {
            table = 'leads';
            dataToInsert = {
                client_id: finalClientId,
                first_name: body.first_name || body.name || 'Sin nombre',
                last_name: body.last_name || '',
                email: body.email || '',
                phone: body.phone || body.user_number || '',
                status: 'Nuevo'
            };
        }

        if (!table) {
            console.warn('⚠️ Webhook bypassed: could not determine table for payload');
            return NextResponse.json({ success: true, message: 'Bypassed' });
        }

        console.log(`📤 Final Insert to [${table}]:`, JSON.stringify(dataToInsert, null, 2));

        const { error, data: insertedData } = await supabase
            .from(table)
            .insert([dataToInsert])
            .select();

        if (error) {
            console.error(`❌ Supabase Error [${table}]:`, JSON.stringify(error, null, 2));
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        console.log(`✅ Success inserting into ${table}`);
        return NextResponse.json({ success: true, table, data: insertedData });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
