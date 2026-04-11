import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
    try {
        const supabase = createSupabaseServerClient();
        const body = await req.json();
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get('client_id');

        if (!clientId) {
            return NextResponse.json({ error: 'Missing client_id' }, { status: 400 });
        }

        console.log('📬 Vapi Webhook Received:', JSON.stringify(body, null, 2));

        // Vapi Tool Call format
        const message = body.message;
        if (message?.type === 'tool-call') {
            const toolCall = message.toolCalls?.[0];
            const toolName = toolCall?.function?.name;
            const args = typeof toolCall?.function?.arguments === 'string'
                ? JSON.parse(toolCall.function.arguments)
                : toolCall?.function?.arguments;

            if (toolName === 'registra_pedido') {
                console.log('📦 Processing Vapi Order:', args);

                // Reutilizamos la lógica de formateo del webhook original
                const itemsRaw = args.items;
                const itemsArray = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];

                let itemsList = 'Sin productos';
                if (itemsArray.length > 0 && itemsArray[0].item_name) {
                    itemsList = itemsArray.map((i: any) => `• ${i.quantity || 1}x ${i.item_name}${i.notes ? ` (${i.notes})` : ''}`).join('\n');
                } else if (typeof args.items === 'string') {
                    itemsList = args.items;
                }

                const finalNotes = [
                    `Tipo: ${(args.order_type === 'delivery' || args.tipo === 'domicilio') ? 'A domicilio' : 'Recoger'}`,
                    `Dir: ${args.delivery_address || args.direccion || 'Sucursal'}`,
                    `Comentarios: ${args.order_notes || args.notas || ''}`,
                    `Utensilios: ${args.utensils ? 'Sí' : 'No'}`
                ].join('\n');

                const detectedPrice = [args.total_price, args.total, args.amount, args.precio_total, args.precio, args.total_amount].find(v => v !== undefined && v !== null);

                const orderToInsert = {
                    client_id: clientId,
                    customer_name: (args.customer_name || args.nombre || 'Cliente Vapi').trim(),
                    customer_phone: args.phone_number || args.telefono || body.customer?.number || 'N/A',
                    items: itemsList,
                    notes: finalNotes,
                    status: 'Pendiente',
                    total_price: detectedPrice
                };

                const { error: orderError } = await supabase.from('orders').insert([orderToInsert]);

                if (orderError) throw orderError;

                return NextResponse.json({
                    results: [{
                        toolCallId: toolCall.id,
                        result: "Pedido registrado con éxito en el sistema."
                    }]
                });
            }
        }

        // Response for other Vapi events
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('❌ Vapi Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
