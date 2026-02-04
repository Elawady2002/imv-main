'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <motion.div 
        className="w-full"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <label className="block text-sm font-medium text-cyan-300/80 mb-2 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 text-base rounded-lg
              cyber-input
              ${error ? 'border-red-500/50 focus:border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/30 rounded-tl" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/30 rounded-tr" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/30 rounded-bl" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/30 rounded-br" />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <span className="w-1 h-1 bg-red-400 rounded-full" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-zinc-500">{helperText}</p>
        )}
      </motion.div>
    )
  }
)

Input.displayName = 'Input'
