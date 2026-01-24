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
                        <th className="pb-4 px-4">Sentimiento</th>
                        <th className="pb-4 px-4">Duración</th>
                        <th className="pb-4 px-4">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loading ? (
                        <tr><td colSpan={4} className="py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD7202] mx-auto"></div></td></tr>
                    ) : calls.length === 0 ? (
                        <tr><td colSpan={4} className="py-10 text-center text-gray-500 uppercase text-[10px] font-bold tracking-widest">No hay registros de llamadas</td></tr>
                    ) : calls.map((call, idx) => (
                        <tr key={call.id || idx} className="hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer border-l-2 border-transparent hover:border-[#FD7202] relative overflow-hidden">
                            <td className="py-5 px-4 font-semibold text-gray-200 group-hover:text-white transition-colors">
                                {call.customer_name || 'Desconocido'}
                                <p className="text-[9px] text-gray-500 font-normal">{call.customer_phone}</p>
                            </td>
                            <td className="py-5 px-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${call.sentiment === 'Positivo' || call.sentiment === 'Confirmada' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-white/10'} border`}>
                                    {call.sentiment || 'Procesada'}
                                </span>
                            </td>
                            <td className="py-5 px-4 text-gray-400 group-hover:text-gray-300">{call.duration}</td>
                            <td className="py-5 px-4">
                                <button
                                    onClick={() => setIsPlaying(isPlaying === idx ? null : idx)}
                                    className={`p-2.5 rounded-xl transition-all transform group-hover:scale-110 ${isPlaying === idx ? 'text-white' : 'bg-white/5 text-gray-400'}`}
                                    style={isPlaying === idx ? { backgroundColor: currentTheme.primary } : {}}
                                >
                                    {isPlaying === idx ? <Volume2 size={16} /> : <Play size={16} fill="currentColor" />}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
