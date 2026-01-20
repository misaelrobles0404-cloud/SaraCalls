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
    Eye
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
import { LogOut } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'leads' | 'appointments' | 'orders' | 'settings'>('overview');
    const [isPlaying, setIsPlaying] = useState<number | null>(null);
    const [calls, setCalls] = useState<any[]>([
        { id: 1, customer_name: 'Juan Delgado', customer_phone: '+34 600... ', duration: '4m 20s', sentiment: 'Positivo', created_at: new Date().toISOString() },
        { id: 2, customer_name: 'Maria Rodriguez', customer_phone: '+34 611... ', duration: '2m 15s', sentiment: 'Confirmada', created_at: new Date().toISOString() }
    ]);
    const [leads, setLeads] = useState<any[]>([
        { id: 1, name: 'Lead 1', created_at: new Date().toISOString() },
        { id: 2, name: 'Lead 2', created_at: new Date().toISOString() }
    ]);
    const [appointments, setAppointments] = useState<any[]>([
        { id: 1, status: 'Confirmada', appointment_date: new Date().toISOString() }
    ]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [industry, setIndustry] = useState<'barber' | 'restaurant'>('restaurant');

    const [clientId, setClientId] = useState<string | null>(null);
    const [clientName, setClientName] = useState<string>("Admin");

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            setLoading(true);
            try {
                const { supabase } = await import("@/lib/supabase");

                // 1. Verificar Sesión Real
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push("/login");
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
                const [callsRes, leadsRes, appointmentsRes] = await Promise.all([
                    supabase.from('calls').select('*').eq('client_id', currentClientId).order('created_at', { ascending: false }),
                    supabase.from('leads').select('*').eq('client_id', currentClientId).order('created_at', { ascending: false }),
                    supabase.from('appointments').select('*').eq('client_id', currentClientId).order('appointment_date', { ascending: true })
                ]);

                if (callsRes.data) setCalls(callsRes.data);
                if (leadsRes.data) setLeads(leadsRes.data);
                if (appointmentsRes.data) setAppointments(appointmentsRes.data);

                // Mock orders for restaurant demo
                if (clientData.industry === 'restaurant') {
                    setOrders([
                        { id: 1, customer_name: 'Juan Pérez', items: '3x Spicy Tuna, 1x Miso', status: 'Preparando', order_number: 1024 },
                        { id: 2, customer_name: 'Maria Garcia', items: '2x California Roll', status: 'Listo', order_number: 1025 }
                    ]);
                }

                // 4. Suscripción Realtime Filtrada (Canal por Cliente)
                const channelId = `client_data_${currentClientId}`;
                const subscription = supabase
                    .channel(channelId)
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'calls',
                        filter: `client_id=eq.${currentClientId}`
                    }, payload => {
                        setCalls(prev => [payload.new, ...prev.filter((c: any) => c.id !== (payload.new as any).id)].slice(0, 10));
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
        router.push("/login");
    };

    const chartData = {
        datasets: [{
            data: [84, 16],
            backgroundColor: ['#FD7202', 'rgba(255, 255, 255, 0.1)'],
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        cutout: '85%',
        plugins: { legend: { display: false } },
        maintainAspectRatio: false,
        rotation: 270,
        circumference: 180,
    };

    // Calcular horas ahorradas (Cada llamada se estima en 5 minutos de trabajo humano administrativo)
    const totalCallsCount = loading ? 0 : calls.length;
    const hoursSaved = Math.round((totalCallsCount * 5) / 60);

    if (!isAuthorized && !loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD7202]"></div></div>;

    return (
        <div className="bg-[#050505] min-h-screen flex w-full font-sans text-white selection:bg-[#FD7202]/30">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 hidden lg:flex flex-col p-6 fixed h-full bg-black/40 backdrop-blur-2xl z-20">
                <div className="flex items-center gap-3 mb-10 px-2 transition-transform hover:scale-105 duration-300 cursor-pointer">
                    <BotMessageSquare className="text-[#FD7202] w-10 h-10 drop-shadow-[0_0_12px_rgba(253,114,2,0.6)]" />
                    <div>
                        <span className="text-xl font-black tracking-tight block leading-none">SaraCalls.<span className="text-[#FD7202]">ai</span></span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Control de Negocio</span>
                    </div>
                </div>

                <nav className="space-y-1 flex-grow">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 mb-2">Principal</p>
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
                        { id: 'calls', icon: Phone, label: 'Llamadas' },
                        { id: 'leads', icon: Users, label: 'Leads' },
                        industry === 'barber' ?
                            { id: 'appointments', icon: Calendar, label: 'Citas' } :
                            { id: 'orders', icon: LayoutDashboard, label: 'Pedidos' }
                    ].map((item: any) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id ? 'bg-[#FD7202]/10 text-[#FD7202] font-semibold border border-[#FD7202]/20 shadow-[0_0_15px_rgba(253,114,2,0.1)]' : 'hover:bg-white/5 text-gray-400'}`}
                        >
                            <item.icon size={18} /> {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/10 space-y-1">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 mb-2">Sistema</p>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-[#FD7202]/10 text-[#FD7202] font-semibold border border-[#FD7202]/20' : 'hover:bg-white/5 text-gray-400'}`}
                    >
                        <Settings size={18} /> Configuración
                    </button>


                    <div className="bg-white/5 rounded-2xl p-4 mt-6 border border-white/5">
                        <p className="text-xs text-gray-400 mb-2">Plan Enterprise</p>
                        <div className="w-full h-1.5 bg-white/10 rounded-full mb-2">
                            <div className="w-[75%] h-full bg-[#FD7202] rounded-full"></div>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">7,500 / 10,000 mins</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow lg:ml-64 p-4 lg:p-10 relative">
                {/* Header Profile */}
                <header className="flex justify-between items-center mb-10 glass p-6 rounded-[28px] border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <BotMessageSquare className="lg:hidden text-[#FD7202] w-10 h-10 drop-shadow-[0_0_8px_rgba(253,114,2,0.5)]" />
                        <div>
                            <h1 className="text-xl lg:text-2xl font-black uppercase italic tracking-tight">Panel de Control</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Sistema Operativo • Sara Online</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold">{clientName}</p>
                            <p className="text-[10px] text-[#FD7202] font-black uppercase">Role: Cliente Enterprise</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FD7202] to-orange-400 p-0.5 shadow-[0_0_20px_rgba(253,114,2,0.3)]">
                            <div className="w-full h-full rounded-[14px] bg-black flex items-center justify-center overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sara" alt="User" />
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
                                    { label: 'Total Llamadas', value: loading ? null : calls.length.toString(), trend: '+12%', color: 'blue', icon: PhoneCall, tab: 'calls' },
                                    industry === 'barber' ?
                                        { label: 'Citas Cerradas', value: loading ? null : appointments.filter(a => a.status === 'Confirmada').length.toString(), trend: '+8.4%', color: 'green', icon: CalendarCheck, tab: 'appointments' } :
                                        { label: 'Pedidos Hoy', value: loading ? null : orders.length.toString(), trend: '+15%', color: 'blue', icon: LayoutDashboard, tab: 'orders' },
                                    { label: 'Nuevos Leads', value: loading ? null : leads.length.toString(), trend: '+24%', color: 'orange', icon: UserPlus, tab: 'leads' },
                                    { label: 'Tiempo Ahorrado', value: loading ? null : `${hoursSaved}h`, trend: '∞', color: 'purple', icon: Clock, tab: 'overview' }
                                ].map((stat, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveTab(stat.tab as any)}
                                        className="relative group p-6 lg:p-8 rounded-[28px] lg:rounded-[32px] border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-500 text-left overflow-hidden ring-1 ring-white/5 hover:ring-[#FD7202]/30"
                                    >
                                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center mb-6 border border-${stat.color}-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                            <stat.icon size={20} className={`text-${stat.color}-400 lg:text-${stat.color}-400 group-hover:neon-text-${stat.color}`} />
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
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#FD7202]/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-[#FD7202]/10 transition-all"></div>
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
                                            <div key={call.id || idx} className="group flex items-center gap-5 p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-[#FD7202]/30 transition-all">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/10 group-hover:border-[#FD7202]/40 transition-all">
                                                    <Mic size={20} className="text-gray-500 group-hover:text-[#FD7202]" />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-bold text-lg">{call.customer_name || 'Desconocido'}</h4>
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${call.sentiment === 'Positivo' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>{call.sentiment || 'Procesada'}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium">{call.customer_phone} • {call.duration} • {new Date(call.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setIsPlaying(isPlaying === idx ? null : idx)}
                                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isPlaying === idx ? 'bg-[#FD7202] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                                    >
                                                        {isPlaying === idx ? <Volume2 size={20} /> : <Play size={20} />}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Conversion & Health */}
                                <div className="space-y-8">
                                    <div className="glass rounded-[36px] border border-white/5 p-8 bg-white/[0.02] flex flex-col items-center">
                                        <h2 className="text-lg font-black uppercase italic tracking-tight mb-8 w-full">Salud del Motor</h2>
                                        <div className="relative w-48 h-48 mb-6">
                                            <Doughnut data={chartData} options={chartOptions} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-5xl font-black italic">84%</span>
                                                <span className="text-[10px] font-black text-[#FD7202] uppercase tracking-[0.2em] mt-1">Eficiencia Operativa</span>
                                            </div>
                                        </div>
                                        <div className="w-full space-y-4">
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60A5FA]"></div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Latencia Media</span>
                                                </div>
                                                <span className="font-bold">640ms</span>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-[#FD7202] shadow-[0_0_8px_#FD7202]"></div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Uso de tokens</span>
                                                </div>
                                                <span className="font-bold">24%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass rounded-[36px] bg-gradient-to-br from-[#FD7202] to-[#FF9031] p-8 text-white relative overflow-hidden group">
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
                                            <tr key={call.id || idx} className="hover:bg-white/5 transition-colors group">
                                                <td className="py-4 px-4 font-semibold">{call.customer_name || 'Desconocido'}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${call.sentiment === 'Positivo' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'} border border-white/5`}>
                                                        {call.sentiment || 'Procesada'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-gray-400">{call.duration}</td>
                                                <td className="py-4 px-4">
                                                    <button className="p-2 hover:bg-[#FD7202]/20 rounded-lg text-gray-400 hover:text-[#FD7202]"><Play size={16} /></button>
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
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            <tr><td colSpan={3} className="py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD7202] mx-auto"></div></td></tr>
                                        ) : leads.length === 0 ? (
                                            <tr><td colSpan={3} className="py-10 text-center text-gray-500 uppercase text-[10px] font-bold tracking-widest">No hay leads registrados</td></tr>
                                        ) : leads.map((lead, idx) => (
                                            <tr key={lead.id || idx} className="hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-semibold">{lead.name}</td>
                                                <td className="py-4 px-4 text-gray-400">{lead.phone}</td>
                                                <td className="py-4 px-4 text-gray-400">{new Date(lead.created_at).toLocaleDateString()}</td>
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
                            <h2 className="text-2xl font-black uppercase italic mb-8">Agenda Dinámica</h2>
                            <div className="grid gap-4">
                                {loading ? (
                                    <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD7202]"></div></div>
                                ) : appointments.length === 0 ? (
                                    <p className="text-gray-500 text-center py-10 uppercase text-[10px] font-bold tracking-widest">No hay citas programadas</p>
                                ) : appointments.map((appt, idx) => (
                                    <div key={appt.id || idx} className="flex items-center gap-6 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#FD7202]/30 transition-all">
                                        <div className="text-lg font-black text-[#FD7202] w-24">
                                            {new Date(appt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-white">{appt.customer_name}</h4>
                                            <p className="text-gray-400 text-sm">{appt.service}</p>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${appt.status === 'Confirmada' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
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
                            className="glass rounded-[36px] bg-white/[0.02] border border-white/5 p-8"
                        >
                            <h2 className="text-2xl font-black uppercase italic mb-8">Pedidos de Sushi</h2>
                            <div className="grid gap-4">
                                {loading ? (
                                    <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
                                ) : orders.length === 0 ? (
                                    <p className="text-gray-500 text-center py-10 uppercase text-[10px] font-bold tracking-widest">No hay pedidos pendientes</p>
                                ) : orders.map((order: any, idx: number) => (
                                    <div key={order.id || idx} className="flex items-center gap-6 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all">
                                        <div className="text-lg font-black text-blue-500 w-24">#{order.order_number || idx + 100}</div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-white">{order.customer_name}</h4>
                                            <p className="text-gray-400 text-sm">{order.items || '2x California Roll, 1x Miso Soup'}</p>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${order.status === 'Preparando' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                            {order.status || 'Recibido'}
                                        </div>
                                    </div>
                                ))}
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
        </div>
    );
}
