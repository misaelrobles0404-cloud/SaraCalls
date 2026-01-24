"use client";

interface ClientHeaderProps {
    clientName: string;
    industry: string;
    currentTheme: {
        primary: string;
        icon: any;
    };
}

export function ClientHeader({ clientName, industry, currentTheme }: ClientHeaderProps) {
    const ThemeIcon = currentTheme.icon;

    return (
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center glass p-6 rounded-[28px] border border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl gap-6">
            <div className="flex items-center gap-4">
                <ThemeIcon size={40} className="lg:hidden" style={{ color: currentTheme.primary }} />
                <div>
                    <h1 className="text-xl lg:text-3xl font-black uppercase italic tracking-tight">Panel de Control</h1>
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
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${industry}`} alt="User" />
                    </div>
                </div>
            </div>
        </header>
    );
}
