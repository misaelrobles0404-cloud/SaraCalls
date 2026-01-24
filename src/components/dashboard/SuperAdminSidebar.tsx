"use client";

import {
    LayoutDashboard,
    Users,
    UserPlus,
    Settings,
    BotMessageSquare,
    LogOut,
    BookOpen,
    Zap,
    X
} from "lucide-react";

interface SuperAdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    handleLogout: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export function SuperAdminSidebar({ activeTab, setActiveTab, handleLogout, isOpen, onClose }: SuperAdminSidebarProps) {
    const menuItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Consumo Global' },
        { id: 'clients', icon: Users, label: 'Mis Clientes' },
        { id: 'sales', icon: UserPlus, label: 'Prospectos Web' },
        { id: 'industries', icon: Zap, label: 'Laboratorio UI' },
        { id: 'knowledge', icon: BookOpen, label: 'Knowledge Hub' },
        { id: 'settings', icon: Settings, label: 'Configuración' }
    ];

    return (
        <>
            {/* Overlay para móvil */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`w-64 border-r border-white/10 flex flex-col p-6 fixed h-full bg-black/40 backdrop-blur-3xl z-[110] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between mb-10 px-2 lg:block">
                    <div className="flex items-center gap-3 transition-transform hover:scale-105 duration-300">
                        <BotMessageSquare className="text-[#FD7202] w-10 h-10 drop-shadow-[0_0_12px_rgba(253,114,2,0.6)]" />
                        <div>
                            <span className="text-xl font-black tracking-tight block leading-none">SaraCalls.<span className="text-[#FD7202]">ai</span></span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Agency Master</span>
                        </div>
                    </div>

                    <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="space-y-1 flex-grow">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (onClose) onClose();
                            }}
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
        </>
    );
}
