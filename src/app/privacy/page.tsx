"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-slate-300 font-sans selection:bg-blue-500/30">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            <main className="max-w-4xl mx-auto px-6 py-20 relative">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-400 transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Volver al Inicio
                </Link>

                <div className="flex items-center gap-4 mb-4">
                    <ShieldCheck className="w-10 h-10 text-blue-500/50" />
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase italic">
                        Política de <span className="neon-text-blue">Privacidad</span>
                    </h1>
                </div>
                <p className="text-slate-500 mb-12">Última actualización: 14 de enero de 2026</p>

                <div className="prose prose-invert max-w-none space-y-8 text-slate-400 leading-relaxed font-medium">
                    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl transition-all hover:border-blue-500/30">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">A. Información Recopilada</h2>
                        <p>
                            En <strong>SaraCalls.AI</strong>, la privacidad es nuestra prioridad. Recopilamos datos de registro (nombre, email, facturación), así como <strong>grabaciones y transcripciones</strong> de audio generadas durante las llamadas procesadas por Sara para la ejecución del servicio y auditoría de calidad.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl transition-all hover:border-blue-500/30">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">B. Uso de los Datos</h2>
                        <p>
                            Utilizamos los datos recopilados para suministrar el servicio, facilitar integraciones con CRMs y calendarios, y mejorar técnicamente nuestros motores de IA. Los datos anonimizados pueden ser utilizados para el entrenamiento y optimización del procesamiento de lenguaje natural.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl transition-all hover:border-blue-500/30">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2 text-blue-400">C. Consentimiento de Grabación</h2>
                        <p className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 italic">
                            Importante: Es responsabilidad exclusiva del Usuario informar a sus clientes finales que las llamadas están siendo grabadas y procesadas por una IA, cumpliendo con las leyes de privacidad vigentes en su jurisdicción.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl transition-all hover:border-blue-500/30">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">D. Transferencia a Terceros</h2>
                        <p>
                            Podemos compartir información con proveedores de infraestructura tecnológica y servicios de telefonía exclusivamente para la funcionalidad del servicio. No vendemos sus datos personales a terceros.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl transition-all hover:border-blue-500/30">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">E. Seguridad y Retención</h2>
                        <p>
                            Empleamos cifrado industrial para proteger su información. La retención de grabaciones se rige por la configuración del plan del Usuario, con un periodo predeterminado de almacenamiento antes de su eliminación segura.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl transition-all hover:border-blue-500/30">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">F. Derechos ARCO</h2>
                        <p>
                            Usted tiene derecho a acceder, rectificar o cancelar el tratamiento de sus datos personales en cualquier momento a través de nuestras herramientas de gestión o contactando a nuestro equipo de soporte.
                        </p>
                    </section>
                </div>

                <div className="mt-20 pt-12 border-t border-white/10 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-widest">
                        © 2026 SaraCalls.AI Voice Systems. Privacidad Garantizada.
                    </p>
                </div>
            </main>

            <style jsx>{`
                .neon-text-blue {
                    color: #fff;
                    text-shadow: 0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3);
                }
            `}</style>
        </div>
    );
}
