'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackProps {
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    onDismiss?: () => void
    className?: string
}

const variants = {
    success: {
        icon: CheckCircle,
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-400',
        iconColor: 'text-green-400'
    },
    error: {
        icon: XCircle,
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        iconColor: 'text-red-400'
    },
    info: {
        icon: Info,
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        text: 'text-cyan-400',
        iconColor: 'text-cyan-400'
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        iconColor: 'text-yellow-400'
    }
}

export function Feedback({ type, message, onDismiss, className }: FeedbackProps) {
    const config = variants[type]
    const Icon = config.icon

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, scale: 1, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className={cn(
                        "p-3 rounded-lg border flex items-start gap-3 relative overflow-hidden",
                        config.bg,
                        config.border,
                        className
                    )}
                >
                    {/* Animated subtle glow */}
                    <div className={cn("absolute inset-0 opacity-10", config.bg)} />

                    <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconColor)} />

                    <div className="flex-1">
                        <p className={cn("text-sm font-medium", config.text)}>
                            {message}
                        </p>
                    </div>

                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className={cn("shrink-0 p-1 rounded-md hover:bg-white/5 transition-colors", config.iconColor)}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    {/* Progress bar effect for success/error if no onDismiss */}
                    {!onDismiss && (
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 4, ease: "linear" }}
                            className={cn("absolute bottom-0 left-0 h-0.5 opacity-30", config.iconColor)}
                            style={{ backgroundColor: 'currentColor' }}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
