-- 1. Crear tabla de configuración global de la agencia
CREATE TABLE IF NOT EXISTS agency_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retell_api_key TEXT,
    make_webhook_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insertar fila inicial de configuración si no existe
INSERT INTO agency_settings (id) VALUES ('00000000-0000-0000-0000-000000000000') 
ON CONFLICT DO NOTHING;

-- 3. Crear una vista para el Super Admin para monitorear consumo (Llamadas por cliente)
CREATE OR REPLACE VIEW agency_client_usage AS
SELECT 
    c.id as client_id,
    c.business_name,
    COUNT(cal.id) as total_calls,
    -- Aquí podrías sumar minutos reales si los tienes, por ahora estimamos 5m por llamada
    SUM(CASE WHEN cal.duration IS NOT NULL THEN (substring(cal.duration from '[0-9]+')::int) ELSE 5 END) as total_minutes,
    MAX(cal.created_at) as last_call
FROM clients c
LEFT JOIN calls cal ON c.id = cal.client_id
GROUP BY c.id, c.business_name;
