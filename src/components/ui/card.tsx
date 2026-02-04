'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export function Card({ children, className = '', hover = true, glow = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      className={`
        glass-card relative
        ${glow ? 'animate-border-glow' : ''}
        ${className}
      `}
    >
      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none scan-line" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function CardHeader({ children, className = '', onClick }: CardHeaderProps) {
  return (
    <div
      className={`px-6 py-5 border-b border-white/5 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-white ${className}`}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-zinc-400 mt-1 ${className}`}>
      {children}
    </p>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-white/5 ${className}`}>
      {children}
    </div>
  )
}
