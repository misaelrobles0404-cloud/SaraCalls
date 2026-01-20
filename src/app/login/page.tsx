"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BotMessageSquare, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Si ya está logueado, ir directo al admin
        const session = localStorage.getItem("sara_demo_session");
        if (session === "authorized") {
            router.push("/admin");
        }
    }, [router]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Contraseña Demo: SaraDemo2026
        if (password === "SaraDemo2026") {
            localStorage.setItem("sara_demo_session", "authorized");
            router.push("/admin");
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 font-sans">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FD7202]/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#FD7202] to-[#FF9031] rounded-[24px] flex items-center justify-center shadow-[0_0_40px_rgba(253,114,2,0.3)] mb-6">
                        <BotMessageSquare className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Acceso <span className="text-[#FD7202]">Demo</span></h1>
                    <p className="text-gray-500 text-sm mt-2 font-bold uppercase tracking-widest">SaraCalls.ai • Protocolo Seguro</p>
                </div>

                <div className="glass p-8 rounded-[32px] border border-white/5 bg-white/[0.02] shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Contraseña de Acceso</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FD7202] transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 pl-12 focus:border-[#FD7202] transition-all outline-none font-medium`}
                                />
                            </div>
                            {error && <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mt-2 px-1">Contraseña incorrecta. Inténtalo de nuevo.</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#FD7202] hover:bg-[#FF8A00] py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(253,114,2,0.2)]"
                        >
                            Entrar al Sistema <ArrowRight size={16} />
                        </button>
                    </form>
                </div>

                <p className="text-center mt-10 text-[9px] text-gray-600 font-bold uppercase tracking-[0.4em]">
                    SISTEMA PROTEGIDO POR AGENTES SARA
                </p>
            </motion.div>
        </div>
    );
}
