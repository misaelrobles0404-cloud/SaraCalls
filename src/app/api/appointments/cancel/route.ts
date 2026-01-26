import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { supabase } = await import('@/lib/supabase');
        const { phone, client_id } = await request.json();

        if (!phone || !client_id) {
            return NextResponse.json({ error: 'Faltan datos: teléfono o cliente' }, { status: 400 });
        }

        // Buscar la cita más reciente para ese teléfono y cliente que esté 'Confirmada'
        const { data: appointment, error: searchError } = await supabase
            .from('appointments')
            .select('id')
            .eq('customer_phone', phone)
            .eq('client_id', client_id)
            .eq('status', 'Confirmada')
            .order('appointment_date', { ascending: false })
            .limit(1)
            .single();

        if (searchError || !appointment) {
            return NextResponse.json({
                success: false,
                message: 'No se encontró ninguna cita confirmada para este número.'
            }, { status: 404 });
        }

        // Actualizar el estado a 'Cancelada'
        const { error: updateError } = await supabase
            .from('appointments')
            .update({ status: 'Cancelada' })
            .eq('id', appointment.id);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: 'Cita cancelada correctamente.'
        });

    } catch (error: any) {
        console.error('Error in cancellation API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
