'use client'

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Info, Lightbulb, BookOpen, ExternalLink } from 'lucide-react'

interface HelpTooltipProps {
  content: string
  title?: string
  learnMoreLink?: string
  variant?: 'help' | 'info' | 'tip'
  position?: 'top' | 'bottom' | 'left' | 'right'
  children?: ReactNode
}

const icons = {
  help: HelpCircle,
  info: Info,
  tip: Lightbulb
}

const colors = {
  help: 'text-zinc-400 hover:text-cyan-400',
  info: 'text-cyan-400 hover:text-cyan-300',
  tip: 'text-yellow-400 hover:text-yellow-300'
}

export function HelpTooltip({
  content,
  title,
  learnMoreLink,
  variant = 'help',
  position = 'top',
  children
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const Icon = icons[variant]

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-zinc-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-zinc-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-zinc-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-zinc-800'
  }

  return (
    <div className="relative inline-flex items-center">
      {children}
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className={`ml-1.5 ${colors[variant]} transition-colors`}
      >
        <Icon size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positions[position]} w-64`}
          >
            <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700 shadow-2xl">
              {title && (
                <p className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                  <Icon size={14} className={colors[variant].split(' ')[0]} />
                  {title}
                </p>
              )}
              <p className="text-zinc-300 text-xs leading-relaxed">
                {content}
              </p>
              {learnMoreLink && (
                <a
                  href={learnMoreLink}
                  className="mt-3 flex items-center gap-1 text-cyan-400 text-xs hover:text-cyan-300 transition-colors"
                >
                  <BookOpen size={12} />
                  Learn more
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
            {/* Arrow */}
            <div className={`absolute w-0 h-0 border-8 ${arrows[position]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Contextual help button that opens a modal/sidebar
interface HelpButtonProps {
  topic: string
  className?: string
}

export function HelpButton({ topic, className = '' }: HelpButtonProps) {
  return (
    <button
      onClick={() => {
        // Could open a help modal or navigate to docs
        window.open(`/support#${topic}`, '_blank')
      }}
      className={`inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-cyan-400 transition-colors ${className}`}
    >
      <HelpCircle size={12} />
      Need help?
    </button>
  )
}

// Quick tip banner
interface QuickTipProps {
  tip: string
  onDismiss?: () => void
}

export function QuickTip({ tip, onDismiss }: QuickTipProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-4 p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/20 flex items-start gap-3"
    >
      <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-yellow-200/80 flex-1">{tip}</p>
      <button
        onClick={() => {
          setDismissed(true)
          onDismiss?.()
        }}
        className="text-zinc-500 hover:text-zinc-300 text-xs"
      >
        Got it
      </button>
    </motion.div>
  )
}
