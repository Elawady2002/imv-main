'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionProps {
    title: React.ReactNode
    children: React.ReactNode
    defaultOpen?: boolean
    className?: string
    headerClassName?: string
}

export function Accordion({
    title,
    children,
    defaultOpen = false,
    className,
    headerClassName,
}: AccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className={cn("border border-zinc-800/50 rounded-xl overflow-hidden bg-zinc-900/30", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors",
                    headerClassName
                )}
            >
                <div className="flex-1 text-left">{title}</div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-zinc-500"
                >
                    <ChevronDown className="w-5 h-5" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="border-t border-zinc-800/50">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
