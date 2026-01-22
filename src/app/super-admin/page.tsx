"use client";

import {
    LayoutDashboard,
    Phone,
    Users,
    Settings,
    PhoneCall,
    UserPlus,
    Clock,
    Zap,
    BotMessageSquare,
    LogOut,
    Eye,
    Save,
    Search,
    TrendingUp,
    ShieldCheck,
    MessageSquare
} from "lucide-react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SuperAdminDashboard() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'sales' | 'settings'>('overview');
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<any[]>([]);
    const [salesLeads, setSalesLeads] = useState<any[]>([]);
    const [globalStats, setGlobalStats] = useState({
        totalCalls: 0,
        totalLeads: 0,
        totalMinutes: 0,
        activeClients: 0
    });

    // Configuración Global
    const [apiKey, setApiKey] = useState("");
    const [webhookUrl, setWebhookUrl] = useState("");

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            setLoading(true);
            try {
                const { supabase } = await import("@/lib/supabase");

                // 1. Verificar Sesión
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    console.log("Sesión no detectada aún. Esperando...");
                    return;
                }

                const isAdmin = session.user.email === "misaerobles0404@gmail.com" ||
                    session.user.email === "misaelrobles0404@gmail.com";

                if (!isAdmin) {
                    console.error("Acceso denegado: No es administrador");
                    window.location.href = "/admin";
                    return;
                }

                setIsAuthorized(true);

                // 2. Cargar Clientes y Estadísticas Usando la Vista
                const { data: clientData } = await supabase.from('agency_client_usage').select('*');
                const { data: leadsData } = await supabase.from('leads').select('id');
                const { data: salesLeadsData } = await supabase.from('sales_leads').select('*').order('created_at', { ascending: false });
                const { data: globalSettings } = await supabase.from('agency_settings').select('*').single();

                if (salesLeadsData) {
                    setSalesLeads(salesLeadsData);
                }

                if (clientData) {
                    setClients(clientData);
                    const calls = clientData.reduce((acc: number, curr: any) => acc + (curr.total_calls || 0), 0);
                    const mins = clientData.reduce((acc: number, curr: any) => acc + (curr.total_minutes || 0), 0);

                    setGlobalStats({
                        totalCalls: calls,
                        totalLeads: leadsData?.length || 0,
                        totalMinutes: mins,
                        activeClients: clientData.length
                    });
                }

                if (globalSettings) {
                    setApiKey(globalSettings.retell_api_key || "");
                    setWebhookUrl(globalSettings.make_webhook_url || "");
                }

            } catch (error) {
                console.error("Error en Super Admin Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetch();

        // 3. Suscripción Realtime para Prospectos
        const setupRealtime = async () => {
            const { supabase } = await import("@/lib/supabase");
            const channel = supabase
                .channel('sales_leads_changes')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'sales_leads' },
                    (payload) => {
                        console.log('Nuevo lead recibido en tiempo real:', payload.new);
                        setSalesLeads(prev => [payload.new, ...prev]);
                        setGlobalStats(prev => ({ ...prev, totalLeads: prev.totalLeads + 1 }));

                        // Opcional: Sonido sutil o notificación visual fuerte aquí
                        if (typeof window !== 'undefined') {
                            const audio = new Audio('/notification.mp3'); // Asumiendo que existiera
                            audio.play().catch(() => { });
                        }
                    }
                )
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'sales_leads' },
                    (payload) => {
                        setSalesLeads(prev => prev.map(lead => lead.id === payload.new.id ? payload.new : lead));
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        const cleanup = setupRealtime();
        return () => { cleanup.then(c => c && c()); };
    }, [router]);

    const updateLeadStatus = async (leadId: string, newStatus: string) => {
        try {
            const { supabase } = await import("@/lib/supabase");
            const { error } = await supabase
                .from('sales_leads')
                .update({ status: newStatus })
                .eq('id', leadId);

            if (error) throw error;
        } catch (error) {
            console.error("Error actualizando estado:", error);
            alert("Error al actualizar el estado");
        }
    };

    const handleSaveSettings = async () => {
        const { supabase } = await import("@/lib/supabase");
        const { error } = await supabase
            .from('agency_settings')
            .update({ retell_api_key: apiKey, make_webhook_url: webhookUrl })
            .eq('id', '00000000-0000-0000-0000-000000000000');

        if (!error) {
            alert("Configuración guardada correctamente");
        } else {
            alert("Error al guardar: " + error.message);
        }
    };

    const handleLogout = async () => {
        const { supabase } = await import("@/lib/supabase");
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (!isAuthorized && !loading) return null;

    return (
        <div className="bg-[#050505] min-h-screen flex w-full font-sans text-white selection:bg-[#FD7202]/30">
            {/* Sidebar Super Admin */}
            <aside className="w-64 border-r border-white/10 hidden lg:flex flex-col p-6 fixed h-full bg-black/40 backdrop-blur-3xl z-20">
                <div className="flex items-center gap-3 mb-10 px-2 transition-transform hover:scale-105 duration-300">
                    <BotMessageSquare className="text-[#FD7202] w-10 h-10 drop-shadow-[0_0_12px_rgba(253,114,2,0.6)]" />
                    <div>
                        <span className="text-xl font-black tracking-tight block leading-none">SaraCalls.<span className="text-[#FD7202]">ai</span></span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Agency Master</span>
                    </div>
                </div>

                <nav className="space-y-1 flex-grow">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Consumo Global' },
                        { id: 'clients', icon: Users, label: 'Mis Clientes' },
                        { id: 'sales', icon: UserPlus, label: 'Prospectos Web' },
                        { id: 'settings', icon: Settings, label: 'Configuración' }
                    ].map((item: any) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === item.id ? 'bg-[#FD7202]/10 text-[#FD7202] font-semibold border border-[#FD7202]/20 shadow-[0_0_20px_rgba(253,114,2,0.1)]' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}`}
                        >
                            <item.icon size={18} className={activeTab === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm"
                >
                    <LogOut size={18} /> Cerrar Sesión
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-grow lg:ml-64 p-4 lg:p-10 relative overflow-x-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FD7202]/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>

                <header className="mb-10 flex justify-between items-center glass p-6 rounded-[28px] border border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center gap-4">
                        <BotMessageSquare className="lg:hidden text-[#FD7202] w-10 h-10 drop-shadow-[0_0_8px_rgba(253,114,2,0.5)]" />
                        <div>
                            <h1 className="text-xl lg:text-3xl font-black uppercase italic tracking-tight">Gestión de Agencia</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#FD7202] animate-pulse"></span>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Panel Maestro • Acceso Restringido</p>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                        <ShieldCheck className="text-green-500" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Misael Robles</span>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Minutos Totales', value: `${globalStats.totalMinutes}m`, icon: Clock, color: 'orange' },
                                    { label: 'Llamadas Agencia', value: globalStats.totalCalls, icon: PhoneCall, color: 'blue' },
                                    { label: 'Leads Capturados', value: globalStats.totalLeads, icon: UserPlus, color: 'green' },
                                    { label: 'Clientes Activos', value: globalStats.activeClients, icon: Zap, color: 'purple' }
                                ].map((stat, i) => (
                                    <div key={i} className="group relative p-8 rounded-[32px] border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-500 hover:ring-1 hover:ring-[#FD7202]/30 overflow-hidden">
                                        <div className={`w-14 h-14 rounded-2xl bg-${stat.color === 'orange' ? '[#FD7202]/10' : stat.color + '-500/10'} flex items-center justify-center mb-6 border border-${stat.color === 'orange' ? '[#FD7202]/20' : stat.color + '-500/20'} transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(253,114,2,0.2)]`}>
                                            <stat.icon size={28} className={`transition-all duration-300 group-hover:neon-text-${stat.color === 'blue' ? 'blue' : (stat.color === 'green' ? 'green' : (stat.color === 'purple' ? 'purple' : 'orange'))}`} />
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                        <h3 className="text-3xl font-black mt-2 italic tabular-nums">{stat.value}</h3>
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-[#FD7202]/5 blur-[30px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-[#FD7202]/10 transition-all duration-500"></div>
                                    </div>
                                ))}
                            </div>

                            <div className="glass p-8 rounded-[36px] bg-white/[0.02] border border-white/5 h-[400px]">
                                <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-[#FD7202]" /> Consumo por Cliente
                                </h2>
                                <div className="space-y-6 overflow-y-auto max-h-[280px] pr-2">
                                    {clients.map((client, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between items-center text-xs uppercase font-bold tracking-wider">
                                                <span>{client.business_name}</span>
                                                <span className="text-[#FD7202]">{client.total_minutes} mins</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
                                                    style={{ width: `${Math.min((client.total_minutes / (globalStats.totalMinutes || 1)) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'clients' && (
                        <motion.div
                            key="clients"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass rounded-[36px] bg-white/[0.02] border border-white/5 p-8"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-black uppercase italic">Directorio de Clientes</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input type="text" placeholder="Buscar Cliente..." className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-[#FD7202]" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                                            <th className="pb-4 px-4">Empresa</th>
                                            <th className="pb-4 px-4">Llamadas</th>
                                            <th className="pb-4 px-4">Última Actividad</th>
                                            <th className="pb-4 px-4">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {clients.map((client, idx) => (
                                            <tr key={idx} className="hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer border-l-2 border-transparent hover:border-[#FD7202]">
                                                <td className="py-6 px-4">
                                                    <div className="font-bold text-white uppercase tracking-tight text-lg group-hover:text-[#FD7202] transition-colors">{client.business_name}</div>
                                                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.2em]">{client.client_id.slice(0, 8)}...</div>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <span className="font-black text-xl text-[#FD7202] tabular-nums drop-shadow-[0_0_8px_rgba(253,114,2,0.2)]">{client.total_calls}</span>
                                                    <span className="text-[10px] text-gray-500 ml-2 font-bold uppercase">Llamadas</span>
                                                </td>
                                                <td className="py-6 px-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                    {client.last_call ? new Date(client.last_call).toLocaleDateString() : 'Sin actividad'}
                                                </td>
                                                <td className="py-5 px-4 text-right">
                                                    <button className="px-4 py-2 bg-white/5 hover:bg-[#FD7202] rounded-xl text-gray-400 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest inline-flex items-center gap-2">
                                                        <Eye size={14} /> Gestionar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'sales' && (
                        <motion.div
                            key="sales"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass rounded-[36px] bg-white/[0.02] border border-white/5 p-8"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-black uppercase italic">Prospectos Web (Inscripciones)</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                                            <th className="pb-4 px-4">Fecha</th>
                                            <th className="pb-4 px-4">Interesado</th>
                                            <th className="pb-4 px-4">Empresa / Industria</th>
                                            <th className="pb-4 px-4">Contacto</th>
                                            <th className="pb-4 px-4 text-right">Mensaje</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {salesLeads.length === 0 ? (
                                            <tr><td colSpan={5} className="py-10 text-center text-gray-500 uppercase text-xs font-bold tracking-widest">No hay prospectos aún</td></tr>
                                        ) : salesLeads.map((lead, idx) => (
                                            <tr key={idx} className={`hover:bg-white/[0.04] transition-all duration-300 group border-l-2 border-transparent ${lead.status === 'Nuevo' ? 'border-orange-500 bg-orange-500/5' : 'hover:border-[#FD7202]'}`}>
                                                <td className="py-6 px-4 text-[10px] text-gray-500 font-bold uppercase tabular-nums">
                                                    {new Date(lead.created_at).toLocaleDateString()}
                                                    {lead.status === 'Nuevo' && (
                                                        <span className="block text-[8px] text-orange-500 animate-pulse font-black mt-1">¡NUEVO!</span>
                                                    )}
                                                </td>
                                                <td className="py-6 px-4">
                                                    <div className="font-bold text-white uppercase tracking-tight text-lg">{lead.full_name}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{lead.team_size || 'Equipo N/A'}</div>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <div className="text-sm font-bold text-gray-200">{lead.business_name || 'Sin Empresa'}</div>
                                                    <div className="text-[10px] text-[#FD7202] font-black uppercase tracking-widest">{lead.industry || 'Genérico'}</div>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="text-sm font-medium text-gray-300">{lead.email}</div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-slate-500">{lead.phone}</span>
                                                            <a
                                                                href={`https://wa.me/${lead.phone?.replace(/\D/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-lg transition-all"
                                                                title="Contactar por WhatsApp"
                                                            >
                                                                <MessageSquare size={14} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4 text-right">
                                                    <div className="flex flex-col items-end gap-3">
                                                        <select
                                                            value={lead.status || 'Nuevo'}
                                                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                            className={`bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] uppercase font-bold outline-none transition-colors ${lead.status === 'Cerrado' ? 'text-green-500 border-green-500/30' :
                                                                    lead.status === 'Negociación' ? 'text-blue-500 border-blue-500/30' :
                                                                        lead.status === 'Contactado' ? 'text-yellow-500 border-yellow-500/30' : 'text-orange-500 border-orange-500/30'
                                                                }`}
                                                        >
                                                            <option value="Nuevo">Nuevo</option>
                                                            <option value="Contactado">Contactado</option>
                                                            <option value="Negociación">Negociación</option>
                                                            <option value="Cerrado">Venta Cerrada</option>
                                                        </select>
                                                        <p className="text-[11px] text-slate-400 italic max-w-[200px] line-clamp-2">{lead.message || 'Sin mensaje adicional'}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="glass p-8 rounded-[40px] bg-white/[0.02] border border-white/10 space-y-8">
                                <div className="text-center">
                                    <h2 className="text-3xl font-black uppercase italic mb-2 text-[#FD7202]">Configuración Global</h2>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Afecta a todos los clientes de la agencia</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Retell AI Master API Key</label>
                                        <input
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="sk_..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-[#FD7202] transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Master Webhook URL (Make.com)</label>
                                        <input
                                            type="text"
                                            value={webhookUrl}
                                            onChange={(e) => setWebhookUrl(e.target.value)}
                                            placeholder="https://hook.make.com/..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-[#FD7202] transition-all outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSaveSettings}
                                        className="w-full bg-[#FD7202] hover:bg-orange-600 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(253,114,2,0.2)]"
                                    >
                                        <Save size={18} /> Guardar Configuración Agencia
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
