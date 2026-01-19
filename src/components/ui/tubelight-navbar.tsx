"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
    name: string
    url: string
    icon: LucideIcon
}

interface NavBarProps {
    items: NavItem[]
    className?: string
}

export function NavBar({ items, className }: NavBarProps) {
    const [activeTab, setActiveTab] = useState(items[0].name)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return (
        <div
            className={cn(
                "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
                className,
            )}
        >
            <div className="flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.name

                    return (
                        <Link
                            key={item.name}
                            href={item.url}
                            onClick={() => setActiveTab(item.name)}
                            className={cn(
                                "relative cursor-pointer text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full transition-all duration-300",
                                "text-white/60 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]",
                                isActive && "bg-[#FF7A00]/10 neon-text-orange",
                            )}
                        >
                            <span className="hidden md:inline-block relative z-10">{item.name}</span>
                            <span className="md:hidden">
                                <Icon size={18} strokeWidth={2.5} />
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="lamp"
                                    className="absolute inset-x-0 bottom-0 flex justify-center -z-10"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                >
                                    <div className="relative">
                                        <div className="w-8 h-1 bg-[#FD7202] rounded-t-full shadow-[0_0_15px_#FD7202,0_0_5px_#FD7202]">
                                            <div className="absolute w-12 h-6 bg-[#FD7202]/30 rounded-full blur-md -top-2 -left-2" />
                                            <div className="absolute w-8 h-6 bg-[#FD7202]/30 rounded-full blur-md -top-1" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
