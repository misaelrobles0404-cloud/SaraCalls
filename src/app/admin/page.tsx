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
    ShoppingBag,
    History
} from "lucide-react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useEffect } from "react";
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
    const [orderView, setOrderView] = useState<'today' | 'history'>('today');
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
    const [expandedDates, setExpandedDates] = useState<string[]>([]);

    const toggleDate = (date: string) => {
        setExpandedDates(prev =>
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    };

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

                let targetClientId = '';
                let targetClientName = '';
                let targetIndustry = 'restaurant';
                let targetLogo = '';

                if (isAdmin) {
                    setIsAdminUser(true);
                    const params = new URLSearchParams(window.location.search);
                    const forceIndustry = params.get('industry');
                    const previewId = params.get('preview_client_id');

                    if (previewId) {
                        const { data: pClient } = await supabase.from('clients').select('*').eq('id', previewId).single();
                        if (pClient) {
                            targetClientId = pClient.id;
                            targetClientName = pClient.business_name + " (Vista Previa)";
                            targetIndustry = pClient.industry as any;
                            targetLogo = pClient.logo_url || '';
                        }
                    } else {
                        // Modo Showroom sin cliente específico
                        setClientName(`Showroom ${forceIndustry || 'General'}`);
                        if (forceIndustry) setIndustry(forceIndustry as any);
                        setCalls([]);
                        setLeads([]);
                        setOrders([]);
                        setAppointments([]);
                        setIsAuthorized(true);
                        setLoading(false);
                        return;
                    }
                } else {
                    // 2. Obtener Client ID vinculado al Auth User ID para clientes normales
                    const { data: clientData, error: clientError } = await supabase
                        .from('clients')
                        .select('id, business_name, industry, logo_url')
                        .eq('auth_user_id', session.user.id)
                        .single();

                    if (clientError || !clientData) {
                        console.error("Cliente no vinculado o no encontrado:", clientError);
                        setLoading(false);
                        return;
                    }

                    targetClientId = clientData.id;
                    targetClientName = clientData.business_name;
                    targetIndustry = clientData.industry as any;
                    targetLogo = clientData.logo_url || '';
                }

                setClientId(targetClientId);
                setClientName(targetClientName);
                if (targetIndustry) setIndustry(targetIndustry as any);
                if (targetLogo) setLogoUrl(targetLogo);

                // 3. Cargar Datos Filtrados
                const [callsRes, leadsRes, appointmentsRes, ordersRes] = await Promise.all([
                    supabase.from('calls').select('*').eq('client_id', targetClientId).order('created_at', { ascending: false }),
                    supabase.from('leads').select('*').eq('client_id', targetClientId).order('created_at', { ascending: false }),
                    supabase.from('appointments').select('*').eq('client_id', targetClientId).order('appointment_date', { ascending: true }),
                    supabase.from('orders').select('*').eq('client_id', targetClientId).order('created_at', { ascending: false })
                ]);

                if (callsRes.data) setCalls(callsRes.data);
                if (leadsRes.data) setLeads(leadsRes.data);
                if (appointmentsRes.data) setAppointments(appointmentsRes.data);
                if (ordersRes.data) setOrders(ordersRes.data);

                setIsAuthorized(true);

                // 4. Suscripción Realtime Dinámica
                const channelId = `client_data_${targetClientId}`;
                const subscription = supabase
                    .channel(channelId)
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'calls',
                        filter: `client_id=eq.${targetClientId}`
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
                        filter: `client_id=eq.${targetClientId}`
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
                        filter: `client_id=eq.${targetClientId}`
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
                        filter: `client_id=eq.${targetClientId}`
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

        const handleDeleteOrdersByMonth = async (monthsAgo: number) => {
            if (isDemo) {
                alert("No permitido en modo Demo");
                return;
            }
            const targetDate = new Date();
            targetDate.setMonth(targetDate.getMonth() - monthsAgo);
            const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString();
            const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

            const monthName = targetDate.toLocaleString('es-ES', { month: 'long' });

            if (!confirm(`¿Estás seguro de que quieres borrar TODOS los pedidos de ${monthName}? Esta acción no se puede deshacer.`)) return;

            try {
                const { supabase } = await import("@/lib/supabase");
                const { error } = await supabase
                    .from('orders')
                    .delete()
                    .eq('client_id', clientId)
                    .gte('created_at', startOfMonth)
                    .lte('created_at', endOfMonth);

                if (error) throw error;
                alert(`Pedidos de ${monthName} eliminados con éxito.`);
                window.location.reload();
            } catch (error: any) {
                console.error("Error delete orders:", error);
                alert("Error al eliminar: " + error.message);
            }
        };

        const handleDeleteOrdersByWeek = async () => {
            if (isDemo) {
                alert("No permitido en modo Demo");
                return;
            }
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - 7);
            const sevenDaysAgo = targetDate.toISOString();

            if (!confirm(`¿Estás seguro de que quieres borrar TODOS los pedidos de la última semana? Esta acción no se puede deshacer.`)) return;

            try {
                const { supabase } = await import("@/lib/supabase");
                const { error } = await supabase
                    .from('orders')
                    .delete()
                    .eq('client_id', clientId)
                    .lte('created_at', sevenDaysAgo);

                if (error) throw error;
                alert(`Pedidos antiguos eliminados con éxito.`);
                window.location.reload();
            } catch (error: any) {
                console.error("Error delete orders week:", error);
                alert("Error al eliminar: " + error.message);
            }
        };
        const totalCallsCount = loading ? 0 : calls.length;
        // Calcular tiempo real ahorrado (Suma de duraciones + 3 min gestión humana por llamada)
        const totalDurationSeconds = calls.reduce((acc, call) => acc + (Number(call.duration) || 0), 0) + (calls.length * 180);
        const timeSavedDisplay = totalDurationSeconds < 3600
            ? `${Math.round(totalDurationSeconds / 60)}m`
            : `${(totalDurationSeconds / 3600).toFixed(1)}h`;

        // Calcular Clientes Únicos
        const uniqueCustomers = new Set(calls.map(c => c.customer_phone)).size;

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
                        {/* SaraCalls Admin Dashboard v1.2 */}
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
                                            { label: 'Clientes Únicos', value: loading ? null : uniqueCustomers.toString(), trend: 'Detectados', color: CurrentTheme.accent, icon: UserPlus, tab: 'unique_clients' },
                                            { label: 'Tiempo Ahorrado', value: loading ? null : timeSavedDisplay, trend: 'En Gestión', color: 'purple', icon: Clock, tab: 'overview' }
                                        ].map((stat, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveTab(stat.tab as any)}
                                                className={`relative overflow-hidden rounded-[32px] p-8 transition-all duration-500 text-left group hover:scale-[1.02] border ${activeTab === stat.tab ? `bg-white/[0.08] border-${stat.color}-500/50 shadow-[0_0_30px_rgba(253,114,2,0.15)]` : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'}`}
                                            >
                                                <div className={`absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500 text-${stat.color}-500`}>
                                                    <stat.icon size={64} strokeWidth={1} />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/20 flex items-center justify-center mb-6 text-${stat.color}-500 group-hover:scale-110 transition-transform duration-500`}>
                                                        <stat.icon size={24} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-3xl font-black italic tracking-tighter text-white">
                                                            {stat.value || <div className="h-8 w-24 bg-white/10 rounded animate-pulse"></div>}
                                                        </h3>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                                                    </div>
                                                    {stat.trend && (
                                                        <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.trend.includes('+') ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-gray-400'
                                                            }`}>
                                                            {stat.trend.includes('+') ? <TrendingUp size={12} /> : <Activity size={12} />}
                                                            {stat.trend}
                                                        </div>
                                                    )}
                                                </div>
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
                                                ) : calls.slice(0, 4).map((call, idx) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        whileHover={{ y: -4 }}
                                                        key={call.id || idx}
                                                        className="group relative flex items-center gap-6 p-6 rounded-[32px] bg-white/[0.01] backdrop-blur-md border border-white/10 transition-all duration-700 hover:bg-white/[0.03] hover:border-white/20"
                                                    >
                                                        {/* Background Glow Effect */}
                                                        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                                        {/* Icon Section */}
                                                        <div className="relative z-10">
                                                            <div className="w-16 h-16 rounded-[24px] bg-[#0a0a0a] flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-all duration-500 shadow-2xl relative overflow-hidden">
                                                                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ background: `radial-gradient(circle at center, ${CurrentTheme.primary}, transparent)` }}></div>
                                                                <Mic size={24} className="relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12" style={{ color: CurrentTheme.primary }} />
                                                            </div>
                                                            {call.sentiment === 'En curso' && (
                                                                <div className="absolute -top-1 -right-1 flex h-4 w-4">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-[#0a0a0a]"></span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Info Section */}
                                                        <div className="flex-grow min-w-0 relative z-10">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h4 className="font-extrabold text-xl text-white/90 group-hover:text-white transition-colors tracking-tight truncate">
                                                                    {call.customer_name || 'Desconocido'}
                                                                </h4>
                                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-700 ${call.sentiment === 'Positivo' || call.sentiment === 'Confirmada' ? 'bg-green-500/10 text-green-400 border-green-500/20 group-hover:bg-green-500/20 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]' :
                                                                    call.sentiment === 'En curso' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:bg-blue-500/20' :
                                                                        'bg-white/5 text-gray-400 border-white/10 group-hover:bg-white/10'
                                                                    }`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${call.sentiment === 'Positivo' || call.sentiment === 'Confirmada' ? 'bg-green-400' :
                                                                        call.sentiment === 'En curso' ? 'bg-blue-400 animate-pulse' : 'bg-gray-500'
                                                                        }`}></div>
                                                                    {call.sentiment || 'Procesada'}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                                    <span className="opacity-50">Tel:</span>
                                                                    <span>{call.customer_phone}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="opacity-50">Dur:</span>
                                                                    <span style={{ color: CurrentTheme.primary }}>{call.duration ? `${Math.round(call.duration)}s` : '0s'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar size={12} className="opacity-50" />
                                                                    <span>{new Date(call.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions Section */}
                                                        <div className="relative z-10">
                                                            <button
                                                                onClick={() => setIsPlaying(isPlaying === idx ? null : idx)}
                                                                className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-700 transform ${isPlaying === idx
                                                                    ? 'text-white shadow-[0_0_30px_rgba(253,114,2,0.5)] scale-95'
                                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-110 active:scale-90 shadow-xl'
                                                                    }`}
                                                                style={isPlaying === idx ? { backgroundColor: CurrentTheme.primary } : {}}
                                                            >
                                                                {isPlaying === idx ? (
                                                                    <div className="flex items-end gap-1 h-4">
                                                                        <div className="w-1 bg-white animate-[music-pulse_1s_infinite_0s]"></div>
                                                                        <div className="w-1 bg-white animate-[music-pulse_1s_infinite_0.2s]"></div>
                                                                        <div className="w-1 bg-white animate-[music-pulse_1s_infinite_0.4s]"></div>
                                                                    </div>
                                                                ) : (
                                                                    <Play size={24} className="ml-1" fill="currentColor" />
                                                                )}
                                                            </button>
                                                        </div>

                                                        {/* Decorative Elements */}
                                                        <div className="absolute top-0 right-10 w-32 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                                        <div className="absolute bottom-0 left-10 w-32 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                                    </motion.div>
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
                            ) : activeTab === 'unique_clients' ? (
                                <motion.div
                                    key="unique_clients"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="glass rounded-[36px] bg-white/[0.02] border border-white/5 p-8"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black uppercase italic">Clientes Identificados</h2>
                                        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400">
                                            Total: {uniqueCustomers}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {Array.from(new Set(calls.map(c => c.customer_phone))).map((phone, idx) => {
                                            const clientCalls = calls.filter(c => c.customer_phone === phone);
                                            const lastCall = clientCalls[0];
                                            return (
                                                <div key={phone} className="group relative p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all duration-300">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent flex items-center justify-center border border-orange-500/20 text-orange-500">
                                                            <Users size={18} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-full text-gray-400">
                                                            {clientCalls.length} Llamadas
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white mb-1">{lastCall.customer_name || 'Desconocido'}</h4>
                                                    <p className="text-sm text-gray-400 font-mono mb-4">{phone}</p>
                                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                        <span>Última vez:</span>
                                                        <span>{new Date(lastCall.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
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
                                    className="glass rounded-[36px] bg-white/[0.02] border border-white/5 p-8 w-full"
                                >
                                    {industry === 'restaurant' ? (
                                        <div className="max-w-4xl">
                                            <div className="mb-8 flex flex-row items-center justify-between gap-4">
                                                <div>
                                                    <h2 className="text-3xl font-black uppercase italic text-white tracking-tight mb-2">Mantenimiento</h2>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Herramientas de limpieza de datos</p>
                                                </div>
                                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                                    <Database size={32} style={{ color: CurrentTheme.primary }} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="glass rounded-3xl p-6 border border-white/5 bg-white/[0.01]">
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                                        <Trash2 size={16} className="text-red-500" /> Pedidos y Cocina
                                                    </h3>
                                                    <div className="space-y-3">
                                                        <button
                                                            onClick={() => handleDeleteOrdersByWeek()}
                                                            className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-red-500/20"
                                                        >
                                                            Borrar Pedidos Semanal
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteOrdersByMonth(1)}
                                                            className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-red-500/20"
                                                        >
                                                            Borrar Pedidos Mes Pasado
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="glass rounded-3xl p-6 border border-white/5 bg-white/[0.01]">
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                                        <History size={16} className="text-blue-500" /> Llamadas y Prospectos
                                                    </h3>
                                                    <div className="space-y-3">
                                                        <button
                                                            onClick={() => handleDeleteCallsByMonth(1)}
                                                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10"
                                                        >
                                                            Borrar Llamadas Mes Pasado
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLeadsByMonth(1)}
                                                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10"
                                                        >
                                                            Borrar Leads Mes Pasado
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                                                <div className="flex items-start gap-4">
                                                    <AlertCircle size={20} className="text-blue-400 shrink-0 mt-1" />
                                                    <div>
                                                        <h4 className="text-xs font-black uppercase text-blue-400 mb-1">Información de Seguridad</h4>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed">
                                                            Las acciones de borrado son permanentes y no se pueden deshacer. Se recomienda realizar estas limpiezas al final de cada periodo contable para mantener el sistema ágil.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
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
                                                onDelete={deleteLead}
                                            />
                                        </>
                                    )}
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
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                            <div>
                                                <h2 className="text-2xl font-black uppercase italic">{orderView === 'today' ? 'Monitor de Cocina' : 'Historial de Pedidos'}</h2>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                                    {orderView === 'today' ? 'Pedidos recibidos hoy' : 'Todos los pedidos registrados'}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setOrderView('today')}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderView === 'today' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-gray-500'}`}
                                                >
                                                    Hoy
                                                </button>
                                                <button
                                                    onClick={() => setOrderView('history')}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderView === 'history' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-white/5 text-gray-500'}`}
                                                >
                                                    Historial
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid gap-6">
                                            {loading ? (
                                                <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
                                            ) : (() => {
                                                const renderOrderCard = (order: any, idx: number) => {
                                                    const noteLines = order.notes?.split('\n') || [];
                                                    const isDelivery = order.notes?.toLowerCase().includes('a domicilio');
                                                    const hasUtensils = order.notes?.toLowerCase().includes('utensilios: sí');

                                                    const addressLine = noteLines.find((l: string) => l.startsWith('Dir: ')) || '';
                                                    const address = addressLine.replace('Dir: ', '') || 'Sucursal';

                                                    const commentLine = noteLines.find((l: string) => l.startsWith('Comentarios: ')) || '';
                                                    const comments = commentLine.replace('Comentarios: ', '') || 'Sin comentarios adicionales';

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
                                                                        <div className="flex flex-col gap-1 text-gray-300 font-bold italic justify-center lg:justify-start">
                                                                            <div className="flex items-center gap-2">
                                                                                <Clock size={14} className="text-blue-400" />
                                                                                {new Date(order.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                            </div>
                                                                            <div className="text-[9px] text-gray-500 font-bold not-italic">
                                                                                {new Date(order.created_at || Date.now()).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="lg:col-span-6 space-y-6">
                                                                    <div className="flex flex-wrap items-center gap-3">
                                                                        <h4 className="text-2xl font-black italic uppercase tracking-tight text-white">{order.customer_name}</h4>
                                                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDelivery ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                                                            {isDelivery ? '🚀 A DOMICILIO' : '🥡 PARA RECOGER'}
                                                                        </div>
                                                                        {(comments.includes('[PROMO 2x1]') || (order.items && order.items.includes('[PROMO 2x1]'))) && (
                                                                            <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30 animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                                                                                🏷️ PROMO 2X1
                                                                            </div>
                                                                        )}
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
                                                };

                                                if (orderView === 'today') {
                                                    const monitorOrders = orders.filter(o =>
                                                        o.status !== 'Entregado' &&
                                                        new Date(o.created_at).toDateString() === new Date().toDateString()
                                                    );
                                                    if (monitorOrders.length === 0) {
                                                        return (
                                                            <div className="py-20 text-center glass rounded-[32px] border border-white/5 bg-white/[0.01]">
                                                                <Utensils size={48} className="mx-auto text-gray-700 mb-4 opacity-20" />
                                                                <p className="text-gray-500 uppercase text-xs font-bold tracking-widest">No hay pedidos en espera</p>
                                                            </div>
                                                        );
                                                    }
                                                    return monitorOrders.map((order, idx) => renderOrderCard(order, idx));
                                                } else {
                                                    const deliveredOrders = orders
                                                        .filter(o => o.status === 'Entregado')
                                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                                                    if (deliveredOrders.length === 0) {
                                                        return (
                                                            <div className="py-20 text-center glass rounded-[32px] border border-white/5 bg-white/[0.01]">
                                                                <Utensils size={48} className="mx-auto text-gray-700 mb-4 opacity-20" />
                                                                <p className="text-gray-500 uppercase text-xs font-bold tracking-widest">No hay pedidos completados</p>
                                                            </div>
                                                        );
                                                    }

                                                    const groups: { [key: string]: any[] } = {};
                                                    deliveredOrders.forEach(o => {
                                                        const date = new Date(o.created_at).toLocaleDateString('es-MX', {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'long'
                                                        });
                                                        if (!groups[date]) groups[date] = [];
                                                        groups[date].push(o);
                                                    });

                                                    return Object.entries(groups).map(([date, items]) => {
                                                        const isExpanded = expandedDates.includes(date);
                                                        return (
                                                            <div key={date} className="space-y-4">
                                                                <button
                                                                    onClick={() => toggleDate(date)}
                                                                    className="w-full flex items-center gap-4 px-4 py-2 group hover:bg-white/[0.02] transition-all rounded-2xl"
                                                                >
                                                                    <div className="h-px flex-grow bg-white/5 group-hover:bg-white/10"></div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-gray-300 whitespace-nowrap">{date}</h3>
                                                                        <ChevronDown
                                                                            size={12}
                                                                            className={`text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                                        />
                                                                    </div>
                                                                    <div className="h-px flex-grow bg-white/5 group-hover:bg-white/10"></div>
                                                                </button>
                                                                <AnimatePresence>
                                                                    {isExpanded && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.3 }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <div className="grid gap-6 pt-2">
                                                                                {items.map((order, idx) => renderOrderCard(order, idx))}
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        );
                                                    });
                                                }
                                            })()}
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
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Retell AI API Key</label>
                                                <input type="password" placeholder="retell_..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-[#FD7202] transition-colors outline-none" />
                                            </div>

                                            <div className="p-4 rounded-2xl bg-[#FD7202]/5 border border-[#FD7202]/10 space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                                    <Database size={12} className="text-orange-500" /> Webhook de Sincronización
                                                </label>
                                                <div className="flex gap-2">
                                                    <code className="flex-grow bg-black/40 p-3 rounded-lg text-[10px] text-orange-400 break-all select-all outline-none border border-orange-500/20">
                                                        {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhook?client_id={clientId}
                                                    </code>
                                                </div>
                                                <p className="text-[9px] text-gray-500 font-medium px-1 leading-relaxed">
                                                    Copia esta URL y pégala en <strong>Retell AI Dashboard {"->"} Webhooks</strong> para que Sara registre todas las llamadas y pedidos automáticamente en este panel.
                                                </p>
                                            </div>
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
                                    </div>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>
                </main>

                {/* Mobile Navigation Bar */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/10 px-6 py-4 flex justify-between items-center z-50">
                    {
                        [
                            { id: 'overview', icon: LayoutDashboard },
                            { id: 'calls', icon: Phone },
                            { id: 'leads', icon: industry === 'restaurant' ? Database : Users }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`p-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#FD7202] text-white shadow-[0_0_15px_rgba(253,114,2,0.4)]' : 'text-gray-500'}`}
                            >
                                <item.icon size={24} />
                            </button>
                        ))
                    }

                    {/* Botón Salir Mobile - Solo Admins */}
                    {
                        isAdminUser && (
                            <button
                                onClick={() => router.push('/super-admin')}
                                className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20"
                            >
                                <LogOut size={24} className="rotate-180" />
                            </button>
                        )
                    }
                </nav>

                {/* Modal de Historial de Cliente */}
                <AnimatePresence>
                    {
                        selectedHistory && (
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
                        )
                    }
                </AnimatePresence >
            </div >
        );
    }
