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

        // --- 1. PROCESAR DATOS DE LA LLAMADA (Siempre que sea posible) ---
        const callData = body.call || (body.call_id ? body : null);
        if (callData) {
            console.log(`🔍 Processing Call Data for ID: ${callData.call_id || body.call_id}`);
            const analysis = callData.analysis || {};
            const customerName = analysis.customer_name ||
                analysis.custom_analysis_data?.customer_name ||
                (typeof analysis.call_summary === 'string' && analysis.call_summary.includes('Nombre:') ? analysis.call_summary.split('Nombre:')[1].split('\n')[0].trim() : '');

            const callToUpsert = {
                client_id: finalClientId,
                retell_call_id: callData.call_id || body.call_id,
                customer_phone: callData.user_number || callData.customer_number || callData.from_number || 'Oculto',
                customer_name: customerName || 'Desconocido',
                duration: callData.duration_ms ? (callData.duration_ms / 1000).toFixed(1) : (callData.duration ? callData.duration.toString() : '0'),
                transcript: callData.transcript || 'Sin transcripción',
                recording_url: callData.recording_url || '',
                sentiment: analysis.user_sentiment || analysis.sentiment || 'En curso'
            };

            if (callToUpsert.retell_call_id) {
                console.log(`📤 Upserting Call [${callToUpsert.retell_call_id}] to DB`);
                const { error: callError } = await supabase
                    .from('calls')
                    .upsert([callToUpsert], { onConflict: 'retell_call_id' });

                if (callError) {
                    console.error('❌ Error upserting call:', JSON.stringify(callError));
                } else {
                    console.log('✅ Call upserted successfully');
                }
            }
        }

        // --- 2. PROCESAR PEDIDOS (Tool Call o Heurística) ---
        if (inferredType === 'order' || toolName === 'registra_pedido') {
            console.log('📦 Processing Order tool call/event...');
            let rawData = body;
            if (body.arguments) {
                rawData = typeof body.arguments === 'string' ? JSON.parse(body.arguments) : body.arguments;
            } else if (body.tool_call?.arguments) {
                rawData = typeof body.tool_call.arguments === 'string' ? JSON.parse(body.tool_call.arguments) : body.tool_call.arguments;
            }

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

            const detectedPrice = [rawData.total_price, rawData.total, rawData.amount, rawData.precio_total, rawData.precio, rawData.total_amount].find(v => v !== undefined && v !== null);

            const orderToInsert = {
                client_id: finalClientId,
                customer_name: (rawData.customer_name || rawData.nombre || body.customer_name || body.name || callData?.analysis?.customer_name || 'Cliente').trim(),
                customer_phone: rawData.phone_number || rawData.telefono || body.user_number || body.from_number || body.customer_number || 'N/A',
                items: itemsList,
                notes: finalNotes + (detectedPrice === undefined || detectedPrice === null || detectedPrice === 0 ? `\n\n⚠️ DEBUG JSON: ${JSON.stringify(rawData)}` : ''),
                status: 'Pendiente',
                total_price: detectedPrice
            };

            console.log('📤 Inserting Order to DB');
            const { error: orderError, data: orderData } = await supabase.from('orders').insert([orderToInsert]).select();
            if (orderError) {
                console.error('❌ Error inserting order:', JSON.stringify(orderError));
                return NextResponse.json({ error: orderError.message }, { status: 500 });
            }
            console.log('✅ Order inserted successfully');
            return NextResponse.json({ success: true, type: 'order', data: orderData });
        }

        // --- 3. PROCESAR LEADS ---
        if (inferredType === 'lead') {
            console.log('👤 Processing Lead event...');
            const leadToInsert = {
                client_id: finalClientId,
                name: body.first_name || body.name || 'Sin nombre',
                email: body.email || '',
                phone: body.phone || body.user_number || '',
                status: 'Nuevo'
            };

            const { error: leadError, data: leadData } = await supabase.from('leads').insert([leadToInsert]).select();
            if (leadError) {
                console.error('❌ Error inserting lead:', JSON.stringify(leadError));
                return NextResponse.json({ error: leadError.message }, { status: 500 });
            }
            console.log('✅ Lead inserted successfully');
            return NextResponse.json({ success: true, type: 'lead', data: leadData });
        }

        // Si llegó aquí y hubo datos de llamada, ya se upsertó arriba.
        if (callData) {
            console.log('📞 Returning success for call-only webhook');
            return NextResponse.json({ success: true, type: 'call' });
        }

        console.warn('⚠️ Webhook bypassed: nothing relevant to process');
        return NextResponse.json({ success: true, message: 'Bypassed' });

    } catch (error) {
        console.error('🔥 Critical Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
