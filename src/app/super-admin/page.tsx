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
    Eye,
    Save,
    Search,
    MapPin,
    TrendingUp,
    Filter,
    Trash2,
    AlertCircle,
    MessageSquare,
    LogOut,
    FileText,
    BookOpen,
    X,
    Key,
    UserPlus2,
    Database,
    Smartphone,
    Rocket,
    ChevronDown,
    ArrowRight,
    Utensils,
    Scissors,
    Stethoscope,
    Wine
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
    const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'sales' | 'settings' | 'knowledge' | 'industries'>('overview');
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
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'Todos' | 'Nuevo' | 'Contactado' | 'Cerrado'>('Todos');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

        // 1. Filtro por Estado (Nuevo, Contactado, Cerrado)
        if (statusFilter !== 'Todos') {
            filtered = filtered.filter(l => (l.status || 'Nuevo') === statusFilter);
        }

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
    }, [salesLeads, selectedPeriod, statusFilter]);

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
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            <main className="lg:pl-64 min-h-screen w-full">
                <div className="max-w-7xl mx-auto p-4 lg:p-8">
                    <SuperAdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

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
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(253,114,2,0.2)] ${stat.color === 'orange' ? 'bg-[#FD7202]/10 border-[#FD7202]/20' : `bg-${stat.color}-500/10 border-${stat.color}-500/20`}`}>
                                                <stat.icon size={28} className={`transition-all duration-300 ${stat.color === 'orange' ? 'text-[#FD7202]' : `text-${stat.color}-500`}`} />
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
                                                    <td className="py-5 px-4 text-right flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => fetchClientHistory(client)}
                                                            className="px-4 py-2 bg-white/5 hover:bg-[#FD7202] rounded-xl text-gray-400 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest inline-flex items-center gap-2"
                                                        >
                                                            <Eye size={14} /> Historial
                                                        </button>
                                                        <button
                                                            onClick={() => router.push(`/admin?preview_client_id=${client.client_id}`)}
                                                            className="px-4 py-2 bg-[#FD7202]/10 hover:bg-[#FD7202] text-[#FD7202] hover:text-white rounded-xl transition-all font-black uppercase text-[10px] tracking-widest inline-flex items-center gap-2 border border-[#FD7202]/20"
                                                        >
                                                            <LayoutDashboard size={14} /> Panel
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
                                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 flex-wrap">
                                            {['Todos', 'Nuevo', 'Contactado', 'Cerrado'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => setStatusFilter(status as any)}
                                                    className={`px-3 md:px-4 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${statusFilter === status ? 'bg-[#FD7202] text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>

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
                                    </div>

                                    <div className="pt-8 border-t border-white/5 space-y-6">
                                        <div className="text-center">
                                            <h3 className="text-xl font-black uppercase italic mb-2 text-red-500">Zona de Mantenimiento</h3>
                                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Borrado masivo de datos antiguos</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Llamadas (Historial)</p>
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleDeleteCallsByMonth(1)}
                                                        className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Borrar Mes Pasado
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCallsByMonth(2)}
                                                        className="w-full py-3 bg-red-500/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        Borrar hace 2 Meses
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Prospectos Web (Ingresos)</p>
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleDeleteSalesLeadsByMonth(1)}
                                                        className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Borrar Mes Pasado
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSalesLeadsByMonth(2)}
                                                        className="w-full py-3 bg-red-500/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        Borrar hace 2 Meses
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'knowledge' && (
                            <motion.div
                                key="knowledge"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
                                    <div>
                                        <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                                            <BookOpen className="text-[#FD7202]" />
                                            Knowledge <span className="text-[#FD7202]">Hub</span>
                                        </h2>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Guías maestras y documentación del sistema</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        {
                                            id: 'registration',
                                            title: 'Registro de Clientes',
                                            desc: 'Cómo dar de alta nuevos negocios, usuarios y contraseñas.',
                                            icon: UserPlus2,
                                            color: 'orange'
                                        },
                                        {
                                            id: 'delivery',
                                            title: 'Entrega de Cuenta',
                                            desc: 'Guía paso a paso para entregar el dashboard a tus clientes.',
                                            icon: Key,
                                            color: 'green'
                                        },
                                        {
                                            id: 'memory',
                                            title: 'Memoria de IA',
                                            desc: 'Entiende cómo Sara recuerda el contexto de llamadas pasadas.',
                                            icon: Database,
                                            color: 'blue'
                                        },
                                        {
                                            id: 'strategy',
                                            title: 'Estrategia de Agencia',
                                            desc: 'Cómo escalar y vender SaraCalls a prospectos de alto valor.',
                                            icon: Rocket,
                                            color: 'purple'
                                        },
                                        {
                                            id: 'webhooks',
                                            title: 'Webhook & Retell',
                                            desc: 'Configuración técnica de Make.com y la API de Retell AI.',
                                            icon: Zap,
                                            color: 'purple'
                                        }
                                    ].map((guide) => (
                                        <button
                                            key={guide.id}
                                            onClick={() => {
                                                setSelectedGuide(guide.id);
                                                setShowGuideModal(true);
                                            }}
                                            className="text-left group glass p-8 rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden"
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border group-hover:scale-110 transition-transform ${guide.color === 'orange' ? 'bg-[#FD7202]/10 border-[#FD7202]/20' : `bg-${guide.color}-500/10 border-${guide.color}-500/20`}`}>
                                                <guide.icon size={28} className={guide.color === 'orange' ? 'text-[#FD7202]' : `text-${guide.color}-500`} />
                                            </div>
                                            <h3 className="text-lg font-black uppercase italic text-white mb-2">{guide.title}</h3>
                                            <p className="text-xs text-gray-500 leading-relaxed font-medium mb-6">{guide.desc}</p>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FD7202]">
                                                Ver Guía Completa <Eye size={12} />
                                            </div>
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full -translate-y-12 translate-x-12 group-hover:bg-[#FD7202]/10 transition-colors"></div>
                                        </button>
                                    ))}
                                </div>

                                {/* Info Banner */}
                                <div className="p-8 rounded-[32px] bg-gradient-to-r from-[#FD7202]/10 to-transparent border border-[#FD7202]/20 flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-full bg-[#FD7202] flex items-center justify-center text-white shadow-lg">
                                        <Rocket size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase italic text-white">¿Necesitas algo más complejo?</h4>
                                        <p className="text-xs text-white/60 mt-1">Si tienes dudas sobre el código o la infraestructura, contacta con soporte técnico de SaraCalls.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'industries' && (
                            <motion.div
                                key="industries"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-10"
                            >
                                <div className="text-center max-w-2xl mx-auto">
                                    <h2 className="text-4xl font-black uppercase italic mb-4 text-[#FD7202]">Showroom de Industrias</h2>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                        Previsualiza el dashboard tal como lo vería tu cliente final.
                                        Úsalo para demostraciones en vivo o para validar la experiencia de usuario.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[
                                        {
                                            id: 'restaurant',
                                            name: 'Restaurante Fast-Food',
                                            desc: 'Gestión de pedidos de sushi, ramen y comida rápida con monitor de cocina.',
                                            icon: Utensils,
                                            color: 'orange',
                                            theme: 'from-[#FD7202] to-[#FF9031]'
                                        },
                                        {
                                            id: 'barber',
                                            name: 'Barbería & Spa',
                                            desc: 'Agenda de citas optimizada para servicios de belleza y cuidado personal.',
                                            icon: Scissors,
                                            color: 'amber',
                                            theme: 'from-[#F59E0B] to-[#FBBF24]'
                                        },
                                        {
                                            id: 'clinic',
                                            name: 'Clínica Médica',
                                            desc: 'Panel especializado para consultas dentales, médicas y laboratorios.',
                                            icon: Stethoscope,
                                            color: 'blue',
                                            theme: 'from-[#00F0FF] to-[#38BDF8]'
                                        },
                                        {
                                            id: 'restaurant_res',
                                            name: 'Restaurante Gourmet',
                                            desc: 'Especializado en reservas de mesa y experiencias gastronómicas de lujo.',
                                            icon: Wine,
                                            color: 'purple',
                                            theme: 'from-[#8B5CF6] to-[#A78BFA]'
                                        }
                                    ].map((ind) => (
                                        <button
                                            key={ind.id}
                                            onClick={() => router.push(`/admin?industry=${ind.id}`)}
                                            className="group relative text-left glass p-10 rounded-[48px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 overflow-hidden"
                                        >
                                            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${ind.theme} p-0.5 mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                                <div className="w-full h-full bg-black/40 backdrop-blur-xl rounded-[22px] flex items-center justify-center text-white">
                                                    <ind.icon size={36} />
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-black uppercase italic text-white mb-3">{ind.name}</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed font-medium mb-8 pr-12">{ind.desc}</p>
                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#FD7202]">
                                                Abrir Laboratorio <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                                            </div>

                                            {/* Decorative elements */}
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.01] blur-3xl rounded-full -translate-y-32 translate-x-32 group-hover:bg-white/[0.03] transition-all duration-700"></div>
                                            <div className="absolute bottom-0 left-0 w-1/4 h-1 bg-gradient-to-r from-[#FD7202] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Modal de Guías (Knowledge Hub) */}
                    <AnimatePresence>
                        {showGuideModal && (
                            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 md:p-12 overflow-hidden">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowGuideModal(false)}
                                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                                    className="relative w-full max-w-5xl max-h-[85vh] bg-[#0A0A0A] border border-white/10 rounded-[48px] overflow-hidden flex flex-col shadow-2xl"
                                >
                                    <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-[#FD7202]/10 flex items-center justify-center text-[#FD7202]">
                                                {selectedGuide === 'registration' ? <UserPlus2 size={24} /> :
                                                    selectedGuide === 'memory' ? <Database size={24} /> :
                                                        selectedGuide === 'delivery' ? <Key size={24} /> :
                                                            selectedGuide === 'strategy' ? <Rocket size={24} /> :
                                                                <Zap size={24} />}
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black uppercase italic text-white leading-none">
                                                    {selectedGuide === 'registration' ? 'Guía de Registro' :
                                                        selectedGuide === 'memory' ? 'Memoria de IA' :
                                                            selectedGuide === 'delivery' ? 'Entrega de Cuenta' :
                                                                selectedGuide === 'strategy' ? 'Estrategia Pro' :
                                                                    'Configuración Retell'}
                                                </h3>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">Documentación Técnica SaraCalls</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowGuideModal(false)}
                                            className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-red-500 transition-all text-gray-400 hover:text-white"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="p-10 overflow-y-auto custom-scrollbar flex-grow">
                                        <div className="prose prose-invert prose-orange max-w-none space-y-12">
                                            {selectedGuide === 'registration' && (
                                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <section>
                                                        <h4 className="text-[#FD7202] text-xl font-bold uppercase italic mb-4">1. Crear Usuario en Supabase Auth</h4>
                                                        <p className="text-gray-400 text-sm leading-relaxed mb-4">Para que un cliente tenga su propio panel, primero debes registrar su email en la pestaña de **Authentication** de Supabase.</p>
                                                        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex items-start gap-4">
                                                            <Key className="text-orange-400 shrink-0 mt-1" size={20} />
                                                            <div>
                                                                <p className="text-white font-bold text-xs">¡No olvides copiar el "User ID"! (UUID)</p>
                                                                <p className="text-[10px] text-gray-500 mt-1">Este ID es el puente entre el usuario que hace login y su empresa en la base de datos.</p>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section>
                                                        <h4 className="text-[#FD7202] text-xl font-bold uppercase italic mb-4">2. Vincular en la tabla 'clients'</h4>
                                                        <p className="text-gray-400 text-sm leading-relaxed mb-4">Inserta una nueva fila con los datos del negocio y pega el UUID en el campo `auth_user_id`.</p>
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                                                <p className="text-white font-bold text-xs uppercase mb-2">Campos Obligatorios</p>
                                                                <ul className="text-[10px] text-gray-500 list-disc pl-4 space-y-1 font-mono">
                                                                    <li>business_name: Nombre visible</li>
                                                                    <li>industry: barber / clinic / restaurant</li>
                                                                    <li>auth_user_id: El UUID de Auth</li>
                                                                </ul>
                                                            </div>
                                                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                                                <p className="text-white font-bold text-xs uppercase mb-2">Acceso del Cliente</p>
                                                                <p className="text-[10px] text-gray-500 leading-relaxed">El cliente entrará por `/login`. El sistema detectará su ID y lo redirigirá automáticamente a su propio `/admin` personalizado.</p>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="p-8 rounded-[32px] bg-blue-500/5 border border-blue-500/10 italic text-sm text-blue-100/60">
                                                        "El registro manual garantiza que solo trabajes con clientes validados, manteniendo la seguridad de tu agencia en todo momento."
                                                    </section>
                                                </div>
                                            )}

                                            {selectedGuide === 'delivery' && (
                                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-sm">
                                                    <section>
                                                        <h4 className="text-green-400 text-xl font-bold uppercase italic mb-4">Proceso de Entrega de Cuenta</h4>
                                                        <p className="text-gray-400 leading-relaxed mb-6">Sigue estos pasos para que tu cliente pueda acceder a su dashboard:</p>
                                                        <div className="space-y-4">
                                                            {[
                                                                { t: "Credenciales de Supabase", d: "Crea el usuario en Supabase Auth y asígnale una contraseña temporal." },
                                                                { t: "Vincular UUID", d: "Asegúrate de que el 'auth_user_id' en la tabla 'clients' coincida con su UUID de Supabase." },
                                                                { t: "URL de Acceso", d: "Envía a tu cliente la URL: your-domain.com/login" },
                                                                { t: "Primera Sesión", d: "Recomienda al cliente revisar su configuración de API Master si necesita personalización extra." }
                                                            ].map((step, i) => (
                                                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                                                    <div className="text-green-400 font-black italic">STEP {i + 1}</div>
                                                                    <div>
                                                                        <p className="text-white font-bold text-xs">{step.t}</p>
                                                                        <p className="text-[10px] text-gray-500">{step.d}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </section>
                                                </div>
                                            )}

                                            {selectedGuide === 'memory' && (
                                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-sm">
                                                    <section>
                                                        <h4 className="text-blue-400 text-xl font-bold uppercase italic mb-4">Funcionamiento de la Memoria</h4>
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                                                <p className="text-blue-400 font-bold text-xs uppercase mb-2">Memoria de Corto Plazo</p>
                                                                <p className="text-[10px] text-gray-500 leading-relaxed">Sara mantiene el hilo de la conversación actual. Si un cliente dice "Ese plato que mencionaste", Sara sabe exactamente a qué se refiere.</p>
                                                            </div>
                                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                                                <p className="text-blue-400 font-bold text-xs uppercase mb-2">Memoria de Largo Plazo</p>
                                                                <p className="text-[10px] text-gray-500 leading-relaxed">Sara consulta Supabase para identificar al cliente por su número, ver su historial de pedidos y recordar sus preferencias habituales.</p>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section>
                                                        <h4 className="text-blue-400 text-sm font-bold uppercase mb-4">Flujo de Datos (Arquitectura)</h4>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                                <p className="text-[10px] text-gray-400 font-mono">1. Retell captura from_number</p>
                                                            </div>
                                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                                <p className="text-[10px] text-gray-400 font-mono">2. Consulta dinámica a tabla 'leads'</p>
                                                            </div>
                                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                                <p className="text-[10px] text-gray-400 font-mono">3. Inyección de contexto al Prompt de Sara</p>
                                                            </div>
                                                        </div>
                                                    </section>
                                                </div>
                                            )}

                                            {selectedGuide === 'strategy' && (
                                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-sm">
                                                    <section>
                                                        <h4 className="text-purple-400 text-xl font-bold uppercase italic mb-4">Estrategia de Cierre de Ventas</h4>
                                                        <p className="text-gray-400 leading-relaxed mb-6">Cómo posicionar SaraCalls para maximizar tus ingresos de agencia:</p>
                                                        <div className="grid gap-4">
                                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex gap-4">
                                                                <TrendingUp className="text-purple-400" size={24} />
                                                                <div>
                                                                    <p className="text-white font-bold text-xs">Vende el ROI, no la Tecnología</p>
                                                                    <p className="text-[10px] text-gray-500">Muestra cuántas llamadas perdidas se convierten en reservas reales gracias a la disponibilidad 24/7 de Sara.</p>
                                                                </div>
                                                            </div>
                                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex gap-4">
                                                                <Zap className="text-purple-400" size={24} />
                                                                <div>
                                                                    <p className="text-white font-bold text-xs">Demostraciones en Vivo</p>
                                                                    <p className="text-[10px] text-gray-500">Deja que el cliente llame a un número demo. La sorpresa al ser atendido por una voz humana que responde inteligentemente cierra el 80% de los tratos.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>
                                                </div>
                                            )}

                                            {selectedGuide === 'webhooks' && (
                                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-sm">
                                                    <section>
                                                        <h4 className="text-purple-400 text-xl font-bold uppercase italic mb-4">Integración Retell AI</h4>
                                                        <p className="text-gray-400 leading-relaxed">Pasos finales para conectar la lógica:</p>
                                                        <div className="p-6 rounded-3xl bg-purple-500/5 border border-purple-500/20 font-mono text-[10px] text-purple-200/50 space-y-2">
                                                            <p>1. Copia tu Master API Key en Configuración.</p>
                                                            <p>2. En Retell, crea un Webhook apuntando a tu escenario de Make.</p>
                                                            <p>3. Asegúrate de que el módulo 'Filter' en Make valide el 'client_id'.</p>
                                                        </div>
                                                    </section>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-10 border-t border-white/5 bg-white/[0.01] flex justify-end">
                                        <button
                                            onClick={() => setShowGuideModal(false)}
                                            className="px-10 py-4 rounded-2xl bg-[#FD7202] text-white font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-[0_10px_20px_rgba(253,114,2,0.3)]"
                                        >
                                            ¡Entendido!
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
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
