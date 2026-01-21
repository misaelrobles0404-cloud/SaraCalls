"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    BotMessageSquare,
    User,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Users,
    ArrowRight,
    Loader2,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulación de envío
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                >
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                        <CheckCircle2 className="text-green-500 w-12 h-12" />
                    </div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tight">¡Solicitud <span className="text-green-500">Recibida</span>!</h1>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                        Un asesor de SaraCalls.ai se pondrá en contacto contigo en menos de 24 horas para activar tu cuenta.
                    </p>
                    <div className="pt-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Redirigiendo al login...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 font-sans py-20">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FD7202]/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl relative z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <Link href="/" className="w-16 h-16 bg-gradient-to-br from-[#FD7202] to-[#FF9031] rounded-[20px] flex items-center justify-center shadow-[0_0_40px_rgba(253,114,2,0.3)] mb-6 transition-transform hover:scale-110 duration-500">
                        <BotMessageSquare className="text-white w-8 h-8" />
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Únete a <span className="text-[#FD7202]">Sara</span></h1>
                    <p className="text-gray-500 text-sm mt-2 font-bold uppercase tracking-widest text-center px-4">Empieza la automatización de tu negocio hoy</p>
                </div>

                <div className="glass p-10 rounded-[32px] border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { label: 'Nombre Completo *', icon: User, placeholder: 'Ingresa tu nombre', type: 'text', required: true },
                                { label: 'Correo de Empresa *', icon: Mail, placeholder: 'ejemplo@empresa.com', type: 'email', required: true },
                                { label: 'Teléfono Móvil *', icon: Phone, placeholder: '+52...', type: 'tel', required: true },
                                { label: 'Nombre de la Empresa', icon: Building2, placeholder: 'Tu negocio...', type: 'text' },
                                { label: 'Industria / Sector', icon: Briefcase, placeholder: 'Ej. Restaurante, Clínica...', type: 'text' },
                                { label: 'Tamaño de Equipo', icon: Users, placeholder: '1-10, 11-50...', type: 'text' }
                            ].map((field, i) => (
                                <div key={i} className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                        <field.icon size={12} className="text-[#FD7202]" /> {field.label}
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type={field.type}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 transition-all outline-none font-medium placeholder:text-slate-700 focus:border-[#FD7202]/50 focus:bg-white/[0.07]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FD7202] hover:bg-[#FF8A00] py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(253,114,2,0.2)] disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>Crear mi Cuenta de Negocio <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-12 flex flex-col gap-4">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                        ¿YA TIENES UNA CUENTA?{" "}
                        <Link href="/login" className="text-[#FD7202] hover:text-[#FF8A00] transition-colors ml-2 underline underline-offset-4">INICIA SESIÓN AQUÍ</Link>
                    </p>
                    <Link href="/" className="text-[10px] text-gray-700 hover:text-gray-500 transition-colors uppercase font-black tracking-widest mt-4">VOLVER AL INICIO</Link>
                </div>
            </motion.div>
        </div>
    );
}
