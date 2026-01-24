-- SARA CALLS AI - PATCH FINAL DE PRODUCCIÓN (CORREGIDO)
-- COPIAR Y PEGAR EN EL SQL EDITOR DE SUPABASE

-- 1. Soporte para Personalización de Logo en Clientes
ALTER TABLE clients ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Tabla para Prospectos de la Landing Page (Agencia)
CREATE TABLE IF NOT EXISTS sales_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    business_name TEXT,
    industry TEXT,
    team_size TEXT,
    country TEXT,
    city TEXT,
    message TEXT,
    status TEXT DEFAULT 'Nuevo', -- Nuevo, Contactado, Cerrado
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar Realtime para los Prospectos de Agencia
-- El comando puede fallar si ya existe, por eso lo envolvemos en un bloque seguro o simplemente ignoramos el error.
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'sales_leads'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE sales_leads;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignorar si la publicación no existe o hay algún conflicto Menor
END $$;

-- 4. Actualizar Vista de Consumo (Primero borramos para permitir cambio de estructura)
DROP VIEW IF EXISTS agency_client_usage;

CREATE VIEW agency_client_usage AS
SELECT 
    c.id as client_id,
    COALESCE(c.business_name, 'Sin Nombre') as business_name,
    c.industry,
    c.logo_url,
    COUNT(cal.id) as total_calls,
    -- Suma de minutos (estimación si no existe columna duration_seconds)
    COALESCE(SUM(CASE 
        WHEN cal.duration ~ '^[0-9]+$' THEN cal.duration::int 
        ELSE 5 
    END), 0) as total_minutes,
    MAX(cal.created_at) as last_call
FROM clients c
LEFT JOIN calls cal ON c.id = cal.client_id
GROUP BY c.id, c.business_name, c.industry, c.logo_url;
