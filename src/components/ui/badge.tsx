'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  className?: string
  pulse?: boolean
}

export function Badge({ children, variant = 'default', className = '', pulse = false }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-800/50 text-zinc-300 border-zinc-700/50',
    success: 'bg-green-500/10 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
        border uppercase tracking-wider
        ${variants[variant]}
        ${className}
      `}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`
            animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
            ${variant === 'success' ? 'bg-green-400' : ''}
            ${variant === 'error' ? 'bg-red-400' : ''}
            ${variant === 'warning' ? 'bg-yellow-400' : ''}
            ${variant === 'info' ? 'bg-cyan-400' : ''}
            ${variant === 'default' ? 'bg-zinc-400' : ''}
          `} />
          <span className={`
            relative inline-flex rounded-full h-2 w-2
            ${variant === 'success' ? 'bg-green-400' : ''}
            ${variant === 'error' ? 'bg-red-400' : ''}
            ${variant === 'warning' ? 'bg-yellow-400' : ''}
            ${variant === 'info' ? 'bg-cyan-400' : ''}
            ${variant === 'default' ? 'bg-zinc-400' : ''}
          `} />
        </span>
      )}
      {children}
    </motion.span>
  )
}
