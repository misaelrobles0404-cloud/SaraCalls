"use client";

import {
    LayoutDashboard,
    Users,
    UserPlus,
    Settings,
    BotMessageSquare,
    LogOut,
    BookOpen
} from "lucide-react";

interface SuperAdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    handleLogout: () => void;
}

export function SuperAdminSidebar({ activeTab, setActiveTab, handleLogout }: SuperAdminSidebarProps) {
    const menuItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Consumo Global' },
        { id: 'clients', icon: Users, label: 'Mis Clientes' },
        { id: 'sales', icon: UserPlus, label: 'Prospectos Web' },
        { id: 'knowledge', icon: BookOpen, label: 'Knowledge Hub' },
        { id: 'settings', icon: Settings, label: 'Configuración' }
    ];

    return (
        <aside className="w-64 border-r border-white/10 hidden lg:flex flex-col p-6 fixed h-full bg-black/40 backdrop-blur-3xl z-20">
            <div className="flex items-center gap-3 mb-10 px-2 transition-transform hover:scale-105 duration-300">
                <BotMessageSquare className="text-[#FD7202] w-10 h-10 drop-shadow-[0_0_12px_rgba(253,114,2,0.6)]" />
                <div>
                    <span className="text-xl font-black tracking-tight block leading-none">SaraCalls.<span className="text-[#FD7202]">ai</span></span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Agency Master</span>
                </div>
            </div>

            <nav className="space-y-1 flex-grow">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
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
    );
}
