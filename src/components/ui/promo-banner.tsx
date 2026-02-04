'use client'

import { motion } from 'framer-motion'
import { Smartphone, ArrowRight, Sparkles } from 'lucide-react'

interface PromoBannerProps {
  title?: string
  description?: string
  ctaText?: string
  ctaLink?: string
}

export function PromoBanner({
  title = "Want To Multiply Your Earnings To $1,000 - $5,000 A Day?",
  description = "The Inbox Money Vault system is powerful, but if you want to scale to truly life-changing income, you need to watch this exclusive training which shows how to make the serious money. And guess what? This training is free for all Inbox Money Vault members.",
  ctaText = "Click Here To Learn How",
  ctaLink = "https://www.jvzoo.com/c/86517/415009"
}: PromoBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)'
      }}
    >
      <div className="relative p-6 md:p-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-10 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Icon */}
          <div className="shrink-0">
            <div className="relative">
              <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <span className="text-xs font-bold text-yellow-900">$</span>
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              {title}
            </h3>
            <p className="text-teal-100 text-sm md:text-base leading-relaxed mb-4">
              {description}
            </p>
            <motion.a
              href={ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold rounded-lg transition-colors shadow-lg shadow-yellow-400/25"
            >
              <Sparkles className="w-4 h-4" />
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
