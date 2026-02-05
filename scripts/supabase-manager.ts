
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Variables de entorno de Supabase faltantes.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const args = process.argv.slice(2);
    console.log('DEBUG ARGS:', args);
    const command = args[0];

    if (!command) {
        console.log(`
Uso: npx tsx scripts/supabase-manager.ts <comando>

Comandos disponibles:
  check-health    : Verifica la conexión y permisos básicos.
  list-clients    : Lista los clientes registrados.
  register-client <email> <password> <business_name> : Registra un nuevo cliente (Auth + DB).
  link-client <email> <password> <agent_id> : Vincula un Agent ID existente a un usuario.
  verify-link <agent_id> : Verifica si un agente tiene usuario vinculado.
  delete-client <email> : Elimina un cliente y su usuario Auth.
  list-calls      : Muestra las últimas 10 llamadas registradas.
  count-calls     : Muestra el número total de llamadas.
  list-leads      : Muestra los últimos 10 leads.
  check-schema    : Verifica la existencia de las tablas principales.
    `);
        return;
    }

    try {
        switch (command) {
            case 'check-health':
                await checkHealth();
                break;
            case 'list-clients':
                await listClients();
                break;
            case 'register-client':
                const [email, password, ...nameParts] = args.slice(1);
                const businessName = nameParts.join(' ');
                if (!email || !password || !businessName) {
                    console.error('Uso: register-client <email> <password> <business_name>');
                    return;
                }
                await registerClient(email, password, businessName);
                break;
            case 'link-client':
                const [linkEmail, linkPass, agentId] = args.slice(1);
                if (!linkEmail || !linkPass || !agentId) {
                    console.error('Uso: link-client <email> <password> <agent_id>');
                    return;
                }
                await linkClient(linkEmail, linkPass, agentId);
                break;
            case 'verify-link':
                const [vAgentId] = args.slice(1);
                if (!vAgentId) {
                    console.error('Uso: verify-link <agent_id>');
                    return;
                }
                await verifyLink(vAgentId);
                break;
            case 'delete-client':
                const [delEmail] = args.slice(1);
                if (!delEmail) {
                    console.error('Uso: delete-client <email>');
                    return;
                }
                await deleteClient(delEmail);
                break;
            case 'list-calls':
                await listCalls();
                break;
            case 'count-calls':
                await countCalls();
                break;
            case 'list-leads':
                await listLeads();
                break;
            case 'check-schema':
                await checkSchema();
                break;
            default:
                console.error(`Comando desconocido: ${command}`);
        }
    } catch (error: any) {
        console.error('Error ejecutando comando:', error.message);
    }
}

async function checkHealth() {
    console.log('Verificando conexión...');
    const { count, error } = await supabase.from('calls').select('*', { count: 'exact', head: true });
    if (error) {
        console.error('❌ Error conectando a tabla "calls":', error.message);
    } else {
        console.log('✅ Conexión exitosa.');
        console.log(`📝 Registros en "calls": ${count}`);
    }
}

async function listCalls() {
    console.log('--- Últimas 10 Llamadas ---');
    const { data, error } = await supabase
        .from('calls')
        .select('id, customer_phone, duration, sentiment, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
        console.log('No se encontraron llamadas.');
        return;
    }

    console.table(data);
}

async function countCalls() {
    const { count, error } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true });

    if (error) throw error;
    console.log(`Total de llamadas: ${count}`);
}

async function listLeads() {
    console.log('--- Últimos 10 Leads ---');
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
        console.log('No se encontraron leads.');
        return;
    }

    console.table(data);
}


async function checkSchema() {
    console.log('--- Verificación de Esquema ---');
    const tables = ['clients', 'calls', 'leads', 'appointments'];
    let allOk = true;

    for (const table of tables) {
        process.stdout.write(`Verificando tabla '${table}'... `);
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`❌ ERROR: ${error.message}`);
            allOk = false;
        } else {
            console.log(`✅ OK (Filas: ${count})`);
        }
    }

    if (allOk) {
        console.log('\n✅ Todas las tablas principales existen y son accesibles.');
    } else {
        console.log('\n⚠️ ALGUNAS TABLAS FALTAN O TIENEN ERRORES.');
    }
}


async function listClients() {
    console.log('--- Clientes Registrados ---');
    const { data, error } = await supabase.from('clients').select('*');
    if (error) {
        console.error('Error:', error.message);
        return;
    }
    if (data.length === 0) {
        console.log('No hay clientes registrados.');
    } else {
        console.table(data);
    }
}


async function registerClient(email: string, password: string, businessName: string) {
    console.log(`Registrando cliente: ${businessName} (${email})...`);

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (authError) {
        console.error('❌ Error creando usuario Auth:', authError.message);
        return;
    }

    const userId = authData.user.id;
    process.stdout.write(`✅ Usuario Auth creado. ID: ${userId}\n`);

    // 2. Create Client Record
    const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([{
            business_name: businessName,
            auth_user_id: userId,
            industry: 'restaurant'
        }])
        .select()
        .single();

    if (clientError) {
        console.error('❌ Error creando ficha de cliente:', clientError.message);
        return;
    }

    console.log(`✅ Cliente registrado exitosamente en base de datos.`);
    console.log(`   ID Cliente: ${clientData.id}`);
    console.log(`   ID Usuario: ${userId}\n`);
    console.log(`¡Listo! El cliente puede iniciar sesión con ${email}`);
}

async function deleteClient(email: string) {
    console.log(`Buscando usuario para eliminar: ${email}...`);

    // 1. Find Auth User
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('❌ Error listando usuarios:', listError.message);
        return;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        console.error('❌ Usuario no encontrado en Auth.');
        return;
    }

    const userId = user.id;
    console.log(`✅ Usuario encontrado. ID: ${userId}`);

    // 2. Delete DB Record
    const { error: dbError } = await supabase
        .from('clients')
        .delete()
        .eq('auth_user_id', userId);

    if (dbError) {
        console.error('❌ Error eliminando ficha de cliente (DB):', dbError.message);
    } else {
        console.log('✅ Ficha de cliente eliminada de la base de datos.');
    }

    // 3. Delete Auth User
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
        console.error('❌ Error eliminando usuario Auth:', authError.message);
    } else {
        console.log('✅ Usuario Auth eliminado permanentemente.');
    }
}



async function linkClient(email: string, password: string, agentId: string) {
    console.log(`Vinculando ${email} con Agente ${agentId}...`);

    // 1. Check if Agent exists
    const { data: client, error: findError } = await supabase
        .from('clients')
        .select('*')
        .eq('retell_agent_id', agentId)
        .single();

    if (findError || !client) {
        console.error('❌ Error: No se encontró un cliente con ese Agent ID.', findError?.message);
        return;
    }
    console.log(`✅ Agente encontrado: ${client.business_name || 'Sin Nombre'} (ID: ${client.id})`);

    // 2. Create or Get Auth User
    let userId;
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (createError) {
        if (createError.message.includes('already registered')) {
            console.log('ℹ️ El usuario ya existe, obteniendo ID...');
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const existingUser = users.find(u => u.email === email);
            if (!existingUser) {
                console.error('❌ Error: Usuario existe pero no se pudo encontrar.');
                return;
            }
            userId = existingUser.id;
        } else {
            console.error('❌ Error creando usuario Auth:', createError.message);
            return;
        }
    } else {
        userId = authData.user.id;
        console.log(`✅ Usuario Auth creado. ID: ${userId}`);
    }

    // 3. Link records
    const { error: updateError } = await supabase
        .from('clients')
        .update({ auth_user_id: userId })
        .eq('id', client.id);

    if (updateError) {
        console.error('❌ Error vinculando registros:', updateError.message);
    } else {
        console.log(`✅ ¡VINCULACIÓN EXITOSA!`);
        console.log(`El cliente con Agent ID ${agentId} ahora pertenece a ${email}`);
    }
}



async function verifyLink(agentId: string) {
    console.log(`Verificando link para agente: ${agentId}...`);
    const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('retell_agent_id', agentId)
        .single();

    if (error || !client) {
        console.error('❌ Cliente no encontrado.');
        return;
    }

    console.log(`Cliente: ${client.business_name}`);
    console.log(`Auth User ID: ${client.auth_user_id}`);

    if (client.auth_user_id) {
        console.log('✅ ESTÁ VINCULADO.');
    } else {
        console.log('❌ NO ESTÁ VINCULADO (auth_user_id es NULL).');
    }
}

main();
