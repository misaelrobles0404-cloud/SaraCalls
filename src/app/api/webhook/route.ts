import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { supabase } = await import('@/lib/supabase');
        const body = await request.json();

        // Obtener parámetros de la URL (?type=...&client_id=...)
        const url = new URL(request.url);
        const urlType = url.searchParams.get('type');
        const urlClientId = url.searchParams.get('client_id');

        // Determinar el tipo (prioridad: URL > Body)
        const finalType = urlType || body.type;

        // Determinar los datos (si no viene envuelto en 'data', usamos el body completo)
        const finalData = body.data || body;

        if (!finalType || !finalData) {
            return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
        }

        let table = '';
        let dataToInsert = finalData;

        switch (finalType) {
            case 'call': table = 'calls'; break;
            case 'lead': table = 'leads'; break;
            case 'appointment': table = 'appointments'; break;
            case 'order':
                table = 'orders';
                // Transformar el JSON complejo de Retell al formato simple de la DB
                const itemsList = Array.isArray(finalData.items)
                    ? finalData.items.map((i: any) => `${i.quantity}x ${i.item_name}${i.notes ? ` (${i.notes})` : ''}`).join(', ')
                    : (finalData.items || 'Sin productos');

                const finalNotes = `
                    Tipo: ${finalData.order_type === 'delivery' ? 'A domicilio' : 'Recoger'}
                    Dir: ${finalData.delivery_address || 'Sucursal'}
                    Utensilios: ${finalData.utensils ? 'Sí' : 'No'}
                    Comentarios: ${finalData.order_notes || ''}
                `.replace(/\s+/g, ' ').trim();

                dataToInsert = {
                    client_id: finalData.client_id || urlClientId,
                    customer_name: finalData.customer_name,
                    customer_phone: finalData.phone_number,
                    items: itemsList,
                    notes: finalNotes,
                    status: 'Pendiente'
                };
                break;
            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        const { error } = await supabase
            .from(table)
            .insert([dataToInsert]);

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
