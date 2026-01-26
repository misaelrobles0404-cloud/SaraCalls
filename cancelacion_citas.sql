-- Optimización para Cancelaciones de Citas
-- Ejecuta esto en el SQL Editor de Supabase

-- Crear un índice para búsquedas rápidas por teléfono y cliente
CREATE INDEX IF NOT EXISTS idx_appointments_phone_client 
ON appointments(customer_phone, client_id, status);

-- (Opcional) Si quieres que se guarde un registro de cuándo se canceló
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Trigger para guardar la fecha de cancelación automáticamente cuando el estado cambie
CREATE OR REPLACE FUNCTION track_cancellation_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Cancelada' AND OLD.status <> 'Cancelada' THEN
        NEW.cancelled_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_track_cancellation ON appointments;
CREATE TRIGGER trg_track_cancellation
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION track_cancellation_date();
