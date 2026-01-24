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
    X
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
    const [showMemoryGuide, setShowMemoryGuide] = useState(false);

    const [clientId, setClientId] = useState<string | null>(null);
    const [clientName, setClientName] = useState<string>("Admin");
    const [isDemo, setIsDemo] = useState(false);

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
                // PRIMERO: Verificar si hay una sesión bypass de demo
                const isDemoSession = document.cookie.includes('saracalls-demo-session=true') ||
                    localStorage.getItem('saracalls-demo') === 'true' ||
                    window.location.search.includes('demo=true');

                if (isDemoSession) {
                    console.log("🚀 SARA: Modo DEMO activado");
                    setIsAuthorized(true);
                    setIsDemo(true);
                    setClientName("Demo Experience");

                    // Recuperar industria persistente si existe
                    const savedIndustry = localStorage.getItem('saracalls-demo-industry');
                    if (savedIndustry) {
                        setIndustry(savedIndustry as any);
                    }

                    setLoading(false);
                    // Cargamos datos mock iniciales
                    setCalls([
                        { id: 1, customer_name: 'Juan Delgado', customer_phone: '+34 600... ', duration: '4m 20s', sentiment: 'Positivo', created_at: new Date().toISOString() },
                        { id: 2, customer_name: 'Maria Rodriguez', customer_phone: '+34 611... ', duration: '2m 15s', sentiment: 'Confirmada', created_at: new Date().toISOString() }
                    ]);
                    // Pedidos para restaurante
                    setOrders([
                        { id: 1, customer_name: 'Juan Pérez', items: '3x Spicy Tuna, 1x Miso', status: 'Preparando', order_number: 1024 },
                        { id: 2, customer_name: 'Maria Garcia', items: '2x California Roll', status: 'Listo', order_number: 1025 }
                    ]);
                    // Citas para barbería/clínica
                    setAppointments([
                        { id: 1, customer_name: 'Carlos Ruiz', service: 'Corte + Barba', status: 'Confirmada', appointment_date: new Date().toISOString() },
                        { id: 2, customer_name: 'Elena Sanz', service: 'Limpieza Dental', status: 'Pendiente', appointment_date: new Date().toISOString() }
                    ]);
                    // Leads para Demo
                    setLeads([
                        { id: 1, name: 'Juan Manuel', phone: '+34 600 111 222', created_at: new Date().toISOString() },
                        { id: 2, name: 'Sofía Martínez', phone: '+34 622 333 444', created_at: new Date().toISOString() }
                    ]);
                    return;
                }

                const { supabase } = await import("@/lib/supabase");

                // 2. Verificar Sesión Real si no es demo
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    return;
                }

                // Si es el Super Admin, mandarlo a su panel central de forma infalible
                const isAdmin = session.user.email === "misaerobles0404@gmail.com" ||
                    session.user.email === "misaelrobles0404@gmail.com";

                if (isAdmin) {
                    window.location.href = "/super-admin";
                    return;
                }

                setIsAuthorized(true);

                // 2. Obtener Client ID vinculado al Auth User ID
                const { data: clientData, error: clientError } = await supabase
                    .from('clients')
                    .select('id, business_name, industry')
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
    const totalCallsCount = loading ? 0 : calls.length;
    const hoursSaved = Math.round((totalCallsCount * 5) / 60);

    if (!isAuthorized && !loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD7202]"></div></div>;

    return (
        <div className="bg-[#050505] min-h-screen flex w-full font-sans text-white selection:bg-[#FD7202]/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 hidden lg:flex flex-col p-6 fixed h-full bg-black/40 backdrop-blur-2xl z-20">
                <div className="flex items-center gap-3 mb-10 px-2 transition-transform hover:scale-105 duration-300 cursor-pointer">
                    <ThemeIcon size={40} style={{ color: CurrentTheme.primary, filter: `drop-shadow(0 0 8px ${CurrentTheme.primary}88)` }} />
                    <div>
                        <span className="text-xl font-black tracking-tight block leading-none">SaraCalls.<span style={{ color: CurrentTheme.primary }}>ai</span></span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Control de Negocio</span>
                    </div>
                </div>

                <nav className="space-y-1 flex-grow">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 mb-2">Principal</p>
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
                        { id: 'calls', icon: Phone, label: 'Llamadas' },
                        { id: 'leads', icon: Users, label: 'Leads' },
                        industry === 'restaurant' ?
                            { id: 'orders', icon: LayoutDashboard, label: 'Pedidos' } :
                            { id: 'appointments', icon: Calendar, label: industry === 'restaurant_res' ? 'Reservas' : 'Citas' }
                    ].map((item: any) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === item.id ? `bg-white/5 font-semibold border border-white/10 shadow-[0_0_20px_rgba(253,114,2,0.05)]` : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}`}
                            style={activeTab === item.id ? { color: CurrentTheme.primary, borderColor: `${CurrentTheme.primary}33`, backgroundColor: `${CurrentTheme.primary}11` } : {}}
                        >
                            <item.icon size={18} className={activeTab === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/10 space-y-1">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 mb-2">Sistema</p>
                    {/* El botón de configuración técnica ha sido movido al Super Admin Panel */}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all text-sm font-bold"
                    >
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow lg:ml-64 p-4 lg:p-10 relative overflow-x-hidden">
                {/* Decorative Glow Dinámico */}
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${CurrentTheme.glow} blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse`}></div>

                {/* Header Profile */}
                <header className="mb-10 flex flex-col md:flex-row justify-between items-center glass p-6 rounded-[28px] border border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl gap-6">
                    <div className="flex items-center gap-4">
                        <ThemeIcon size={40} className="lg:hidden" style={{ color: CurrentTheme.primary }} />
                        <div>
                            <h1 className="text-xl lg:text-3xl font-black uppercase italic tracking-tight">Panel de Control</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: CurrentTheme.primary }}></span>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{clientName} • Sistema SaraCalls</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Borrado Mensual para el Cliente */}
                        <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-2 px-3" style={{ color: CurrentTheme.primary }}>
                                <AlertCircle size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Limpiar Historial</span>
                            </div>
                            <div className="flex gap-1">
                                {[
                                    { label: 'Mes Pasado', val: 1 },
                                    { label: 'Hace 2m', val: 2 }
                                ].map((m) => (
                                    <button
                                        key={m.val}
                                        onClick={async () => {
                                            const targetDate = new Date();
                                            targetDate.setMonth(targetDate.getMonth() - m.val);
                                            const monthName = targetDate.toLocaleString('es-ES', { month: 'long' });

                                            if (confirm(`¿Estás seguro de que deseas eliminar las llamadas de ${monthName}? Esta acción no se puede deshacer.`)) {
                                                const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString();
                                                const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

                                                try {
                                                    const { supabase } = await import("@/lib/supabase");
                                                    const { error } = await supabase
                                                        .from('calls')
                                                        .delete()
                                                        .eq('client_id', clientId)
                                                        .gte('created_at', firstDay)
                                                        .lte('created_at', lastDay);

                                                    if (error) throw error;
                                                    alert(`Historial de ${monthName} eliminado correctamente.`);
                                                } catch (err) {
                                                    console.error("Error al borrar historial:", err);
                                                    alert("Error al eliminar los registros.");
                                                }
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all flex items-center gap-2"
                                    >
                                        <Trash2 size={12} /> {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Borrado de Leads para el Cliente */}
                        <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-2 px-3 text-orange-400">
                                <UserPlus size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Limpiar Leads</span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={async () => {
                                        const targetDate = new Date();
                                        targetDate.setMonth(targetDate.getMonth() - 2);
                                        const monthName = targetDate.toLocaleString('es-ES', { month: 'long' });

                                        if (confirm(`¿Estás seguro de que deseas eliminar los LEADS de hace 2 meses (${monthName})? Esta acción no se puede deshacer.`)) {
                                            const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString();
                                            const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

                                            try {
                                                const { supabase } = await import("@/lib/supabase");
                                                const { error } = await supabase
                                                    .from('leads')
                                                    .delete()
                                                    .eq('client_id', clientId)
                                                    .gte('created_at', firstDay)
                                                    .lte('created_at', lastDay);

                                                if (error) throw error;
                                                alert(`Leads de ${monthName} eliminados correctamente.`);
                                            } catch (err) {
                                                console.error("Error al borrar leads:", err);
                                                alert("Error al eliminar los registros.");
                                            }
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-orange-500/20 hover:text-orange-500 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all flex items-center gap-2"
                                >
                                    <Trash2 size={12} /> Hace 2m
                                </button>
                            </div>
                        </div>

                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold">{clientName}</p>
                            <p className="text-[10px] font-black uppercase" style={{ color: CurrentTheme.primary }}>Role: Cliente Enterprise</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl p-0.5 shadow-2xl" style={{ background: `linear-gradient(to top right, ${CurrentTheme.primary}, #fff3)` }}>
                            <div className="w-full h-full rounded-[14px] bg-black flex items-center justify-center overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${industry}`} alt="User" />
                            </div>
                        </div>
                    </div>
                </header>

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
                                            style={{ backgroundColor: `${CurrentTheme.primary}15`, borderColor: `${CurrentTheme.primary}33` }}>
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
                                        <button onClick={() => setActiveTab('calls')} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all">Ver Historial Completo</button>
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
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                                            <th className="pb-4 px-4">Cliente</th>
                                            <th className="pb-4 px-4">Sentimiento</th>
                                            <th className="pb-4 px-4">Duración</th>
                                            <th className="pb-4 px-4">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            <tr><td colSpan={4} className="py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD7202] mx-auto"></div></td></tr>
                                        ) : calls.length === 0 ? (
                                            <tr><td colSpan={4} className="py-10 text-center text-gray-500 uppercase text-[10px] font-bold tracking-widest">No hay registros de llamadas</td></tr>
                                        ) : calls.map((call, idx) => (
                                            <tr key={call.id || idx} className="hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer border-l-2 border-transparent hover:border-[#FD7202] relative overflow-hidden">
                                                <td className="py-5 px-4 font-semibold text-gray-200 group-hover:text-white transition-colors">{call.customer_name || 'Desconocido'}</td>
                                                <td className="py-5 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${call.sentiment === 'Positivo' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-white/10'} border`}>
                                                        {call.sentiment || 'Procesada'}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-4 text-gray-400 group-hover:text-gray-300">{call.duration}</td>
                                                <td className="py-5 px-4">
                                                    <button className="p-2.5 bg-white/5 hover:bg-[#FD7202] rounded-xl text-gray-400 hover:text-white transition-all transform group-hover:scale-110"><Play size={16} fill="currentColor" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : activeTab === 'leads' ? (
                        <motion.div
                            key="leads"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass rounded-[36px] bg-white/[0.02] border border-white/5 p-8"
                        >
                            <h2 className="text-2xl font-black uppercase italic mb-8">Gestión de Leads</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                                            <th className="pb-4 px-4">Nombre</th>
                                            <th className="pb-4 px-4">Teléfono</th>
                                            <th className="pb-4 px-4">Fecha</th>
                                            <th className="pb-4 px-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            <tr><td colSpan={4} className="py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD7202] mx-auto"></div></td></tr>
                                        ) : leads.length === 0 ? (
                                            <tr><td colSpan={4} className="py-10 text-center text-gray-500 uppercase text-[10px] font-bold tracking-widest">No hay leads registrados</td></tr>
                                        ) : leads.map((lead, idx) => (
                                            <tr key={lead.id || idx} className="hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer border-l-2 border-transparent hover:border-[#FD7202]">
                                                <td className="py-5 px-4 font-semibold text-gray-200 group-hover:text-white transition-colors">{lead.name}</td>
                                                <td className="py-5 px-4 text-gray-400 group-hover:text-gray-300">{lead.phone}</td>
                                                <td className="py-5 px-4 text-gray-400 group-hover:text-gray-300 font-mono text-xs">{new Date(lead.created_at).toLocaleDateString()}</td>
                                                <td className="py-5 px-4 text-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteLead(lead.id);
                                                        }}
                                                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                                        <h2 className="text-2xl font-black uppercase italic">Comandat de Sushi (Cocina)</h2>
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
                                    ) : orders.map((order: any, idx: number) => (
                                        <div key={order.id || idx} className="group relative glass rounded-[32px] border border-white/5 bg-white/[0.02] p-6 transition-all duration-500 hover:bg-white/[0.04]">
                                            <button
                                                onClick={() => deleteOrder(order.id)}
                                                className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20"
                                            >
                                                <Trash2 size={14} />
                                            </button>

                                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                                <div className="flex-shrink-0">
                                                    <div className="text-3xl font-black text-blue-500 tabular-nums drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                                                        #{order.order_number || idx + 100}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">
                                                        {new Date(order.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>

                                                <div className="flex-grow space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-bold text-lg text-white">{order.customer_name}</h4>
                                                        <span className="text-xs text-gray-500 font-medium">{order.customer_phone}</span>
                                                    </div>
                                                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                                        <p className="text-sm text-gray-300 font-medium leading-relaxed italic">
                                                            {order.items || 'Cargando detalle del pedido...'}
                                                        </p>
                                                    </div>
                                                    {order.notes && (
                                                        <div className="flex items-start gap-2 text-[10px] text-orange-400 font-bold uppercase tracking-tight">
                                                            <AlertCircle size={12} className="mt-0.5" />
                                                            <span>NOTA: {order.notes}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-3 min-w-[200px]">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estado</span>
                                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${order.status === 'Pendiente' ? 'bg-orange-500/10 text-orange-500' :
                                                            order.status === 'Preparando' ? 'bg-blue-500/10 text-blue-500' :
                                                                order.status === 'Listo' ? 'bg-green-500/10 text-green-500' :
                                                                    'bg-purple-500/10 text-purple-500'
                                                            }`}>
                                                            {order.status || 'Pendiente'}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            { label: 'Cocina', val: 'Preparando', color: 'blue' },
                                                            { label: 'Listo', val: 'Listo', color: 'green' },
                                                            { label: 'Entregado', val: 'Entregado', color: 'purple' },
                                                            { label: 'Espera', val: 'Pendiente', color: 'orange' }
                                                        ].map((st) => (
                                                            <button
                                                                key={st.val}
                                                                onClick={() => updateOrderStatus(order.id, st.val)}
                                                                className={`px-2 py-2 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all ${order.status === st.val
                                                                    ? `bg-${st.color}-500 text-white shadow-lg`
                                                                    : `bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300`
                                                                    }`}
                                                            >
                                                                {st.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="text-right mt-1">
                                                        <span className="text-lg font-black text-white tabular-nums">${order.total_price || (idx * 15 + 20).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                                <button className="w-full bg-[#FD7202] py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors mt-4">Guardar Cambios</button>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">Documentación y Ayuda</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        onClick={() => setShowMemoryGuide(true)}
                                        className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center justify-between group transition-all text-left w-full"
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
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Memory Guide Modal */}
                <AnimatePresence>
                    {showMemoryGuide && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowMemoryGuide(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-4xl max-h-[85vh] bg-[#0A0A0A] border border-white/10 rounded-[40px] overflow-hidden flex flex-col shadow-2xl"
                            >
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                    <div>
                                        <h3 className="text-2xl font-black uppercase italic text-white flex items-center gap-3">
                                            Guía de Memoria de <span className="text-[#FD7202]">IA</span>
                                        </h3>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Cómo Sara reconoce a tus clientes</p>
                                    </div>
                                    <button
                                        onClick={() => setShowMemoryGuide(false)}
                                        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-gray-400"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-8 overflow-y-auto custom-scrollbar">
                                    <div className="prose prose-invert prose-orange max-w-none space-y-10 text-gray-400 leading-relaxed font-medium">
                                        <section className="space-y-4">
                                            <div className="flex items-center gap-3 text-white mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-[#FD7202]/20 flex items-center justify-center text-[#FD7202]">
                                                    <Database size={16} />
                                                </div>
                                                <h4 className="font-black uppercase italic tracking-wider">1. ¿Qué es la Memoria de Sara?</h4>
                                            </div>
                                            <p>A diferencia de los asistentes de voz tradicionales, Sara no empieza cada llamada desde cero. Su memoria se divide en dos capas principales:</p>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                                    <h5 className="text-white font-bold mb-2">Corto Plazo</h5>
                                                    <p className="text-xs">Sara mantiene el hilo de la conversación actual. Entiende referencias como "ese plato" o "la cita de antes" en tiempo real.</p>
                                                </div>
                                                <div className="p-6 rounded-3xl bg-[#FD7202]/5 border border-[#FD7202]/10">
                                                    <h5 className="text-[#FD7202] font-bold mb-2">Largo Plazo</h5>
                                                    <p className="text-xs">Sara utiliza tu base de datos en Supabase para identificar clientes por su teléfono y recordar sus preferencias históricas.</p>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-4">
                                            <div className="flex items-center gap-3 text-white mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-[#FD7202]/20 flex items-center justify-center text-[#FD7202]">
                                                    <Zap size={16} />
                                                </div>
                                                <h4 className="font-black uppercase italic tracking-wider">2. Cómo se implementa</h4>
                                            </div>
                                            <div className="space-y-3">
                                                {[
                                                    { step: "01", text: "El webhook de Retell AI captura el número entrante." },
                                                    { step: "02", text: "Se realiza una consulta automática a la tabla de Leads." },
                                                    { step: "03", text: "Se inyecta contexto personalizado al prompt de Sara." },
                                                    { step: "04", text: "Sara saluda proactivamente reconociendo al cliente." }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                        <span className="text-[#FD7202] font-black italic text-xs mt-0.5">{item.step}</span>
                                                        <p className="text-xs">{item.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        <section className="p-8 bg-gradient-to-br from-[#FD7202]/10 to-transparent border border-[#FD7202]/20 rounded-[32px] italic">
                                            <p className="text-sm text-white/90">"Una IA que recuerda es una IA que vende. El 70% de los clientes prefieren servicios que demuestran conocer su historial e intereses previos."</p>
                                        </section>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-end gap-4">
                                    <button
                                        onClick={() => setShowMemoryGuide(false)}
                                        className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] transition-all"
                                    >
                                        Cerrar Guía
                                    </button>
                                </div>
                            </motion.div>
                        </div>
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
            </main>

            {/* Mobile Navigation Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/10 px-6 py-4 flex justify-between items-center z-50">
                {[
                    { id: 'overview', icon: LayoutDashboard },
                    { id: 'calls', icon: Phone },
                    { id: 'leads', icon: Users },
                    { id: 'settings', icon: Settings }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`p-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#FD7202] text-white shadow-[0_0_15px_rgba(253,114,2,0.4)]' : 'text-gray-500'}`}
                    >
                        <item.icon size={24} />
                    </button>
                ))}
            </nav>
        </div >
    );
}
