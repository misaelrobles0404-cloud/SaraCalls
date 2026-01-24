"use client";

import {
    LayoutDashboard,
    Phone,
    Users,
    Calendar,
    LogOut
} from "lucide-react";

interface ClientSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    industry: string;
    clientName: string;
    handleLogout: () => void;
    currentTheme: {
        primary: string;
        icon: any;
    };
}

export function ClientSidebar({
    activeTab,
    setActiveTab,
    industry,
    handleLogout,
    currentTheme
}: ClientSidebarProps) {
    const ThemeIcon = currentTheme.icon;

    const menuItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'calls', icon: Phone, label: 'Llamadas' },
        { id: 'leads', icon: Users, label: 'Leads' },
        industry === 'restaurant' ?
            { id: 'orders', icon: LayoutDashboard, label: 'Pedidos' } :
            { id: 'appointments', icon: Calendar, label: industry === 'restaurant_res' ? 'Reservas' : 'Citas' }
    ];

    return (
        <aside className="w-64 border-r border-white/10 hidden lg:flex flex-col p-6 fixed h-full bg-black/40 backdrop-blur-2xl z-20">
            <div className="flex items-center gap-3 mb-10 px-2 transition-transform hover:scale-105 duration-300 cursor-pointer">
                <ThemeIcon size={40} style={{ color: currentTheme.primary, filter: `drop-shadow(0 0 8px ${currentTheme.primary}88)` }} />
                <div>
                    <span className="text-xl font-black tracking-tight block leading-none">SaraCalls.<span style={{ color: currentTheme.primary }}>ai</span></span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Control de Negocio</span>
                </div>
            </div>

            <nav className="space-y-1 flex-grow">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 mb-2">Principal</p>
                {menuItems.map((item: any) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === item.id ? `bg-white/5 font-semibold border border-white/10 shadow-[0_0_20px_rgba(253,114,2,0.05)]` : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}`}
                        style={activeTab === item.id ? { color: currentTheme.primary, borderColor: `${currentTheme.primary}33`, backgroundColor: `${currentTheme.primary}11` } : {}}
                    >
                        <item.icon size={18} className={activeTab === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                        <span className="text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10 space-y-1">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 mb-2">Sistema</p>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all text-sm font-bold"
                >
                    <LogOut size={18} /> Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
