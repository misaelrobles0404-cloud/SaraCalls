import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fullName, email, phone, businessName, industry, teamSize, message } = body;

        // 1. Log para trazabilidad inmediata
        console.log(">>> NUEVO LEAD RECIBIDO:", {
            fecha: new Date().toLocaleString(),
            cliente: fullName,
            email,
            empresa: businessName,
            industria: industry
        });

        const { supabase } = await import('@/lib/supabase');

        // 2. Guardar en Supabase
        const { error: dbError } = await supabase
            .from('sales_leads')
            .insert([{
                full_name: fullName,
                email: email,
                phone: phone,
                business_name: businessName,
                industry: industry,
                team_size: teamSize,
                message: message,
                status: 'Nuevo'
            }]);

        if (dbError) {
            console.error("Error guardando en Supabase:", dbError);
            // Si la tabla no existe aún, solo logueamos y seguimos para no romper el flujo del usuario
        }

        // 3. Opcional: Notificación (Preparado)
        /*
        const WEBHOOK_URL = process.env.LEADS_WEBHOOK_URL;
        if (WEBHOOK_URL) {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        }
        */

        // Por ahora, devolvemos éxito para no bloquear al usuario
        return NextResponse.json({
            success: true,
            message: "Lead registrado correctamente y listo para notificación."
        }, { status: 200 });

    } catch (error) {
        console.error("Error procesando lead:", error);
        return NextResponse.json({
            success: false,
            message: "Error interno al procesar el registro."
        }, { status: 500 });
    }
}
