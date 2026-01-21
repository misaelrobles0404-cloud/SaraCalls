"use client";

import { motion } from "framer-motion";
import {
    Zap,
    Cpu,
    Calendar,
    Mic2,
    Workflow,
    ShieldCheck,
    Scissors,
    Utensils,
    Stethoscope,
    Check,
    UserPlus,
    Layers,
    Rocket,
    X,
    PhoneCall,
    User,
    Mail,
    Phone,
    Building2,
    Briefcase,
    Users,
    MessageSquare,
    Send,
    Home,
    HelpCircle,
    MapPin,
    ArrowRight,
    BotMessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";

export default function LandingPage() {
    const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | null>(null);

    useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
        const timer = setTimeout(() => window.scrollTo(0, 0), 0);
        return () => clearTimeout(timer);
    }, []);

    const navItems = [
        { name: 'Tecnología', url: '#features', icon: Zap },
        { name: 'Industrias', url: '#industries', icon: Building2 },
        { name: 'Lanzamiento', url: '#how-it-works', icon: Rocket },
        { name: 'Cómo Funciona', url: '#how-it-works-concept', icon: HelpCircle }
    ];

    const openLegalModal = (type: 'terms' | 'privacy') => setActiveLegalModal(type);
    const closeLegalModal = () => setActiveLegalModal(null);

    return (
        <div className="relative min-h-screen bg-[#050505] text-white">
            <div className="fixed top-6 left-8 z-50 flex items-center gap-3 bg-white/[0.03] backdrop-blur-md border border-white/5 py-1.5 px-4 rounded-xl shadow-2xl">
                <BotMessageSquare className="text-[#FD7202] w-8 h-8 drop-shadow-[0_0_8px_rgba(253,114,2,0.5)]" />
                <span className="text-lg font-black tracking-tight">SaraCalls.<span className="neon-text-orange">ai</span></span>
            </div>

            <div className="fixed top-6 right-8 z-50 flex items-center gap-3 bg-white/[0.03] backdrop-blur-md border border-white/5 py-1.5 px-4 rounded-xl shadow-2xl transition-all hover:bg-white/[0.05]">
                <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition-all duration-300"
                >
                    <User className="w-3.5 h-3.5 text-orange-400" />
                    <span>Iniciar Sesión</span>
                </Link>
                <Link
                    href="/register"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 hover:border-orange-500/50 hover:scale-[1.02] transition-all duration-300 group group-hover:shadow-[0_0_20px_rgba(253,114,2,0.3)] shadow-lg"
                >
                    <UserPlus className="w-3.5 h-3.5 text-orange-500 transition-transform group-hover:scale-110" />
                    <span className="text-[9px] font-bold uppercase italic tracking-[0.1em] text-white">Registrarse</span>
                </Link>
            </div>

            <NavBar items={navItems} />

            {/* Hero Section */}
            <main className="pt-48 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-left"
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#FF7A00] text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                            Sistemas de Voz de Nueva Generación
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight mb-8 uppercase italic">
                            REVOLUCIONA TU <br />
                            <span className="neon-text-orange">VENTA</span> CON <br />
                            VOZ IA 24/7.
                        </h1>
                        <p className="text-lg text-slate-400 mb-10 max-w-xl font-medium leading-relaxed">
                            Atención automatizada ultra-humana. Sara agenda, califica y cierra oportunidades mientras tú te enfocas en liderar.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/register" className="btn-neon">Empezar Ahora</Link>
                            <button className="px-8 py-4 rounded-xl font-black border border-white/20 bg-white/5 hover:bg-white/10 transition-all uppercase tracking-widest text-xs">Ver Demo</button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <div className="neon-card p-2 transform rotate-2 hover:rotate-0 transition-all duration-500 overflow-hidden">
                            <img src="/hero-image.png" alt="AI Voice Business Intelligence" className="rounded-[16px] w-full shadow-2xl" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-[16px]"></div>
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#FF7A00]/10 blur-[100px] rounded-full -z-10"></div>
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#00F0FF]/10 blur-[100px] rounded-full -z-10"></div>
                    </motion.div>
                </div>
            </main>

            {/* 1. Technology Section */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl lg:text-6xl font-black uppercase italic mb-20 text-center">
                        <span className="neon-text-blue">Potencia</span> Tecnológica
                    </h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="neon-card p-10 group transition-all duration-500 hover:border-orange-500/50">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-8 border border-orange-500/30">
                                <Cpu className="w-8 h-8 text-orange-500 transition-transform group-hover:scale-110" />
                            </div>
                            <h3 className="text-2xl font-black uppercase mb-4 italic">Neural Engine</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Modelos de lenguaje entrenados específicamente para la atención al cliente, con una comprensión semántica del 99%.</p>
                        </div>
                        <div className="neon-card p-10 group transition-all duration-500 hover:border-orange-500/50">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-8 border border-orange-500/30">
                                <Zap className="w-8 h-8 text-orange-400 transition-transform group-hover:scale-110" />
                            </div>
                            <h3 className="text-2xl font-black uppercase mb-4 italic">Frecuencia Zero</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Latencia de respuesta inferior a 1 segundo. Interacciones fluidas que eliminan la sensación de hablar con una máquina.</p>
                        </div>
                        <div className="neon-card p-10 group transition-all duration-500 hover:border-orange-500/50">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-8 border border-orange-500/30">
                                <Calendar className="w-8 h-8 text-orange-500 transition-transform group-hover:scale-110" />
                            </div>
                            <h3 className="text-2xl font-black uppercase mb-4 italic">Cierre Total</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Capacidad para agendar, cancelar y reprogramar citas directamente en tu plataforma de gestión favorita.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Industries */}
            <section id="industries" className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-6xl font-black uppercase italic mb-6">Sectores <span className="neon-text-orange">Especializados</span></h2>
                        <p className="text-slate-400 font-medium">Soluciones diseñadas para las necesidades críticas de cada industria.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                        <div className="neon-card p-10 transition-all duration-500 hover:scale-[1.02] border-orange-500/10 group">
                            <div className="flex items-center gap-4 mb-6 text-orange-500">
                                <Scissors className="w-10 h-10 shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-6" />
                                <h3 className="text-lg font-black uppercase italic">Barberías</h3>
                            </div>
                            <p className="text-slate-300 text-sm font-medium mb-6 leading-relaxed">Agendamiento de cortes y servicios 24/7 sin interrupciones. No pierdas más citas mientras trabajas.</p>
                            <ul className="space-y-3 text-xs text-slate-500">
                                <li className="flex items-center gap-2 transition-colors group-hover:text-slate-300"><Check className="w-4 h-4 text-orange-500" /> Sincronización con Calendario</li>
                                <li className="flex items-center gap-2 transition-colors group-hover:text-slate-300"><Check className="w-4 h-4 text-orange-500" /> Recordatorios SMS automáticos</li>
                            </ul>
                        </div>
                        <div className="neon-card p-10 transition-all duration-500 hover:scale-[1.02] border-orange-500/10 group">
                            <div className="flex items-center gap-4 mb-6 text-orange-500">
                                <Calendar className="w-10 h-10 shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-6" />
                                <h3 className="text-lg font-black uppercase italic">Restaurantes: Reservaciones</h3>
                            </div>
                            <p className="text-slate-300 text-sm font-medium mb-6 leading-relaxed">Gestión de mesas y horarios en tiempo real. Deja que Sara confirme disponibilidad y asigne lugares sin interrumpir el servicio.</p>
                            <ul className="space-y-3 text-xs text-slate-500">
                                <li className="flex items-center gap-2 transition-colors group-hover:text-slate-300"><Check className="w-4 h-4 text-orange-500" /> Confirmación inmediata</li>
                                <li className="flex items-center gap-2 transition-colors group-hover:text-slate-300"><Check className="w-4 h-4 text-orange-500" /> Control de capacidad máxima</li>
                            </ul>
                        </div>
                        <div className="neon-card p-10 transition-all duration-500 hover:scale-[1.02] border-orange-500/10 group">
                            <div className="flex items-center gap-4 mb-6 text-orange-500">
                                <Utensils className="w-10 h-10 shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-6" />
                                <h3 className="text-lg font-black uppercase italic">Restaurantes: Pedidos</h3>
                            </div>
                            <p className="text-slate-300 text-sm font-medium mb-6 leading-relaxed">Toma de órdenes para llevar o delivery vía telefónica. Sara registra el pedido y lo envía directamente a tu cocina.</p>
                            <ul className="space-y-3 text-xs text-slate-500">
                                <li className="flex items-center gap-2 transition-colors group-hover:text-slate-300"><Check className="w-4 h-4 text-orange-500" /> Toma de pedidos sin errores</li>
                                <li className="flex items-center gap-2 transition-colors group-hover:text-slate-300"><Check className="w-4 h-4 text-orange-500" /> Integración con sistema de cocina</li>
                            </ul>
                        </div>
                        {/* Clínicas */}
                        <div className="neon-card p-10 transition-all duration-500 hover:scale-[1.02] border-orange-500/10 group">
                            <div className="flex items-center gap-4 mb-6 text-orange-500">
                                <Stethoscope className="w-10 h-10 shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-6" />
                                <h3 className="text-lg font-black uppercase italic">Clínicas</h3>
                            </div>
                            <p className="text-slate-300 text-sm font-medium mb-6 leading-relaxed">Seguimiento profesional de pacientes y agendamiento de consultas médicas con total precisión.</p>
                            <ul className="space-y-3 text-xs text-slate-500">
                                <li className="flex items-center gap-2 transition-colors group-hover:text-slate-300"><Check className="w-4 h-4 text-orange-500" /> Gestión de agendas médicas</li>
                                <li className="flex items-center gap-2 transition-colors group-hover:text-slate-300"><Check className="w-4 h-4 text-orange-500" /> Triaje básico automatizado</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. 4 Steps (Lanzamiento) */}
            <section id="how-it-works" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl lg:text-7xl font-black uppercase italic mb-6">Tu Negocio en <span className="neon-text-orange">4 Pasos</span></h2>
                        <p className="text-slate-400 font-medium max-w-2xl mx-auto">Proceso de despliegue acelerado para que empieces a capturar citas en tiempo récord.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                        <div className="hidden lg:block absolute top-[100px] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent -z-10"></div>
                        {[{ num: 1, icon: UserPlus, title: "Alta de Empresa", desc: "Nosotros registramos tu empresa y activamos tu número exclusivo de IA.", color: "orange" },
                        { num: 2, icon: Workflow, title: "Entrenamiento", desc: "Te ayudamos a entrenar a Sara con tus servicios y horarios específicos.", color: "orange" },
                        { num: 3, icon: Layers, title: "Integración", desc: "Vinculamos a Sara con tu calendario o CRM para sincronización total.", color: "orange" },
                        { num: 4, icon: Rocket, title: "Despliegue", desc: "¡Todo listo! Lanzamos tu asistente y empieza a capturar oportunidades 24/7 sin que muevas un dedo.", color: "orange" }
                        ].map((step, i) => (
                            <div key={i} className="neon-card p-10 group transition-all duration-500 hover:border-orange-500/40">
                                <div className="step-number mb-8 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(253,114,2,0.6)] transition-all duration-300">{step.num}</div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500/20 ${step.color === 'orange' ? 'bg-orange-500/10 border-orange-500/30' :
                                    step.color === 'blue' ? 'bg-blue-500/10 border-blue-500/30' :
                                        'bg-green-500/10 border-green-500/30'
                                    }`}>
                                    <step.icon className={`w-6 h-6 transition-colors duration-300 ${step.color === 'orange' ? 'text-orange-400 group-hover:text-orange-300' :
                                        step.color === 'blue' ? 'text-blue-400 group-hover:text-orange-300' :
                                            'text-green-400 group-hover:text-orange-300'
                                        }`} />
                                </div>
                                <h3 className="text-xl font-bold uppercase mb-4 italic transition-colors duration-300 group-hover:text-orange-400">{step.title}</h3>
                                <div className="text-sm text-slate-500 leading-relaxed transition-colors duration-300 group-hover:text-slate-400">{step.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. How it Works Concept (Cómo Funciona) */}
            <section id="how-it-works-concept" className="py-32 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl lg:text-7xl font-black uppercase italic mb-6">¿Cómo <span className="neon-text-orange">Funciona</span>?</h2>
                        <p className="text-xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
                            SaraCalls.AI es un **ecosistema de automatización inteligente** que integra los motores de voz más avanzados con la lógica real de tu negocio.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="neon-card p-10 flex flex-col items-center text-center group transition-all duration-500 hover:scale-[1.02] hover:border-orange-500/40">
                            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/30 mb-8 transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(253,114,2,0.3)]">
                                <Mic2 className="w-8 h-8 text-orange-400" />
                            </div>
                            <h4 className="text-xl font-black uppercase italic mb-4">Escucha Inteligente</h4>
                            <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">Procesamos voz humana en tiempo real con latencia cero, entendiendo cada palabra y la intención precisa del cliente sin demoras.</p>
                        </div>
                        <div className="neon-card p-10 flex flex-col items-center text-center group transition-all duration-500 hover:scale-[1.02] hover:border-orange-500/40">
                            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/30 mb-8 transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(253,114,2,0.3)]">
                                <Workflow className="w-8 h-8 text-orange-400" />
                            </div>
                            <h4 className="text-xl font-black uppercase italic mb-4">Acciones Reales</h4>
                            <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">Conectamos la IA con tus herramientas favoritas para disparar acciones: agendar en Google Calendar, enviar SMS y actualizar tu CRM al instante.</p>
                        </div>
                        <div className="neon-card p-10 flex flex-col items-center text-center group transition-all duration-500 hover:scale-[1.02] hover:border-orange-500/40">
                            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/30 mb-8 transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(253,114,2,0.3)]">
                                <ShieldCheck className="w-8 h-8 text-orange-400" />
                            </div>
                            <h4 className="text-xl font-black uppercase italic mb-4">Control Total</h4>
                            <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">Supervisa cada llamada, escucha grabaciones y ajusta la personalidad de tu asistente desde tu panel de administración privado.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 bg-black/20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                        {/* Column 1: Branding */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-3 mb-6">
                                <BotMessageSquare className="text-[#FD7202] w-10 h-10 drop-shadow-[0_0_8px_rgba(253,114,2,0.5)]" />
                                <span className="text-2xl font-black tracking-tight">SaraCalls.<span className="neon-text-orange">ai</span></span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-xs font-medium">
                                Transformando la comunicación empresarial con inteligencia artificial de voz ultra-rápida y humana.
                            </p>
                        </div>

                        {/* Column 2: Legal Links */}
                        <div className="flex flex-col gap-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#FF7A00]">Legal</h4>
                            <div className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-slate-500">
                                <button onClick={() => openLegalModal('privacy')} className="text-left hover:text-white transition-colors">Política Privacidad</button>
                                <button onClick={() => openLegalModal('terms')} className="text-left hover:text-white transition-colors">Términos de Uso</button>
                            </div>
                        </div>

                        {/* Column 3: Contact */}
                        <div className="flex flex-col gap-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#FF7A00]">Contáctanos</h4>
                            <div className="flex flex-col gap-4 text-sm font-medium text-slate-500">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-orange-500" />
                                    <a href="mailto:hola@saracalls.ai" className="hover:text-white transition-colors">hola@saracalls.ai</a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-orange-500" />
                                    <a href="tel:+521234567890" className="hover:text-white transition-colors">+52 123 456 7890</a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-orange-500" />
                                    <span>Ciudad de México, México</span>
                                </div>
                            </div>
                        </div>

                        {/* Column 4: Social Media */}
                        <div className="flex flex-col gap-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#00F0FF]">Redes Sociales</h4>
                            <div className="flex gap-4">
                                <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500/10 hover:border-orange-500/30 transition-all group">
                                    <Instagram className="w-5 h-5 text-slate-500 group-hover:text-orange-500" />
                                </a>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group">
                                    <Facebook className="w-5 h-5 text-slate-500 group-hover:text-blue-400" />
                                </a>
                                <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all group">
                                    <svg className="w-5 h-5 fill-slate-500 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.96-1.03 1.6-.14.69-.06 1.45.24 2.1.26.6.77 1.1 1.34 1.38.65.32 1.4.41 2.11.23 1.05-.26 1.88-1.12 2.09-2.18.16-.91.17-1.81.14-2.73L12.58 0l-.055.02z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            © 2026 SaraCalls.AI Voice Systems. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Network Status: Online</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Legal Modals */}
            {
                activeLegalModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeLegalModal}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="relative w-full max-w-4xl max-h-[80vh] bg-[#020617] border border-white/10 rounded-3xl overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic text-white flex items-center gap-3">
                                        {activeLegalModal === 'terms' ? (
                                            <>Términos de <span className="neon-text-orange">Uso</span></>
                                        ) : (
                                            <>Política de <span className="neon-text-blue">Privacidad</span></>
                                        )}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Última actualización: 14 de Enero, 2026</p>
                                </div>
                                <button onClick={closeLegalModal} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-400 leading-relaxed font-medium">
                                    {activeLegalModal === 'terms' ? (
                                        <>
                                            <section>
                                                <h4 className="text-white font-black uppercase text-sm tracking-widest mb-4">A. Aceptación de los Términos</h4>
                                                <p>Al acceder o utilizar SaraCalls.AI, usted reconoce que ha leído, entendido y acepta estar sujeto a estos Términos en su totalidad. Si no está de acuerdo, debe abstenerse de utilizar el servicio.</p>
                                            </section>
                                            <section>
                                                <h4 className="text-white font-black uppercase text-sm tracking-widest mb-4">B. Descripción de la Asistente "Sara"</h4>
                                                <p>SaraCalls.AI ofrece una asistente virtual basada en inteligencia artificial. El Usuario reconoce que Sara es un software de IA y, como tal, sus respuestas están basadas en algoritmos probabilísticos. La Empresa no garantiza infalibilidad técnica.</p>
                                            </section>
                                            <section>
                                                <h4 className="text-white font-black uppercase text-sm tracking-widest mb-4">C. Uso Permitido y Restricciones</h4>
                                                <ul className="list-disc pl-5 space-y-4">
                                                    <li>Licencia limitada y no exclusiva para el uso de la plataforma.</li>
                                                    <li>Prohibido el uso para spam o ingeniería inversa sobre la IA.</li>
                                                    <li>Responsabilidad total sobre el entrenamiento proporcionado a Sara.</li>
                                                </ul>
                                            </section>
                                            <section className="p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl italic">
                                                "SaraCalls.AI no se hace responsable por promesas, precios erróneos o compromisos contractuales realizados por la IA Sara hacia terceros."
                                            </section>
                                        </>
                                    ) : (
                                        <>
                                            <section>
                                                <h4 className="text-white font-black uppercase text-sm tracking-widest mb-4">A. Información Recopilada</h4>
                                                <p>Recopilamos grabaciones y transcripciones de llamadas para la ejecución del servicio y mejora de calidad. También almacenamos datos compartidos por clientes finales durante la conversación.</p>
                                            </section>
                                            <section>
                                                <h4 className="text-white font-black uppercase text-sm tracking-widest mb-4">B. Uso de los Datos</h4>
                                                <p>Los datos se usan para suministrar el servicio, mejorar nuestros modelos de IA y facilitar integraciones con calendarios. Podemos compartir datos con proveedores de infraestructura críticos.</p>
                                            </section>
                                            <section className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                                                <h4 className="text-blue-400 font-black uppercase text-xs tracking-widest mb-2">Aviso Importante</h4>
                                                <p className="italic text-sm">"Es responsabilidad exclusiva del Usuario informar a sus clientes que las llamadas están siendo grabadas y procesadas por una IA Sara."</p>
                                            </section>
                                            <section>
                                                <h4 className="text-white font-black uppercase text-sm tracking-widest mb-4">C. Seguridad</h4>
                                                <p>Empleamos medidas de cifrado industrial para proteger su información. Tiene derecho a solicitar la eliminación de grabaciones en cualquier momento.</p>
                                            </section>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end">
                                <button onClick={closeLegalModal} className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] transition-all">
                                    Entendido
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )
            }


        </div>
    );
}

