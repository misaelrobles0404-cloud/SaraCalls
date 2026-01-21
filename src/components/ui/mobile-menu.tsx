"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, User, UserPlus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
    name: string;
    url: string;
    icon: LucideIcon;
}

interface MobileMenuProps {
    items: NavItem[];
}

export function MobileMenu({ items }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="md:hidden fixed top-6 right-8 z-[100]">
            {/* Hamburger Button */}
            <button
                onClick={toggleMenu}
                className="w-12 h-12 bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-xl flex items-center justify-center shadow-2xl transition-all hover:bg-white/[0.05]"
            >
                {isOpen ? <X className="text-white" /> : <Menu className="text-white" />}
            </button>

            {/* Slide-out Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleMenu}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm -z-10"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-screen w-80 bg-[#050505] border-l border-white/5 p-8 flex flex-col shadow-2xl -z-10"
                        >
                            <div className="flex flex-col h-full">
                                {/* Logo/Header area in Menu */}
                                <div className="mb-12 pt-4">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">
                                        SaraCalls.<span className="neon-text-orange">ai</span>
                                    </h3>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Navegación Móvil</p>
                                </div>

                                {/* Nav Links */}
                                <nav className="flex flex-col gap-6 mb-auto">
                                    {items.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.url}
                                                onClick={toggleMenu}
                                                className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 transition-all group-hover:border-orange-500/30 group-hover:bg-orange-500/10">
                                                    <Icon size={18} className="group-hover:text-orange-500 transition-colors" />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-[0.2em]">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>

                                {/* Auth Buttons */}
                                <div className="mt-auto space-y-4 pt-8 border-t border-white/5">
                                    <Link
                                        href="/login"
                                        onClick={toggleMenu}
                                        className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        <User size={16} className="text-orange-400" />
                                        <span>Iniciar Sesión</span>
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={toggleMenu}
                                        className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-orange-500 border border-orange-400/30 text-[10px] font-black uppercase tracking-widest text-white hover:bg-orange-600 transition-all shadow-[0_10px_20px_rgba(253,114,2,0.2)]"
                                    >
                                        <UserPlus size={16} />
                                        <span>Registrarse</span>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
