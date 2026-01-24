"use client";

import { Menu } from "lucide-react";

interface ClientHeaderProps {
    clientName: string;
    industry: string;
    logoUrl?: string;
    currentTheme: {
        primary: string;
        icon: any;
    };
    onMenuClick?: () => void;
}

export function ClientHeader({ clientName, industry, logoUrl, currentTheme, onMenuClick }: ClientHeaderProps) {
    const ThemeIcon = currentTheme.icon;

    return (
        <header className="mb-6 lg:mb-10 flex flex-row justify-between items-center glass p-4 lg:p-6 rounded-[24px] lg:rounded-[28px] border border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl gap-4">
            <div className="flex items-center gap-3 lg:gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-gray-400 hover:text-white"
                >
                    <Menu size={24} />
                </button>
                <ThemeIcon size={32} className="lg:hidden" style={{ color: currentTheme.primary }} />
                <div>
                    <h1 className="text-lg lg:text-3xl font-black uppercase italic tracking-tight">Panel de Control</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentTheme.primary }}></span>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{clientName} • Sistema SaraCalls</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                    <p className="text-sm font-bold">{clientName}</p>
                    <p className="text-[10px] font-black uppercase" style={{ color: currentTheme.primary }}>Role: Cliente Enterprise</p>
                </div>
                <div className="w-12 h-12 rounded-2xl p-0.5 shadow-2xl" style={{ background: `linear-gradient(to top right, ${currentTheme.primary}, #fff3)` }}>
                    <div className="w-full h-full rounded-[14px] bg-black flex items-center justify-center overflow-hidden">
                        <img src={logoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${industry}`} alt="User Logo" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </header>
    );
}
