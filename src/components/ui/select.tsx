'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, className = '', ...props }, ref) => {
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
          <select
            ref={ref}
            className={`
              w-full px-4 py-3 text-base rounded-lg appearance-none
              cyber-input cursor-pointer
              ${error ? 'border-red-500/50 focus:border-red-500' : ''}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-zinc-900">
                {option.label}
              </option>
            ))}
          </select>
          {/* Dropdown arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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

Select.displayName = 'Select'
