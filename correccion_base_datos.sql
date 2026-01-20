-- 1. RENOMBRAR TABLAS (Para que coincidan con el código)
-- Si tus tablas se llaman como en la imagen, esto las corregirá:

ALTER TABLE IF EXISTS clientela RENAME TO clients;
ALTER TABLE IF EXISTS llamadas RENAME TO calls;
ALTER TABLE IF EXISTS equipo RENAME TO appointments;
-- 'dirige' lo manejaremos como leads si es necesario:
ALTER TABLE IF EXISTS dirige RENAME TO leads;

-- 2. ASEGURAR COLUMNAS CRÍTICAS
-- Tabla de Clientes
ALTER TABLE clients ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry TEXT;

-- Tabla de Llamadas
ALTER TABLE calls ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS sentiment TEXT;

-- 3. CREAR CONFIGURACIÓN DE AGENCIA (Super Admin)
CREATE TABLE IF NOT EXISTS agency_settings (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000',
    retell_api_key TEXT,
    make_webhook_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO agency_settings (id) VALUES ('00000000-0000-0000-0000-000000000000') ON CONFLICT DO NOTHING;

-- 4. VISTA DE CONSUMO PARA TI (Dueño)
CREATE OR REPLACE VIEW agency_client_usage AS
SELECT 
    c.id as client_id,
    COALESCE(c.business_name, 'Sin Nombre') as business_name,
    COUNT(cal.id) as total_calls,
    SUM(CASE WHEN cal.duration IS NOT NULL THEN (substring(cal.duration from '[0-9]+')::int) ELSE 5 END) as total_minutes,
    MAX(cal.created_at) as last_call
FROM clients c
LEFT JOIN calls cal ON c.id = cal.client_id
GROUP BY c.id, c.business_name;
