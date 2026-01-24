"use client";

import {
    UserPlus,
    LayoutDashboard,
    Zap,
    MapPin,
    Trash2,
    MessageSquare
} from "lucide-react";

interface SalesLeadCardProps {
    lead: any;
    onUpdateStatus: (id: string, status: string) => void;
    onDelete: (id: string) => void;
}

export function SalesLeadCard({ lead, onUpdateStatus, onDelete }: SalesLeadCardProps) {
    const statusOptions = [
        { label: 'Nuevo', value: 'Nuevo', color: 'bg-orange-600', shadow: 'shadow-orange-900/40' },
        { label: 'Contactado', value: 'Contactado', color: 'bg-blue-600', shadow: 'shadow-blue-900/40' },
        { label: 'Cerrado', value: 'Cerrado', color: 'bg-green-600', shadow: 'shadow-green-900/40' }
    ];

    return (
        <div className={`relative glass rounded-[32px] border border-white/5 bg-white/[0.02] p-6 transition-all duration-500 hover:bg-white/[0.04] group overflow-hidden ${(lead.status || 'Nuevo') === 'Nuevo' ? 'ring-1 ring-orange-500/20' : ''}`}>
            {/* Delete Button - Absolute Top Right */}
            <button
                onClick={() => onDelete(lead.id)}
                className="absolute top-4 right-4 z-20 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                title="Eliminar Prospecto"
            >
                <Trash2 size={16} />
            </button>

            {/* Status Glow Overlay */}
            {(lead.status || 'Nuevo') === 'Nuevo' && <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 shadow-[0_0_20px_rgba(253,114,2,0.5)]"></div>}
            {lead.status === 'Contactado' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
            {lead.status === 'Cerrado' && <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center relative z-10">
                {/* Person Info */}
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${(lead.status || 'Nuevo') === 'Nuevo' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-white group-hover:text-[#FD7202] transition-colors">{lead.full_name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</span>
                            {(lead.status || 'Nuevo') === 'Nuevo' && <span className="text-[8px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded animate-pulse">NUEVO</span>}
                        </div>
                    </div>
                </div>

                {/* Company Info */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <LayoutDashboard size={14} className="text-gray-600" />
                        <span className="text-sm font-bold text-gray-200">{lead.business_name || 'Sin Empresa'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-[#FD7202]" />
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            {lead.industry || 'Genérico'} • {lead.team_size || 'Equipo N/A'}
                            {(lead.city || lead.country) && (
                                <span className="text-gray-500 font-bold ml-1 italic capitalize">
                                    • <MapPin size={10} className="inline mr-1" />
                                    {lead.city}{lead.city && lead.country ? ', ' : ''}{lead.country}
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                        {lead.email}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500 tabular-nums">{lead.phone}</span>
                        <a
                            href={`https://wa.me/${lead.phone?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        >
                            <MessageSquare size={14} /> WhatsApp
                        </a>
                    </div>
                </div>

                {/* Actions & Message */}
                <div className="flex flex-col items-end gap-3">
                    <div className="grid grid-cols-3 gap-2 p-1.5 bg-black/20 rounded-2xl border border-white/5 w-full">
                        {statusOptions.map((st) => (
                            <button
                                key={st.value}
                                onClick={() => onUpdateStatus(lead.id, st.value)}
                                className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center ${(lead.status || 'Nuevo') === st.value
                                    ? `${st.color} text-white shadow-xl ${st.shadow} scale-105`
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>
                    <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5 w-full relative group/msg">
                        <p className="text-[10px] text-gray-400 italic leading-relaxed line-clamp-2 group-hover/msg:line-clamp-none transition-all">
                            "{lead.message || 'El prospecto no dejó un mensaje adicional.'}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
