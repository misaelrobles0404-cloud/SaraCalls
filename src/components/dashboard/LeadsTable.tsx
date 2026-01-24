"use client";

import { Trash2 } from "lucide-react";

interface LeadsTableProps {
    leads: any[];
    loading: boolean;
    onDelete: (id: string) => void;
}

export function LeadsTable({ leads, loading, onDelete }: LeadsTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                        <th className="pb-4 px-4">Nombre</th>
                        <th className="pb-4 px-4">Teléfono</th>
                        <th className="pb-4 px-4">Fecha</th>
                        <th className="pb-4 px-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loading ? (
                        <tr><td colSpan={4} className="py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD7202] mx-auto"></div></td></tr>
                    ) : leads.length === 0 ? (
                        <tr><td colSpan={4} className="py-10 text-center text-gray-500 uppercase text-[10px] font-bold tracking-widest">No hay leads registrados</td></tr>
                    ) : leads.map((lead, idx) => (
                        <tr key={lead.id || idx} className="hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer border-l-2 border-transparent hover:border-[#FD7202]">
                            <td className="py-5 px-4 font-semibold text-gray-200 group-hover:text-white transition-colors">{lead.name}</td>
                            <td className="py-5 px-4 text-gray-400 group-hover:text-gray-300">{lead.phone}</td>
                            <td className="py-5 px-4 text-gray-400 group-hover:text-gray-300 font-mono text-xs">{new Date(lead.created_at).toLocaleDateString()}</td>
                            <td className="py-5 px-4 text-right">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(lead.id);
                                    }}
                                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    title="Eliminar Lead"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
