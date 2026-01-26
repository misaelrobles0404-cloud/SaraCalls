-- Tablas para SaraCalls.ai

-- 1. Tabla de Usuarios/Clientes (Empresas que contratan el servicio)
-- Nota: Supabase Auth ya maneja usuarios, esta tabla es para perfil extendido si es necesario.
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL,
    industry TEXT,
    retell_agent_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Llamadas (Registros de Retell AI)
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    retell_call_id TEXT UNIQUE,
    customer_name TEXT,
    customer_phone TEXT,
    duration TEXT,
    sentiment TEXT,
    transcript TEXT,
    recording_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Leads (Contactos capturados)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'Nuevo', -- Nuevo, Contactado, Cerrado
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Citas (Agendadas via Retell/Make)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_phone TEXT,
    service TEXT,
    appointment_date TIMESTAMPTZ,
    status TEXT DEFAULT 'Confirmada',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activar Realtime para actualizaciones automáticas en el Dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE calls;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
