'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  glow?: boolean
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  glow = false,
  className = '',
  disabled,
  type = 'button',
  onClick
}: ButtonProps) {
  const baseStyles = `
    relative inline-flex items-center justify-center font-semibold rounded-lg
    transition-all duration-300 uppercase tracking-wider
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    overflow-hidden
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-cyan-500/20 to-purple-500/20
      border border-cyan-400/50 text-cyan-300
      hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]
      hover:text-cyan-200
    `,
    secondary: `
      bg-white/5 border border-white/10 text-zinc-300
      hover:bg-white/10 hover:border-white/20
    `,
    outline: `
      border border-cyan-400/30 text-cyan-400 bg-transparent
      hover:bg-cyan-400/10 hover:border-cyan-400/50
    `,
    ghost: `
      text-zinc-400 bg-transparent
      hover:text-cyan-400 hover:bg-cyan-400/5
    `,
    danger: `
      bg-red-500/10 border border-red-500/30 text-red-400
      hover:bg-red-500/20 hover:border-red-500/50
    `
  }

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    icon: 'p-2'
  }

  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${glow ? 'animate-border-glow' : ''}
        ${className}
      `}
      disabled={isDisabled}
      onClick={onClick}
    >
      {/* Shimmer effect on hover */}
      <span className="absolute inset-0 overflow-hidden rounded-lg">
        <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer" />
      </span>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </span>
    </motion.button>
  )
}
