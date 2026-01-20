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
    ShieldCheck
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
    const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'settings'>('overview');
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<any[]>([]);
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

                // 1. Verificar Sesión de Super Admin
                const { data: { session } } = await supabase.auth.getSession();
                if (!session || session.user.email !== "misaerobles0404@gmail.com") {
                    router.push("/admin");
                    return;
                }

                setIsAuthorized(true);

                // 2. Cargar Clientes y Estadísticas Usando la Vista
                const { data: clientData } = await supabase.from('agency_client_usage').select('*');
                const { data: leadsData } = await supabase.from('leads').select('id');
                const { data: globalSettings } = await supabase.from('agency_settings').select('*').single();

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
    }, [router]);

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
            <aside className="w-64 border-r border-white/10 hidden lg:flex flex-col p-6 fixed h-full bg-black/40 backdrop-blur-2xl z-20">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="bg-[#FD7202] p-2 rounded-xl shadow-[0_0_20px_rgba(253,114,2,0.4)]">
                        <ShieldCheck className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-lg font-black tracking-tight block">SARA.<span className="text-[#FD7202]">SUPER</span></span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Panel de Agencia</span>
                    </div>
                </div>

                <nav className="space-y-1 flex-grow">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Consumo Global' },
                        { id: 'clients', icon: Users, label: 'Mis Clientes' },
                        { id: 'settings', icon: Settings, label: 'Configuración' }
                    ].map((item: any) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id ? 'bg-[#FD7202]/10 text-[#FD7202] font-semibold border border-[#FD7202]/20' : 'hover:bg-white/5 text-gray-400'}`}
                        >
                            <item.icon size={18} /> {item.label}
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
            <main className="flex-grow lg:ml-64 p-4 lg:p-10 relative">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tight">Super Admin Dashboard</h1>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Gestión Centralizada • Misael Robles
                        </p>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' ? (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Minutos Totales', value: `${globalStats.totalMinutes}m`, icon: Clock, color: 'orange' },
                                    { label: 'Llamadas Agencia', value: globalStats.totalCalls, icon: PhoneCall, color: 'blue' },
                                    { label: 'Leads Capturados', value: globalStats.totalLeads, icon: UserPlus, color: 'green' },
                                    { label: 'Clientes Activos', value: globalStats.activeClients, icon: Zap, color: 'purple' }
                                ].map((stat, i) => (
                                    <div key={i} className="glass p-6 rounded-[32px] border border-white/5 bg-white/[0.03]">
                                        <stat.icon className={`text-${stat.color}-400 mb-4`} size={24} />
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                        <h3 className="text-3xl font-black mt-1">{stat.value}</h3>
                                    </div>
                                ))}
                            </div>

                            {/* Gráfica de Consumo */}
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
                    ) : activeTab === 'clients' ? (
                        <motion.div
                            key="clients"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
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
                                            <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                <td className="py-5 px-4">
                                                    <div className="font-bold text-white uppercase tracking-tight">{client.business_name}</div>
                                                    <div className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em]">{client.client_id.slice(0, 8)}...</div>
                                                </td>
                                                <td className="py-5 px-4 font-black text-[#FD7202]">{client.total_calls}</td>
                                                <td className="py-5 px-4 text-xs text-gray-400 font-bold uppercase">
                                                    {client.last_call ? new Date(client.last_call).toLocaleDateString() : 'Sin actividad'}
                                                </td>
                                                <td className="py-5 px-4">
                                                    <button className="p-2 hover:bg-[#FD7202]/10 rounded-lg text-gray-500 hover:text-white transition-all"><Eye size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
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
