-- ACTIVA EL TIEMPO REAL PARA LA TABLA DE PEDIDOS
-- Ejecuta este comando en el SQL Editor de tu Supabase Dashboard

-- 1. Asegurar que la tabla esté en la publicación de realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 2. Asegurar que la réplica de Postgres esté activa para enviar cambios
ALTER TABLE orders REPLICA IDENTITY FULL;

-- NOTA: Si recibes un error diciendo que ya existe en la publicación,
-- puedes ignorarlo, el punto importante es el REPLICA IDENTITY FULL.
