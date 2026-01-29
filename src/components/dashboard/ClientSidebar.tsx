"use client";

import {
    LayoutDashboard,
    Phone,
    Users,
    Calendar,
    LogOut,
    X,
    Database
} from "lucide-react";

interface ClientSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    industry: string;
    clientName: string;
    logoUrl?: string;
    handleLogout: () => void;
    currentTheme: {
        primary: string;
        icon: any;
    };
    isOpen?: boolean;
    onClose?: () => void;
}

export function ClientSidebar({
    activeTab,
    setActiveTab,
    industry,
    logoUrl,
    handleLogout,
    currentTheme,
    isOpen,
    onClose
}: ClientSidebarProps) {
    const ThemeIcon = currentTheme.icon;

    const menuItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'calls', icon: Phone, label: 'Llamadas' },
        {
            id: 'leads',
            icon: industry === 'restaurant' ? Database : Users,
            label: industry === 'restaurant' ? 'Mantenimiento' : 'Clientes'
        },
        industry === 'restaurant' ?
            { id: 'orders', icon: LayoutDashboard, label: 'Pedidos' } :
            { id: 'appointments', icon: Calendar, label: industry === 'restaurant_res' ? 'Reservas' : 'Citas' }
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

            <aside className={`w-64 border-r border-white/10 flex flex-col p-6 fixed h-full bg-black/40 backdrop-blur-2xl z-[110] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between mb-10 px-2 lg:block">
                    <div className="flex items-center gap-3 transition-transform hover:scale-105 duration-300 cursor-pointer">
                        {logoUrl ? (
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <ThemeIcon size={40} style={{ color: currentTheme.primary, filter: `drop-shadow(0 0 8px ${currentTheme.primary}88)` }} />
                        )}
                        <div>
                            <span className="text-xl font-black tracking-tight block leading-none">SaraCalls.<span style={{ color: currentTheme.primary }}>ai</span></span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Control de Negocio</span>
                        </div>
                    </div>

                    <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="space-y-1 flex-grow">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 mb-2">Principal</p>
                    {menuItems.map((item: any) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (onClose) onClose();
                            }}
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
        </>
    );
}
