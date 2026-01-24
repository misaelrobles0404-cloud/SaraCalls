-- Tabla de Pedidos (Restaurante)
-- Ejecuta esto en el Editor SQL de Supabase

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    order_number SERIAL,
    customer_name TEXT,
    customer_phone TEXT,
    items TEXT, -- Detalle de los productos pedidos
    total_price DECIMAL(10,2),
    status TEXT DEFAULT 'Pendiente', -- Pendiente, Preparando, Listo, Entregado
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Realtime para la tabla de pedidos
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Políticas RLS (Opcional, según tu configuración)
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Clientes pueden ver sus propios pedidos" ON orders FOR SELECT USING (auth.uid() IN (SELECT auth_user_id FROM clients WHERE id = client_id));
