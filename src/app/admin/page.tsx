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

                    // Si no hay previewId, simplemente permitimos el acceso con datos vacíos o genéricos
                    setClientName(`Showroom ${forceIndustry || 'General'}`);

                    // Inyectar datos MOCK para que no se vea vacío el showroom
                    setCalls([
                        { id: 101, customer_name: 'Rubén García', customer_phone: '+34 655 123 456', duration: '3m 45s', sentiment: 'Positivo', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
                        { id: 102, customer_name: 'Marta Sanz', customer_phone: '+34 677 888 999', duration: '5m 12s', sentiment: 'Confirmada', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
                        { id: 103, customer_name: 'Luis Méndez', customer_phone: '+34 600 000 111', duration: '1m 20s', sentiment: 'Neutral', created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString() }
                    ]);

                    setLeads([
                        { id: 201, name: 'Ana Belén', phone: '+34 611 222 333', created_at: new Date(Date.now() - 86400000).toISOString() },
                        { id: 202, name: 'Pedro J.', phone: '+34 688 777 666', created_at: new Date(Date.now() - 86400000 * 2).toISOString() }
                    ]);

                    if (forceIndustry === 'restaurant' || forceIndustry === 'restaurant_res') {
                        setOrders([
                            { id: 301, customer_name: 'Sara M.', items: '2x Roll California, 1x Ramen Tonkotsu', status: 'Preparando', order_number: 108, total_price: 34.50 },
                            { id: 302, customer_name: 'Jorge V.', items: '1x Nigiri Mix (12pcs)', status: 'Listo', order_number: 109, total_price: 22.00 }
                        ]);
                    } else {
                        setAppointments([
                            { id: 401, customer_name: 'Elena F.', service: forceIndustry === 'clinic' ? 'Limpieza Dental' : 'Corte + Barba', status: 'Confirmada', appointment_date: new Date(Date.now() + 3600000).toISOString() },
                            { id: 402, customer_name: 'Carlos T.', service: forceIndustry === 'clinic' ? 'Consulta General' : 'Corte Estilo', status: 'Pendiente', appointment_date: new Date(Date.now() + 7200000).toISOString() }
                        ]);
                    }

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
            />

            {/* Main Content */}
            <main className="flex-grow lg:ml-64 p-4 lg:p-10 relative overflow-x-hidden">
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

                        <div className="flex gap-2">
                            {[
                                { id: 'restaurant', label: 'Restaurante', icon: Utensils },
                                { id: 'barber', label: 'Barbería', icon: Scissors },
                                { id: 'clinic', label: 'Clínica', icon: Stethoscope },
                                { id: 'restaurant_res', label: 'Restaurante Gourmet', icon: Wine }
                            ].map((ind) => (
                                <button
                                    key={ind.id}
                                    onClick={() => setIndustry(ind.id as any)}
                                    className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${industry === ind.id ? 'bg-[#FD7202] text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <ind.icon size={14} /> {ind.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Header Profile */}
                <ClientHeader
                    clientName={clientName}
                    industry={industry}
                    logoUrl={logoUrl}
                    currentTheme={CurrentTheme}
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
                                        <div className="flex gap-2">
                                            <button
                                                onClick={fetchHistory}
                                                className="px-4 py-2 rounded-xl bg-[#FD7202]/10 hover:bg-[#FD7202] text-[#FD7202] hover:text-white text-[10px] font-black uppercase tracking-widest transition-all border border-[#FD7202]/20"
                                            >
                                                Ver Historial
                                            </button>
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
        </div >
    );
}
