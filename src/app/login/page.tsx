"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BotMessageSquare, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { supabase } = await import("@/lib/supabase");
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                console.log("Sesión detectada para:", session.user.email);
                const isAdmin = session.user.email === "misaerobles0404@gmail.com" ||
                    session.user.email === "misaelrobles0404@gmail.com";
                if (isAdmin) {
                    window.location.href = "/super-admin";
                } else {
                    router.push("/admin");
                }
            }
        };
        checkSession();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { supabase } = await import("@/lib/supabase");
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (authError) {
                console.error("Auth Error:", authError);
                setError(authError.message === "Invalid login credentials"
                    ? "Credenciales inválidas. Revisa tu email y contraseña."
                    : authError.message);
                return;
            }

            if (data.user) {
                const isAdmin = data.user.email === "misaerobles0404@gmail.com" ||
                    data.user.email === "misaelrobles0404@gmail.com";

                if (isAdmin) {
                    console.log("Redirigiendo a Super Admin...");
                    window.location.href = "/super-admin";
                } else {
                    router.push("/admin");
                }
            }
        } catch (err: any) {
            console.error("Catch Error:", err);
            setError("Ocurrió un error inesperado. Revisa tu conexión.");
        } finally {
            setIsLoading(false);
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
                    <div className="w-20 h-20 bg-gradient-to-br from-[#FD7202] to-[#FF9031] rounded-[24px] flex items-center justify-center shadow-[0_0_40px_rgba(253,114,2,0.3)] mb-6 transition-transform hover:scale-110 duration-500">
                        <BotMessageSquare className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Acceso <span className="text-[#FD7202]">Clientes</span></h1>
                    <p className="text-gray-500 text-sm mt-2 font-bold uppercase tracking-widest text-center px-4">SaraCalls.ai • Central de Operaciones</p>
                </div>

                <div className="glass p-8 rounded-[32px] border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Correo Electrónico</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FD7202] transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="usuario@tuempresa.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:border-[#FD7202] transition-all outline-none font-medium placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Contraseña</label>
                                <button type="button" className="text-[9px] font-bold text-[#FD7202]/60 hover:text-[#FD7202] uppercase tracking-widest transition-colors">¿Olvidaste tu contraseña?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FD7202] transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:border-[#FD7202] transition-all outline-none font-medium placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3"
                                >
                                    <AlertCircle className="text-red-400 shrink-0" size={16} />
                                    <p className="text-red-400 text-[11px] font-bold leading-tight">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FD7202] hover:bg-[#FF8A00] py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(253,114,2,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>Inicia Sesión <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-12 space-y-6">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                        ¿No tienes una cuenta?{" "}
                        <Link href="/register" className="text-[#FD7202] hover:text-[#FF8A00] transition-colors ml-2 underline underline-offset-4">Regístrate aquí</Link>
                    </p>
                    <div className="space-y-4">
                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.4em]">
                            TECNOLOGÍA DE INTELIGENCIA DE VOZ 2026
                        </p>
                        <div className="flex justify-center gap-6">
                            <a href="/privacy" className="text-[10px] text-gray-700 hover:text-gray-500 transition-colors uppercase font-black tracking-widest">Privacidad</a>
                            <a href="/terms" className="text-[10px] text-gray-700 hover:text-gray-500 transition-colors uppercase font-black tracking-widest">Términos</a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
