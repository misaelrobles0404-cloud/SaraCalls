-- PARTE 1: Añadir columna para vincular con Supabase Auth
ALTER TABLE clients ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- PARTE 2: Crear un cliente de prueba si no existe (opcional, para testeo)
-- Nota: En producción, tú crearás el usuario en Auth y luego pondrás su ID aquí.
INSERT INTO clients (business_name, industry) 
VALUES ('Empresa Demo', 'tech')
ON CONFLICT DO NOTHING;

-- COMENTARIO DE AYUDA:
-- Una vez que crees un usuario en Supabase Dashborad > Authentication, 
-- copia su "User UID" y ejecutas este comando:
-- UPDATE clients SET auth_user_id = 'AQUÍ_EL_ID_DE_SUPABASE' WHERE business_name = 'Empresa Demo';
