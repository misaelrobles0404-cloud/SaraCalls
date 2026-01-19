"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-slate-300 font-sans selection:bg-orange-500/30">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            <main className="max-w-4xl mx-auto px-6 py-20 relative">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-400 transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Volver al Inicio
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 uppercase italic">
                    Términos y <span className="neon-text-orange">Condiciones</span>
                </h1>
                <p className="text-slate-500 mb-12">Última actualización: 14 de enero de 2026</p>

                <div className="prose prose-invert max-w-none space-y-8 text-slate-400 leading-relaxed font-medium">
                    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl transition-all hover:border-orange-500/30">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">A. Aceptación de los Términos</h2>
                        <p>
                            Los presentes Términos y Condiciones rigen el acceso y uso del sitio web, aplicaciones y servicios proporcionados por <strong>SaraCalls.AI</strong> (en adelante, la "Empresa"). Al acceder o utilizar SaraCalls.AI, usted (el "Usuario") reconoce que ha leído, entendido y acepta estar sujeto a estos Términos en su totalidad. Si no está de acuerdo, debe abstenerse de utilizar el servicio.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl transition-all hover:border-orange-500/30">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">B. Descripción de la Asistente "Sara"</h2>
                        <p>
                            SaraCalls.AI ofrece una asistente virtual basada en inteligencia artificial ("Sara"). Sara interactúa mediante voz o texto para automatizar procesos comerciales. El Usuario reconoce que Sara es un software de inteligencia artificial y, como tal, sus respuestas y acciones están basadas en algoritmos probabilísticos y entrenamiento previo.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl transition-all hover:border-orange-500/30">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">C. Uso Permitido y Restricciones</h2>
                        <ul className="list-disc pl-6 space-y-3">
                            <li><strong>Licencia:</strong> Se concede al Usuario una licencia limitada, no exclusiva e intransferible para usar SaraCalls.AI para fines comerciales legales.</li>
                            <li><strong>Prohibiciones:</strong> Queda estrictamente prohibido usar el servicio para fines ilegales, fraudulentos o para realizar llamadas automáticas (robocalls) que violen las leyes locales de telecomunicaciones.</li>
                            <li><strong>Ingeniería Inversa:</strong> No se permite intentar realizar ingeniería inversa sobre la IA o los motores de voz patentados.</li>
                        </ul>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl transition-all hover:border-orange-500/30">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">D. Exoneración de Responsabilidad</h2>
                        <p>
                            El servicio se proporciona "TAL CUAL". <strong>Sara</strong> es una inteligencia artificial y, aunque trabajamos para maximizar su precisión, SaraCalls.AI no se hace responsable por interpretaciones erróneas, errores en el agendamiento o fallos técnicos derivados de terceros. El usuario es el único responsable de la configuración y entrenamiento proporcionado a su instancia de Sara.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl transition-all hover:border-orange-500/30 shadow-[0_0_30px_rgba(253,114,2,0.05)]">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2 text-orange-400">E. Limitación de Responsabilidad Extrema</h2>
                        <p>
                            En la medida máxima permitida por la ley, SaraCalls.AI no será responsable por daños indirectos, incidentales, pérdida de beneficios o ingresos derivados del uso de la asistente Sara. Cualquier interrupción causada por proveedores de infraestructura o servicios de telefonía externos está fuera de nuestro control.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl transition-all hover:border-orange-500/30">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">F. Indemnización</h2>
                        <p>
                            El Usuario acepta indemnizar y eximir de toda responsabilidad a SaraCalls.AI frente a cualquier reclamo, daño o costo derivado del uso indebido del servicio o de la violación de estos Términos.
                        </p>
                    </section>
                </div>

                <div className="mt-20 pt-12 border-t border-white/10 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-widest">
                        © 2026 SaraCalls.AI Voice Systems. Todos los derechos reservados.
                    </p>
                </div>
            </main>

            <style jsx>{`
                .neon-text-orange {
                    color: #fff;
                    text-shadow: 0 0 10px rgba(253, 114, 2, 0.5), 0 0 20px rgba(253, 114, 2, 0.3);
                }
            `}</style>
        </div>
    );
}
