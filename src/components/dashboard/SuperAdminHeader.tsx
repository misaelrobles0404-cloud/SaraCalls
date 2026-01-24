"use client";

import { BotMessageSquare, ShieldCheck } from "lucide-react";

export function SuperAdminHeader() {
    return (
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center glass p-6 rounded-[28px] border border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl gap-6">
            <div className="flex items-center gap-4">
                <BotMessageSquare className="lg:hidden text-[#FD7202] w-10 h-10 drop-shadow-[0_0_8px_rgba(253,114,2,0.5)]" />
                <div>
                    <h1 className="text-xl lg:text-3xl font-black uppercase italic tracking-tight">Gestión de Agencia</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FD7202] animate-pulse"></span>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Panel Maestro • Acceso Restringido</p>
                    </div>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                <ShieldCheck className="text-green-500" size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Misael Robles</span>
            </div>
        </header>
    );
}
