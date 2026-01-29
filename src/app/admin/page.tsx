"use client";

import {
    LayoutDashboard,
    Phone,
    Users,
    Calendar,
    Settings,
    Mic,
    Bell,
    PhoneCall,
    CalendarCheck,
    UserPlus,
    Clock,
    Play,
    FileText,
    Check as CheckIcon,
    Volume2,
    Database,
    Zap,
    BotMessageSquare,
    MoreVertical,
    Download,
    Eye,
    Rocket,
    ShieldCheck,
    Cpu,
    Workflow,
    Wine,
    Scissors,
    Utensils,
    Stethoscope,
    Trash2,
    AlertCircle,
    Filter,
    ChevronDown,
    MessageSquare,
    X,
    MapPin,
    ShoppingBag
} from "lucide-react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ClientSidebar } from "@/components/dashboard/ClientSidebar";
import { ClientHeader } from "@/components/dashboard/ClientHeader";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { CallsTable } from "@/components/dashboard/CallsTable";


ChartJS.register(ArcElement, Tooltip, Legend);

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'leads' | 'appointments' | 'orders' | 'settings'>('overview');
    const [isPlaying, setIsPlaying] = useState<number | null>(null);
    const [calls, setCalls] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [industry, setIndustry] = useState<'barber' | 'restaurant' | 'clinic' | 'restaurant_res'>('restaurant');

    const [clientId, setClientId] = useState<string | null>(null);
    const [clientName, setClientName] = useState<string>("Admin");
    const [isDemo, setIsDemo] = useState(false);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string>("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<any>(null);
    const [historyData, setHistoryData] = useState<{ calls: any[], leads: any[] }>({ calls: [], leads: [] });
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchHistory = async () => {
        if (!clientId && !isDemo) return;
        setLoadingHistory(true);
        setSelectedHistory({ business_name: clientName });
        try {
            if (isDemo) {
                // Datos mock para demo
                setHistoryData({
                    calls: [
                        { customer_name: 'Demo Call 1', duration: '2m', created_at: new Date().toISOString() },
                        { customer_name: 'Demo Call 2', duration: '5m', created_at: new Date().toISOString() }
                    ],
                    leads: [
                        { first_name: 'Demo', last_name: 'Lead 1', email: 'demo1@example.com' }
                    ]
                });
                setLoadingHistory(false);
                return;
            }

            const { supabase } = await import("@/lib/supabase");
            const [callsRes, leadsRes] = await Promise.all([
                supabase.from('calls').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(10),
                supabase.from('leads').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(10)
            ]);
            setHistoryData({
                calls: callsRes.data || [],
                leads: leadsRes.data || []
            });
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Configuración de Temas Dinámicos
    const themes = {
        restaurant: {
            primary: "#FD7202",
            accent: "orange",
            gradient: "from-[#FD7202] to-[#FF9031]",
            glow: "bg-[#FD7202]/5",
            icon: Utensils
        },
        restaurant_res: {
            primary: "#8B5CF6",
            accent: "purple",
            gradient: "from-[#8B5CF6] to-[#A78BFA]",
            glow: "bg-[#8B5CF6]/5",
            icon: Wine
        },
        clinic: {
            primary: "#00F0FF",
            accent: "blue",
            gradient: "from-[#00F0FF] to-[#38BDF8]",
            glow: "bg-[#00F0FF]/5",
            icon: Stethoscope
        },
        barber: {
            primary: "#F59E0B",
            accent: "amber",
            gradient: "from-[#F59E0B] to-[#FBBF24]",
            glow: "bg-[#F59E0B]/5",
            icon: Users
        }
    };

    const CurrentTheme = themes[industry] || themes.restaurant;
    const ThemeIcon = CurrentTheme.icon;

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            setLoading(true);
            try {
                const { supabase } = await import("@/lib/supabase");

                // 2. Verificar Sesión Real
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    return;
                }

                const isAdmin = session.user.email === "misaerobles0404@gmail.com" ||
                    session.user.email === "misaelrobles0404@gmail.com";

                if (isAdmin) {
                    setIsAdminUser(true);
                    console.log("🚀 SARA: Super Admin detectado en panel de cliente.");

                    // Permitir visualizar un cliente específico vía URL si viene el ID
                    const params = new URLSearchParams(window.location.search);

                    // Prioridad 1: Industria forzada vía URL (Para Showroom)
                    const forceIndustry = params.get('industry');
                    if (forceIndustry) {
                        setIndustry(forceIndustry as any);
                    }

                    const previewId = params.get('preview_client_id');
                    if (previewId) {
                        const { data: pClient } = await supabase.from('clients').select('*').eq('id', previewId).single() as any;
                        if (pClient) {
                            setClientId(pClient.id);
                            setClientName(pClient.business_name + " (Vista Previa)");
                            setIndustry(pClient.industry as any);
                            if (pClient.logo_url) setLogoUrl(pClient.logo_url);
                            // Cargar datos de este cliente...
                            const [pCalls, pLeads, pApps, pOrders] = await Promise.all([
                                supabase.from('calls').select('*').eq('client_id', pClient.id).order('created_at', { ascending: false }),
                                supabase.from('leads').select('*').eq('client_id', pClient.id).order('created_at', { ascending: false }),
                                supabase.from('appointments').select('*').eq('client_id', pClient.id).order('appointment_date', { ascending: true }),
                                supabase.from('orders').select('*').eq('client_id', pClient.id).order('created_at', { ascending: false })
                            ]);
                            if (pCalls.data) setCalls(pCalls.data);
                            if (pLeads.data) setLeads(pLeads.data);
                            if (pApps.data) setAppointments(pApps.data);
                            if (pOrders.data) setOrders(pOrders.data);
                            setIsAuthorized(true);
                            setLoading(false);
                            return;
                        }
                    }

                    // Si no hay previewId, simplemente permitimos el acceso con datos vacíos
                    setClientName(`Showroom ${forceIndustry || 'General'}`);
                    setCalls([]);
                    setLeads([]);
                    setOrders([]);
                    setAppointments([]);
                    setIsAuthorized(true);
                    setLoading(false);
                    return;
                }

                setIsAuthorized(true);

                // 2. Obtener Client ID vinculado al Auth User ID
                const { data: clientData, error: clientError } = await supabase
                    .from('clients')
                    .select('id, business_name, industry, logo_url')
                    .eq('auth_user_id', session.user.id)
                    .single();

                if (clientError || !clientData) {
                    console.error("Cliente no vinculado o no encontrado:", clientError);
                    // Si el usuario existe pero no tiene empresa vinculada, podemos mostrar un estado vacío o error
                    setLoading(false);
                    return;
                }

                const currentClientId = clientData.id;
                setClientId(currentClientId);
                setClientName(clientData.business_name);
                if (clientData.industry) setIndustry(clientData.industry as any);
                if (clientData.logo_url) setLogoUrl(clientData.logo_url);

                // 3. Cargar Datos Filtrados por Cliente
                const [callsRes, leadsRes, appointmentsRes, ordersRes] = await Promise.all([
                    supabase.from('calls').select('*').eq('client_id', currentClientId).order('created_at', { ascending: false }),
                    supabase.from('leads').select('*').eq('client_id', currentClientId).order('created_at', { ascending: false }),
                    supabase.from('appointments').select('*').eq('client_id', currentClientId).order('appointment_date', { ascending: true }),
                    supabase.from('orders').select('*').eq('client_id', currentClientId).order('created_at', { ascending: false })
                ]);

                if (callsRes.data) setCalls(callsRes.data);
                if (leadsRes.data) setLeads(leadsRes.data);
                if (appointmentsRes.data) setAppointments(appointmentsRes.data);
                if (ordersRes.data) setOrders(ordersRes.data);

                // Mock orders removed, now uses database data

                // 4. Suscripción Realtime Dinámica para todas las tablas
                const channelId = `client_data_${currentClientId}`;
                const subscription = supabase
                    .channel(channelId)
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'calls',
                        filter: `client_id=eq.${currentClientId}`
                    }, payload => {
                        if (payload.eventType === 'INSERT') {
                            setCalls(prev => [payload.new, ...prev].slice(0, 50));
                        } else if (payload.eventType === 'UPDATE') {
                            setCalls(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
                        } else if (payload.eventType === 'DELETE') {
                            setCalls(prev => prev.filter(c => c.id !== payload.old.id));
                        }
                    })
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'leads',
                        filter: `client_id=eq.${currentClientId}`
                    }, payload => {
                        if (payload.eventType === 'INSERT') {
                            setLeads(prev => [payload.new, ...prev].slice(0, 50));
                        } else if (payload.eventType === 'UPDATE') {
                            setLeads(prev => prev.map(l => l.id === payload.new.id ? payload.new : l));
                        } else if (payload.eventType === 'DELETE') {
                            setLeads(prev => prev.filter(l => l.id !== payload.old.id));
                        }
                    })
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'appointments',
                        filter: `client_id=eq.${currentClientId}`
                    }, payload => {
                        if (payload.eventType === 'INSERT') {
                            setAppointments(prev => [...prev, payload.new].sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()));
                        } else if (payload.eventType === 'UPDATE') {
                            setAppointments(prev => prev.map(a => a.id === payload.new.id ? payload.new : a).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()));
                        } else if (payload.eventType === 'DELETE') {
                            setAppointments(prev => prev.filter(a => a.id !== payload.old.id));
                        }
                    })
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'orders',
                        filter: `client_id=eq.${currentClientId}`
                    }, payload => {
                        if (payload.eventType === 'INSERT') {
                            setOrders(prev => [payload.new, ...prev]);
                        } else if (payload.eventType === 'UPDATE') {
                            setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
                        } else if (payload.eventType === 'DELETE') {
                            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
                        }
                    })
                    .subscribe();

                return subscription;
            } catch (error) {
                console.error("Error crítico en Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        const subscriptionPromise = checkAuthAndFetch();

        return () => {
            subscriptionPromise.then(sub => {
                if (sub) {
                    import("@/lib/supabase").then(({ supabase }) => {
                        supabase.removeChannel(sub);
                    });
                }
            });
        };
    }, [router]);

    const handleDeleteLead = async (leadId: string) => {
        if (isDemo) {
            alert("Función deshabilitada en Demo por seguridad.");
            return;
        }

        if (!confirm("¿Estás seguro de que quieres eliminar este lead? Esta acción no se puede deshacer.")) return;

        try {
            const { supabase } = await import("@/lib/supabase");
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', leadId);

            if (error) throw error;
            setLeads(prev => prev.filter(l => l.id !== leadId));
        } catch (error: any) {
            console.error("Error deleting lead:", error);
            alert("Error al eliminar el lead.");
        }
    };

    const handleLogout = async () => {
        const { supabase } = await import("@/lib/supabase");
        await supabase.auth.signOut();
        // Limpiar cookie de demo si existe
        document.cookie = "saracalls-demo-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/login";
    };

    // Calcular horas ahorradas (Cada llamada se estima en 5 minutos de trabajo humano administrativo)
    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const previousOrders = [...orders];
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        if (isDemo) return;

        try {
            const { supabase } = await import("@/lib/supabase");
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
        } catch (error: any) {
            console.error("Error actualizando pedido:", error);
            setOrders(previousOrders);
            alert("Error al actualizar el estado del pedido.");
        }
    };

    const deleteOrder = async (orderId: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este pedido?")) return;

        const previousOrders = [...orders];
        setOrders(prev => prev.filter(o => o.id !== orderId));

        if (isDemo) return;

        try {
            const { supabase } = await import("@/lib/supabase");
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;
        } catch (error: any) {
            console.error("Error eliminando pedido:", error);
            setOrders(previousOrders);
            alert("Error al eliminar el pedido.");
        }
    };

    const deleteLead = async (leadId: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este prospecto permanentemente?")) return;

        const previousLeads = [...leads];
        setLeads(prev => prev.filter(l => l.id !== leadId));

        if (isDemo) return;

        try {
            const { supabase } = await import("@/lib/supabase");
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', leadId);

            if (error) throw error;
        } catch (error) {
            console.error("Error eliminando lead:", error);
            setLeads(previousLeads);
            alert("Error al eliminar el registro.");
        }
    };

    const handleDeleteCallsByMonth = async (monthsAgo: number) => {
        if (isDemo) {
            alert("No permitido en modo Demo");
            return;
        }
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() - monthsAgo);
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString();
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const monthName = targetDate.toLocaleString('es-ES', { month: 'long' });

        if (!confirm(`¿Estás seguro de que quieres borrar TODAS tus llamadas de ${monthName}? Esta acción no se puede deshacer.`)) return;

        try {
            const { supabase } = await import("@/lib/supabase");
            const { error } = await supabase
                .from('calls')
                .delete()
                .eq('client_id', clientId)
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

    const handleDeleteLeadsByMonth = async (monthsAgo: number) => {
        if (isDemo) {
            alert("No permitido en modo Demo");
            return;
        }
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() - monthsAgo);
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString();
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const monthName = targetDate.toLocaleString('es-ES', { month: 'long' });

        if (!confirm(`¿Estás seguro de que quieres borrar TODOS tus prospectos de ${monthName}? Esta acción no se puede deshacer.`)) return;

        try {
            const { supabase } = await import("@/lib/supabase");
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('client_id', clientId)
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
    const totalCallsCount = loading ? 0 : calls.length;
    const hoursSaved = Math.round((totalCallsCount * 5) / 60);

    if (!isAuthorized && !loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD7202]"></div></div>;

    return (
        <div className="bg-[#050505] min-h-screen flex w-full font-sans text-white selection:bg-[#FD7202]/30">
            {/* Sidebar */}
            <ClientSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                industry={industry}
                clientName={clientName}
                logoUrl={logoUrl}
                handleLogout={handleLogout}
                currentTheme={CurrentTheme}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            <main className="lg:pl-64 min-h-screen w-full">
                <div className="max-w-7xl mx-auto p-4 lg:p-8 relative">
                    {/* Decorative Glow Dinámico */}
                    <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${CurrentTheme.glow} blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse`}></div>

                    {/* Admin Toolbar (Only for Super Admin) */}
                    {isAdminUser && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-4 rounded-3xl bg-[#FD7202]/10 border border-[#FD7202]/20 flex flex-wrap items-center justify-between gap-4 backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#FD7202] flex items-center justify-center text-white shadow-lg">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase italic tracking-wider">Modo Administrador</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Estás previsualizando la interfaz de cliente</p>
                                </div>
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar mask-gradient">
                                {[
                                    { id: 'restaurant', label: 'Restaurante', icon: Utensils },
                                    { id: 'barber', label: 'Barbería', icon: Scissors },
                                    { id: 'clinic', label: 'Clínica', icon: Stethoscope },
                                    { id: 'restaurant_res', label: 'Gourmet', icon: Wine }
                                ].map((ind) => (
                                    <button
                                        key={ind.id}
                                        onClick={() => setIndustry(ind.id as any)}
                                        className={`flex-shrink-0 px-3 py-2 rounded-xl flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-all ${industry === ind.id ? 'bg-[#FD7202] text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <ind.icon size={12} /> {ind.label}
                                    </button>
                                ))}
                                <div className="w-full sm:w-auto h-px sm:h-8 bg-[#FD7202]/20 mx-2"></div>
                                <button
                                    onClick={() => router.push('/super-admin')}
                                    className="px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 shadow-lg hover:shadow-red-500/20"
                                >
                                    <LogOut size={14} className="rotate-180" /> Salir del Lab
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Header Profile */}
                    <ClientHeader
                        clientName={clientName}
                        industry={industry}
                        logoUrl={logoUrl}
                        currentTheme={CurrentTheme}
                        onMenuClick={() => setIsMobileMenuOpen(true)}
                    />

                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' ? (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Hero Stats */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                    {[
                                        { label: 'Total Llamadas', value: loading ? null : calls.length.toString(), trend: '+12%', color: CurrentTheme.accent, icon: PhoneCall, tab: 'calls' },
                                        industry === 'restaurant' ?
                                            { label: 'Pedidos Hoy', value: loading ? null : orders.length.toString(), trend: '+15%', color: 'blue', icon: LayoutDashboard, tab: 'orders' } :
                                            { label: industry === 'clinic' ? 'Consultas' : (industry === 'restaurant_res' ? 'Mesas Reservadas' : 'Citas Cerradas'), value: loading ? null : appointments.filter(a => a.status === 'Confirmada').length.toString(), trend: '+8.4%', color: 'green', icon: CalendarCheck, tab: 'appointments' },
                                        { label: 'Nuevos Leads', value: loading ? null : leads.length.toString(), trend: '+24%', color: CurrentTheme.accent, icon: UserPlus, tab: 'leads' },
                                        { label: 'Tiempo Ahorrado', value: loading ? null : `${hoursSaved}h`, trend: '∞', color: 'purple', icon: Clock, tab: 'overview' }
                                    ].map((stat, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveTab(stat.tab as any)}
                                            className="relative group p-6 lg:p-8 rounded-[28px] lg:rounded-[32px] border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-500 text-left overflow-hidden ring-1 ring-white/5"
                                        >
                                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center mb-6 border transition-transform duration-500 shadow-xl`}
                                                style={{ backgroundColor: CurrentTheme.primary + '15', borderColor: CurrentTheme.primary + '33' }}>
                                                <stat.icon size={20} style={{ color: CurrentTheme.primary }} className="group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                                                <div className="flex items-baseline gap-3">
                                                    {stat.value === null ? (
                                                        <div className="h-9 w-20 bg-white/5 animate-pulse rounded-lg"></div>
                                                    ) : (
                                                        <h3 className="text-2xl lg:text-3xl font-black italic">{stat.value}</h3>
                                                    )}
                                                    {!loading && <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stat.trend.includes('+') ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>{stat.trend}</span>}
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/5 transition-all" style={{ backgroundColor: `${CurrentTheme.primary}10` }}></div>
                                        </button>
                                    ))}
                                </div>



                                <div className="grid lg:grid-cols-3 gap-8">
                                    {/* Recording Player Mock */}
                                    <div className="lg:col-span-2 glass rounded-[36px] border border-white/5 p-8 bg-white/[0.02] shadow-2xl">
                                        <div className="flex justify-between items-center mb-8">
                                            <div>
                                                <h2 className="text-xl font-black uppercase italic tracking-tight">Última Actividad</h2>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Llamadas en vivo y grabaciones</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setActiveTab('calls')} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all">Ver Todo</button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {loading ? (
                                                <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD7202]"></div></div>
                                            ) : calls.length === 0 ? (
                                                <p className="text-gray-500 text-center py-10 uppercase text-[10px] font-bold tracking-widest">Sin llamadas registradas</p>
                                            ) : calls.slice(0, 3).map((call, idx) => (
                                                <div key={call.id || idx} className="group flex items-center gap-5 p-6 rounded-[24px] bg-white/[0.02] border border-white/5 transition-all duration-500 hover:bg-white/[0.04]"
                                                    style={{ '--hover-border': CurrentTheme.primary } as any}>
                                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-500">
                                                        <Mic size={20} className="text-gray-500 transition-all" style={{ color: CurrentTheme.primary }} />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="font-bold text-lg">{call.customer_name || 'Desconocido'}</h4>
                                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${call.sentiment === 'Positivo' || call.sentiment === 'Confirmada' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>{call.sentiment || 'Procesada'}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-medium">{call.customer_phone} • {call.duration} • {new Date(call.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setIsPlaying(isPlaying === idx ? null : idx)}
                                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isPlaying === idx ? 'text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                                            style={isPlaying === idx ? { backgroundColor: CurrentTheme.primary } : {}}
                                                        >
                                                            {isPlaying === idx ? <Volume2 size={20} /> : <Play size={20} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <div className={`glass rounded-[36px] bg-gradient-to-br ${CurrentTheme.gradient} p-8 text-white relative overflow-hidden group`}>
                                            <div className="relative z-10">
                                                <Zap className="mb-4 text-white opacity-80" />
                                                <h3 className="text-xl font-black uppercase italic tracking-tight mb-2">Escala tu Negocio</h3>
                                                <p className="text-xs font-medium opacity-80 mb-6 leading-relaxed">¿Tu negocio está creciendo? Activa más agentes, conecta tus herramientas de trabajo actuales o sube de nivel para no perder ninguna oportunidad.</p>
                                                <a
                                                    href="https://wa.me/521234567890?text=Hola,%20mi%20negocio%20está%20creciendo%20y%20quiero%20mejorar%20mi%20plan%20de%20SaraCalls.ai"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full bg-black py-4 rounded-2xl text-[10px] text-center font-black uppercase tracking-[.25em] transition-all hover:bg-black/80 shadow-xl"
                                                >
                                                    Hablar con Ventas
                                                </a>
                                            </div>
                                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 blur-[50px] rounded-full group-hover:scale-150 transition-all duration-700"></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : activeTab === 'calls' ? (
                            <motion.div
                                key="calls"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass rounded-[36px] bg-white/[0.02] border border-white/5 p-8"
                            >
                                <h2 className="text-2xl font-black uppercase italic mb-8">Historial de Llamadas</h2>
                                <CallsTable
                                    calls={calls}
                                    loading={loading}
                                    currentTheme={CurrentTheme}
                                />
                            </motion.div>
                        ) : activeTab === 'leads' ? (
                            <motion.div
                                key="leads"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass rounded-[36px] bg-white/[0.02] border border-white/5 p-8"
                            >
                                <div className="mb-8 flex flex-row items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-3xl font-black uppercase italic text-white tracking-tight mb-2">Clientes</h2>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Oportunidades de Venta ({leads.length})</p>
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                        <UserPlus size={32} style={{ color: CurrentTheme.primary }} />
                                    </div>
                                </div>
                                <LeadsTable
                                    leads={leads}
                                    loading={loading}
                                    onDelete={handleDeleteLead}
                                />
                            </motion.div>
                        ) : activeTab === 'appointments' ? (
                            <motion.div
                                key="appointments"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass rounded-[36px] bg-white/[0.02] border border-white/5 p-8"
                            >
                                <h2 className="text-2xl font-black uppercase italic mb-8">{industry === 'restaurant_res' ? 'Libro de Reservas' : 'Agenda Dinámica'}</h2>
                                <div className="grid gap-4">
                                    {loading ? (
                                        <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD7202]"></div></div>
                                    ) : appointments.length === 0 ? (
                                        <p className="text-gray-500 text-center py-10 uppercase text-[10px] font-bold tracking-widest">No hay {industry === 'restaurant_res' ? 'reservas' : 'citas'} programadas</p>
                                    ) : appointments.map((appt, idx) => (
                                        <div key={appt.id || idx} className="group flex items-center gap-6 p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-[#FD7202]/30 hover:bg-[#FD7202]/[0.02] transition-all duration-500 cursor-pointer">
                                            <div className="text-xl font-black text-[#FD7202] w-24 tabular-nums drop-shadow-[0_0_8px_rgba(253,114,2,0.3)]">
                                                {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-bold text-lg text-gray-200 group-hover:text-white transition-colors">{appt.customer_name}</h4>
                                                <p className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors">{industry === 'restaurant_res' ? 'Mesa para ' + (idx + 2) + ' personas' : (appt.service || 'Consulta General')}</p>
                                            </div>
                                            <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${appt.status === 'Confirmada' ? 'bg-green-500/10 text-green-400 border-green-500/20 group-hover:bg-green-500/20' : 'bg-[#FD7202]/10 text-[#FD7202] border-[#FD7202]/20 group-hover:bg-[#FD7202]/20'}`}>
                                                {appt.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : activeTab === 'orders' ? (
                            <motion.div
                                key="orders"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="glass rounded-[36px] bg-white/[0.02] border border-white/5 p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h2 className="text-2xl font-black uppercase italic">Monitor de Cocina</h2>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Gestión de pedidos en tiempo real</p>
                                        </div>
                                        <div className="bg-[#00F0FF]/10 text-[#00F0FF] px-4 py-2 rounded-xl border border-[#00F0FF]/20 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                            Monitor Activo
                                        </div>
                                    </div>

                                    <div className="grid gap-6">
                                        {loading ? (
                                            <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
                                        ) : orders.length === 0 ? (
                                            <div className="py-20 text-center glass rounded-[32px] border border-white/5 bg-white/[0.01]">
                                                <Utensils size={48} className="mx-auto text-gray-700 mb-4 opacity-20" />
                                                <p className="text-gray-500 uppercase text-xs font-bold tracking-widest">No hay pedidos registrados</p>
                                            </div>
                                        ) : orders.map((order: any, idx: number) => {
                                            const isDelivery = order.notes?.toLowerCase().includes('a domicilio');
                                            const hasUtensils = order.notes?.toLowerCase().includes('utensilios: sí');
                                            const address = order.notes?.split('Dir: ')[1]?.split(' Utensilios:')[0] || 'Sucursal';
                                            const comments = order.notes?.split('Comentarios: ')[1] || 'Sin comentarios adicionales';

                                            return (
                                                <motion.div
                                                    layout
                                                    key={order.id || idx}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="group relative glass rounded-[32px] border border-white/10 bg-white/[0.03] p-8 transition-all duration-500 hover:bg-white/[0.05] overflow-hidden"
                                                >
                                                    <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-500 ${order.status === 'Pendiente' ? 'bg-orange-500 shadow-[2px_0_15px_rgba(249,115,22,0.5)]' :
                                                        order.status === 'Preparando' ? 'bg-blue-500 shadow-[2px_0_15px_rgba(59,130,246,0.5)]' :
                                                            order.status === 'Listo' ? 'bg-green-500 shadow-[2px_0_15px_rgba(34,197,94,0.5)]' :
                                                                'bg-purple-500 shadow-[2px_0_15px_rgba(168,85,247,0.5)]'
                                                        }`}></div>

                                                    <button
                                                        onClick={() => deleteOrder(order.id)}
                                                        className="absolute top-6 right-6 p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>

                                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                                        <div className="lg:col-span-2 flex lg:flex-col items-center lg:items-start justify-between lg:justify-start gap-4 border-b lg:border-b-0 lg:border-r border-white/5 pb-4 lg:pb-0 lg:pr-6 text-center lg:text-left">
                                                            <div>
                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Orden</span>
                                                                <div className="text-4xl font-black text-white tabular-nums tracking-tighter">
                                                                    #{order.order_number || idx + 101}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Entrada</span>
                                                                <div className="flex items-center gap-2 text-gray-300 font-bold italic justify-center lg:justify-start">
                                                                    <Clock size={14} className="text-blue-400" />
                                                                    {new Date(order.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="lg:col-span-6 space-y-6">
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <h4 className="text-2xl font-black italic uppercase tracking-tight text-white">{order.customer_name}</h4>
                                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDelivery ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                                                    {isDelivery ? '🚀 A DOMICILIO' : '🥡 PARA RECOGER'}
                                                                </div>
                                                            </div>

                                                            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                                                    <Utensils size={60} />
                                                                </div>
                                                                <p className="text-lg text-gray-100 font-bold leading-relaxed whitespace-pre-line italic relative z-10">
                                                                    {order.items || 'Sin productos detallados'}
                                                                </p>
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                                                    <MapPin size={16} className="text-gray-500 mt-0.5 shrink-0" />
                                                                    <span className="text-[11px] text-gray-400 font-medium leading-tight">
                                                                        <strong className="text-gray-300 uppercase block mb-0.5 text-[9px] tracking-wider">Dirección</strong>
                                                                        {address}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                                                    <Phone size={16} className="text-gray-500 mt-0.5 shrink-0" />
                                                                    <span className="text-[11px] text-gray-400 font-medium leading-tight">
                                                                        <strong className="text-gray-300 uppercase block mb-0.5 text-[9px] tracking-wider">Teléfono</strong>
                                                                        {order.customer_phone || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {comments && comments !== 'Sin comentarios adicionales' && comments.trim() !== '' && (
                                                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 text-orange-400">
                                                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                                                    <p className="text-[11px] font-bold uppercase tracking-tight leading-relaxed">
                                                                        NOTA: {comments}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="lg:col-span-4 flex flex-col justify-between h-auto lg:h-full space-y-6">
                                                            <div>
                                                                <div className="flex justify-between items-center mb-3 px-1 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                                                    <span>Control de Estado</span>
                                                                    <span className={order.status === 'Pendiente' ? 'text-orange-500' : 'text-blue-500'}>{order.status || 'Pendiente'}</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {[
                                                                        { label: '🔥 Cocina', val: 'Preparando', color: 'blue' },
                                                                        { label: '✅ Listo', val: 'Listo', color: 'green' },
                                                                        { label: '📦 Entregado', val: 'Entregado', color: 'purple' },
                                                                        { label: '⏳ Espera', val: 'Pendiente', color: 'orange' }
                                                                    ].map((st) => (
                                                                        <button
                                                                            key={st.val}
                                                                            onClick={() => updateOrderStatus(order.id, st.val)}
                                                                            className={`px-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${order.status === st.val
                                                                                ? `bg-${st.color}-500 text-white border-transparent shadow-[0_5px_15px_rgba(0,0,0,0.3)] scale-[1.02]`
                                                                                : `bg-white/5 text-gray-500 border-white/5 hover:border-white/10 hover:bg-white/10 hover:text-white`
                                                                                }`}
                                                                        >
                                                                            {st.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="bg-gradient-to-r from-transparent to-white/[0.03] p-6 rounded-3xl border border-white/5 flex items-center justify-between mt-auto">
                                                                <div>
                                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Precio Total</span>
                                                                    <span className={`text-3xl font-black tabular-nums tracking-tighter ${order.total_price ? 'text-white' : 'text-red-500/50'}`}>
                                                                        ${order.total_price || '0.00'}
                                                                    </span>
                                                                </div>
                                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${hasUtensils ? 'bg-orange-500/20 border-orange-500/30 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                                                                    <ShoppingBag size={20} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass rounded-[36px] bg-white/[0.02] border border-white/5 p-8 max-w-2xl"
                            >
                                <h2 className="text-2xl font-black uppercase italic mb-8">Configuración del Sistema</h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Retell AI API Key</label>
                                        <input type="password" placeholder="retell_..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#FD7202] transition-colors outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Make Webhook URL</label>
                                        <input type="text" placeholder="https://hook.make.com/..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#FD7202] transition-colors outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Logo del Negocio (URL)</label>
                                        <input
                                            type="text"
                                            value={logoUrl}
                                            onChange={(e) => setLogoUrl(e.target.value)}
                                            placeholder="https://tusitio.com/logo.png"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#FD7202] transition-colors outline-none"
                                        />
                                    </div>
                                    <button className="w-full bg-[#FD7202] py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors mt-4">Guardar Cambios</button>
                                    <div className="pt-8 border-t border-white/5 space-y-6">
                                        <div className="text-center">
                                            <h3 className="text-xl font-black uppercase italic mb-2 text-red-500">Mantenimiento</h3>
                                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Borrado de datos históricos</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => handleDeleteCallsByMonth(1)}
                                                className="py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={14} /> Borrar Llamadas Mes Pasado
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLeadsByMonth(1)}
                                                className="py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={14} /> Borrar Leads Mes Pasado
                                            </button>
                                        </div>
                                    </div>
                                </div>


                            </motion.div>
                        )}
                    </AnimatePresence>



                    {/* Footer Status */}
                    <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em]">
                            © 2026 SaraCalls.AI • Protocolo de Datos Seguro (SSL/AES-256)
                        </p>
                        <div className="flex gap-6 items-center">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Servidor: CDMX-1</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Latencia: 24ms</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-[9px] font-black uppercase tracking-widest"
                            >
                                <LogOut size={12} /> Salir
                            </button>
                        </div>
                    </footer>
                </div>
            </main>

            {/* Mobile Navigation Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/10 px-6 py-4 flex justify-between items-center z-50">
                {[
                    { id: 'overview', icon: LayoutDashboard },
                    { id: 'calls', icon: Phone },
                    { id: 'leads', icon: Users }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`p-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#FD7202] text-white shadow-[0_0_15px_rgba(253,114,2,0.4)]' : 'text-gray-500'}`}
                    >
                        <item.icon size={24} />
                    </button>
                ))}

                {/* Botón Salir Mobile - Solo Admins */}
                {isAdminUser && (
                    <button
                        onClick={() => router.push('/super-admin')}
                        className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20"
                    >
                        <LogOut size={24} className="rotate-180" />
                    </button>
                )}
            </nav>
            {/* Modal de Historial de Cliente */}
            <AnimatePresence>
                {selectedHistory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedHistory(null)}
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
                                    <h3 className="text-2xl font-black uppercase italic text-[#FD7202]">{selectedHistory.business_name}</h3>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Historial del Cliente</p>
                                </div>
                                <button
                                    onClick={() => setSelectedHistory(null)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-all"
                                >
                                    <X size={20} />
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
                                                <PhoneCall size={14} className="text-[#FD7202]" /> Últimas Llamadas (Pedidos)
                                            </h4>
                                            {historyData.calls.length === 0 ? (
                                                <p className="text-xs text-gray-600 italic">No hay registros de llamadas recientes.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {historyData.calls.map((call, i) => (
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
                                            {historyData.leads.length === 0 ? (
                                                <p className="text-xs text-gray-600 italic">No hay prospectos vinculados.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {historyData.leads.map((lead, i) => (
                                                        <div key={i} className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 flex justify-between items-center">
                                                            <div>
                                                                <p className="text-xs font-bold text-white uppercase">{lead.name || lead.first_name + ' ' + lead.last_name}</p>
                                                                <p className="text-[10px] text-gray-500">{lead.phone || lead.email}</p>
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
