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
    MapPin,
    MessageSquare,
    LogOut
} from "lucide-react";
import { SuperAdminSidebar } from "@/components/dashboard/SuperAdminSidebar";
import { SuperAdminHeader } from "@/components/dashboard/SuperAdminHeader";
import { SalesLeadCard } from "@/components/dashboard/SalesLeadCard";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
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
    const [acquisitionRate, setAcquisitionRate] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'last' | 'quarter' | 'all'>('all');
    const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
    const [selectedClientHistory, setSelectedClientHistory] = useState<any>(null);
    const [clientHistoryData, setClientHistoryData] = useState<{ calls: any[], leads: any[] }>({ calls: [], leads: [] });
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchClientHistory = async (client: any) => {
        setLoadingHistory(true);
        setSelectedClientHistory(client);
        try {
            const { supabase } = await import("@/lib/supabase");
            const [callsRes, leadsRes] = await Promise.all([
                supabase.from('calls').select('*').eq('client_id', client.client_id).order('created_at', { ascending: false }).limit(10),
                supabase.from('leads').select('*').eq('client_id', client.client_id).order('created_at', { ascending: false }).limit(10)
            ]);
            setClientHistoryData({
                calls: callsRes.data || [],
                leads: leadsRes.data || []
            });
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const sortedSalesLeads = useMemo(() => {
        const statusPriority: Record<string, number> = { 'Nuevo': 0, 'Contactado': 1, 'Cerrado': 2 };

        let filtered = [...salesLeads];

        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

        if (selectedPeriod === 'current') {
            filtered = filtered.filter(l => new Date(l.created_at) >= startOfCurrentMonth);
        } else if (selectedPeriod === 'last') {
            filtered = filtered.filter(l => {
                const d = new Date(l.created_at);
                return d >= startOfLastMonth && d <= endOfLastMonth;
            });
        } else if (selectedPeriod === 'quarter') {
            filtered = filtered.filter(l => new Date(l.created_at) >= threeMonthsAgo);
        }

        return filtered.sort((a, b) => {
            const priorityA = statusPriority[a.status] ?? 3;
            const priorityB = statusPriority[b.status] ?? 3;
            if (priorityA !== priorityB) return priorityA - priorityB;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [salesLeads, selectedPeriod]);

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
                    // Ordenar: Nuevo (0) > Contactado (1) > Cerrado (2) > Otros (3)
                    const statusPriority: Record<string, number> = { 'Nuevo': 0, 'Contactado': 1, 'Cerrado': 2 };
                    const sortedLeads = [...salesLeadsData].sort((a, b) => {
                        const priorityA = statusPriority[a.status] ?? 3;
                        const priorityB = statusPriority[b.status] ?? 3;
                        if (priorityA !== priorityB) return priorityA - priorityB;
                        // Si tienen la misma prioridad, el más reciente primero
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    });

                    setSalesLeads(sortedLeads);

                    // Calcular Tasa de Adquisición (Mes actual vs Mes anterior)
                    const now = new Date();
                    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

                    const leadsLast30 = salesLeadsData.filter(l => new Date(l.created_at) > thirtyDaysAgo).length;
                    const leadsPrev30 = salesLeadsData.filter(l => {
                        const d = new Date(l.created_at);
                        return d > sixtyDaysAgo && d <= thirtyDaysAgo;
                    }).length;

                    let rate = 100;
                    if (leadsPrev30 > 0) {
                        rate = ((leadsLast30 - leadsPrev30) / leadsPrev30) * 100;
                    } else if (leadsLast30 === 0) {
                        rate = 0;
                    }

                    setAcquisitionRate(Math.round(rate));
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
                    { event: '*', schema: 'public', table: 'sales_leads' },
                    (payload) => {
                        console.log('Cambio en leads detectado:', payload);
                        if (payload.eventType === 'INSERT') {
                            setSalesLeads(prev => [payload.new, ...prev]);
                            setGlobalStats(prev => ({ ...prev, totalLeads: prev.totalLeads + 1 }));
                        } else if (payload.eventType === 'UPDATE') {
                            setSalesLeads(prev => prev.map(lead =>
                                lead.id === payload.new.id ? payload.new : lead
                            ));
                        }
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

    // Efecto para Calcular Tasa de Adquisición en Tiempo Real
    useEffect(() => {
        if (salesLeads.length > 0) {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

            const leadsLast30 = salesLeads.filter(l => new Date(l.created_at) > thirtyDaysAgo).length;
            const leadsPrev30 = salesLeads.filter(l => {
                const d = new Date(l.created_at);
                return d > sixtyDaysAgo && d <= thirtyDaysAgo;
            }).length;

            let rate = 100;
            if (leadsPrev30 > 0) {
                rate = ((leadsLast30 - leadsPrev30) / leadsPrev30) * 100;
            } else if (leadsLast30 === 0) {
                rate = 0;
            }

            setAcquisitionRate(Math.round(rate));
        }
    }, [salesLeads]);

    const updateLeadStatus = async (leadId: string, newStatus: string) => {
        // Actualización optimista (feedback inmediato)
        const previousLeads = [...salesLeads];
        setSalesLeads(prev => prev.map(lead =>
            lead.id === leadId ? { ...lead, status: newStatus } : lead
        ));

        try {
            const { supabase } = await import("@/lib/supabase");
            const { data, error } = await supabase
                .from('sales_leads')
                .update({ status: newStatus })
                .eq('id', leadId)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) throw new Error("No se pudo encontrar el registro.");

        } catch (error: any) {
            console.error("Error actualizando estado:", error);
            // Revertir si hay error
            setSalesLeads(previousLeads);
        }
    };

    const handleDeleteLead = async (leadId: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este prospecto? Esta acción no se puede deshacer.")) return;

        try {
            const { supabase } = await import("@/lib/supabase");
            const { error } = await supabase
                .from('sales_leads')
                .delete()
                .eq('id', leadId);

            if (error) throw error;
            setSalesLeads(prev => prev.filter(l => l.id !== leadId));
            setGlobalStats(prev => ({ ...prev, totalLeads: prev.totalLeads - 1 }));
        } catch (error: any) {
            console.error("Error deleting lead:", error);
            alert("Error al eliminar el prospecto.");
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

    const handleDeleteSalesLeadsByMonth = async (monthsAgo: number) => {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() - monthsAgo);
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString();
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const monthName = targetDate.toLocaleString('es-ES', { month: 'long' });

        if (!confirm(`¿Estás seguro de que quieres borrar TODOS los prospectos de ${monthName}? Esta acción no se puede deshacer.`)) return;

        try {
            const { supabase } = await import("@/lib/supabase");
            const { error } = await supabase
                .from('sales_leads')
                .delete()
                .gte('created_at', startOfMonth)
                .lte('created_at', endOfMonth);

            if (error) throw error;
            alert(`Prospectos de ${monthName} eliminados con éxito.`);
            window.location.reload();
        } catch (error: any) {
            console.error("Error delete leads:", error);
            alert("Error al eliminar: " + error.message);
        }
    };

    const handleDeleteCallsByMonth = async (monthsAgo: number) => {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() - monthsAgo);
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString();
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const monthName = targetDate.toLocaleString('es-ES', { month: 'long' });

        if (!confirm(`¿Estás seguro de que quieres borrar TODAS las llamadas de ${monthName}? Esta acción no se puede deshacer.`)) return;

        try {
            const { supabase } = await import("@/lib/supabase");
            const { error } = await supabase
                .from('calls')
                .delete()
                .gte('created_at', startOfMonth)
                .lte('created_at', endOfMonth);

            if (error) throw error;
            alert(`Llamadas de ${monthName} eliminadas con éxito.`);
            window.location.reload();
        } catch (error: any) {
            console.error("Error delete calls:", error);
            alert("Error al eliminar: " + error.message);
        }
    };

    if (!isAuthorized && !loading) return null;

    return (
        <div className="bg-[#050505] min-h-screen flex w-full font-sans text-white selection:bg-[#FD7202]/30">
            {/* Sidebar Super Admin */}
            <SuperAdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="flex-grow lg:ml-64 p-4 lg:p-10 relative overflow-x-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FD7202]/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>

                <SuperAdminHeader />

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
                                                    <button
                                                        onClick={() => fetchClientHistory(client)}
                                                        className="px-4 py-2 bg-white/5 hover:bg-[#FD7202] rounded-xl text-gray-400 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest inline-flex items-center gap-2"
                                                    >
                                                        <Eye size={14} /> Historial
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
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-white/5 pb-8">
                                <div>
                                    <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                                        <UserPlus className="text-[#FD7202]" />
                                        Prospectos <span className="text-[#FD7202]">Web</span>
                                    </h2>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Gestión de nuevos ingresos ({salesLeads.length})</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex bg-white/5 p-1 rounded-xl border border-white/10">
                                        <div className="px-4 py-2 flex items-center gap-2">
                                            <TrendingUp size={16} className={acquisitionRate >= 0 ? "text-green-400" : "text-red-400"} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${acquisitionRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>Tasa Adquisición: {acquisitionRate > 0 ? '+' : ''}{acquisitionRate}%</span>
                                        </div>
                                    </div>

                                    {/* Period Selector (Hamburguesa/Filtro) */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
                                            className="bg-[#FD7202] hover:bg-orange-600 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_4px_15px_rgba(253,114,2,0.3)] transition-all active:scale-95"
                                        >
                                            <Filter size={14} className="text-white" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white">
                                                {selectedPeriod === 'all' ? 'Todo' : selectedPeriod === 'current' ? 'Este Mes' : selectedPeriod === 'last' ? 'Mes Pasado' : 'Últimos 3m'}
                                            </span>
                                            <ChevronDown size={14} className={`text-white transition-transform ${isPeriodMenuOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isPeriodMenuOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-[60]" onClick={() => setIsPeriodMenuOpen(false)}></div>
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-2 z-[70] backdrop-blur-xl"
                                                    >
                                                        {[
                                                            { id: 'all', label: 'Todo el Historial' },
                                                            { id: 'current', label: 'Este Mes' },
                                                            { id: 'last', label: 'Mes Pasado' },
                                                            { id: 'quarter', label: 'Últimos 3 Meses' }
                                                        ].map((item) => (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => {
                                                                    setSelectedPeriod(item.id as any);
                                                                    setIsPeriodMenuOpen(false);
                                                                }}
                                                                className={`w-full flex items-center px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedPeriod === item.id ? 'bg-[#FD7202] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                                            >
                                                                {item.label}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {sortedSalesLeads.length === 0 ? (
                                    <div className="py-20 text-center glass rounded-[32px] border border-white/5 bg-white/[0.01]">
                                        <Search size={48} className="mx-auto text-gray-700 mb-4 opacity-20" />
                                        <p className="text-gray-500 uppercase text-xs font-bold tracking-widest">No hay prospectos en la base de datos</p>
                                    </div>
                                ) : sortedSalesLeads.map((lead, idx) => (
                                    <SalesLeadCard
                                        key={lead.id || idx}
                                        lead={lead}
                                        onUpdateStatus={updateLeadStatus}
                                        onDelete={handleDeleteLead}
                                    />
                                ))}
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

                                    <div className="pt-8 border-t border-white/5">
                                        <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">Documentación y Ayuda</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <a
                                                href="https://github.com/misaelrobles0404-cloud/SaraCalls/blob/main/SARA_MEMORY_GUIDE.md"
                                                target="_blank"
                                                className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center justify-between group transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#FD7202]/10 flex items-center justify-center text-[#FD7202]">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white uppercase tracking-tight">Guía de Memoria de IA</p>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">¿Cómo recuerda Sara a los clientes?</p>
                                                    </div>
                                                </div>
                                                <Eye size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Modal de Historial de Cliente */}
            <AnimatePresence>
                {selectedClientHistory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedClientHistory(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic text-[#FD7202]">{selectedClientHistory.business_name}</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">ID: {selectedClientHistory.client_id}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedClientHistory(null)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-all"
                                >
                                    <LogOut size={20} className="rotate-180" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-8 space-y-10">
                                {loadingHistory ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD7202]"></div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Llamadas Recientes */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                                <Phone size={14} className="text-[#FD7202]" /> Últimas Llamadas (Pedidos)
                                            </h4>
                                            {clientHistoryData.calls.length === 0 ? (
                                                <p className="text-xs text-gray-600 italic">No hay registros de llamadas recientes.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {clientHistoryData.calls.map((call, i) => (
                                                        <div key={i} className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/[0.05] transition-all">
                                                            <div>
                                                                <p className="text-xs font-bold text-white uppercase">{call.customer_name || 'Desconocido'}</p>
                                                                <p className="text-[10px] text-gray-500">{new Date(call.created_at).toLocaleString()}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-[10px] font-black text-[#FD7202] uppercase">{call.duration}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Prospectos Generados */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                                <UserPlus size={14} className="text-[#FD7202]" /> Prospectos Vinculados
                                            </h4>
                                            {clientHistoryData.leads.length === 0 ? (
                                                <p className="text-xs text-gray-600 italic">No hay prospectos vinculados.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {clientHistoryData.leads.map((lead, i) => (
                                                        <div key={i} className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 flex justify-between items-center">
                                                            <div>
                                                                <p className="text-xs font-bold text-white uppercase">{lead.first_name} {lead.last_name}</p>
                                                                <p className="text-[10px] text-gray-500">{lead.email}</p>
                                                            </div>
                                                            <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[8px] font-black uppercase rounded-lg">Activo</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
