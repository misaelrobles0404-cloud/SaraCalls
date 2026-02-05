"use client";

import { Mic, Play, Volume2 } from "lucide-react";
import { useState } from "react";

interface CallsTableProps {
    calls: any[];
    loading: boolean;
    currentTheme: {
        primary: string;
    };
}

export function CallsTable({ calls, loading, currentTheme }: CallsTableProps) {
    const [isPlaying, setIsPlaying] = useState<number | null>(null);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                        <th className="pb-4 px-4">Cliente</th>
                        <th className="pb-4 px-4">Estado</th>
                        <th className="pb-4 px-4">Duración</th>
                        <th className="pb-4 px-4">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loading ? (
                        <tr><td colSpan={4} className="py-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD7202] mx-auto opacity-50"></div></td></tr>
                    ) : calls.length === 0 ? (
                        <tr><td colSpan={4} className="py-20 text-center text-gray-500 uppercase text-[10px] font-bold tracking-widest opacity-50 italic">No hay registros de llamadas</td></tr>
                    ) : calls.map((call, idx) => (
                        <tr key={call.id || idx} className="hover:bg-white/[0.04] transition-all duration-500 group border-l-4 border-transparent hover:border-[#FD7202] relative overflow-hidden">
                            <td className="py-6 px-4 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 transition-colors group-hover:bg-white/10 group-hover:border-white/10">
                                        <Mic size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-white/90 group-hover:text-white transition-colors text-base tracking-tight">{call.customer_name || 'Desconocido'}</p>
                                        <p className="text-[11px] text-gray-500 font-bold tracking-wider">{call.customer_phone}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-6 px-4 relative z-10">
                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${call.sentiment === 'Positivo' || call.sentiment === 'Confirmada' ? 'bg-green-500/10 text-green-400 border-green-500/20 group-hover:bg-green-500/20' :
                                    call.sentiment === 'En curso' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        'bg-white/5 text-gray-400 border-white/10'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full inline-block mr-2 ${call.sentiment === 'Positivo' || call.sentiment === 'Confirmada' ? 'bg-green-400' :
                                        call.sentiment === 'En curso' ? 'bg-blue-400 animate-pulse' : 'bg-gray-500'
                                        }`}></div>
                                    {call.sentiment || 'Procesada'}
                                </span>
                            </td>
                            <td className="py-6 px-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-gray-400 group-hover:text-white transition-colors" style={isPlaying === idx ? { color: currentTheme.primary } : {}}>{call.duration ? `${Math.round(call.duration)}s` : '0s'}</span>
                                    {isPlaying === idx && (
                                        <div className="flex items-end gap-0.5 h-3">
                                            <div className="w-0.5 bg-[#FD7202] animate-[music-pulse_0.8s_infinite_0s]"></div>
                                            <div className="w-0.5 bg-[#FD7202] animate-[music-pulse_0.8s_infinite_0.1s]"></div>
                                            <div className="w-0.5 bg-[#FD7202] animate-[music-pulse_0.8s_infinite_0.2s]"></div>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="py-6 px-4 relative z-10 text-right">
                                <button
                                    onClick={() => setIsPlaying(isPlaying === idx ? null : idx)}
                                    className={`w-12 h-12 rounded-2xl transition-all duration-500 flex items-center justify-center transform active:scale-90 ${isPlaying === idx ? 'text-white shadow-[0_0_20px_rgba(253,114,2,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white shadow-xl'}`}
                                    style={isPlaying === idx ? { backgroundColor: currentTheme.primary } : {}}
                                >
                                    {isPlaying === idx ? <Volume2 size={20} className="animate-bounce" /> : <Play size={20} fill="currentColor" />}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
