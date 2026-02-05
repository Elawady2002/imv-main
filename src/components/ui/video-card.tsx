'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, X, Clock, Eye } from 'lucide-react'

interface VideoCardProps {
  title?: string
  description?: string
  duration?: string
  views?: string
  thumbnailText?: string
  videoUrl?: string
  level?: 'Beginner' | 'Intermediate' | 'Advanced'
}

const LEVEL_COLORS = {
  Beginner: 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]',
  Intermediate: 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.4)]',
  Advanced: 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
}

export function VideoCard({
  title = "Getting Started: Your First $100 Day",
  description = "Watch this essential training to understand exactly how to use Inbox Money Vault to generate your first profitable leads and close your first deals.",
  duration = "12:34",
  views = "2,847",
  thumbnailText = "WATCH NOW",
  videoUrl,
  level
}: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-[#0D0D10] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
    >
      {/* Video Thumbnail / Player */}
      <div className="relative aspect-video bg-linear-to-br from-zinc-900 to-zinc-800">
        {isPlaying && videoUrl ? (
          <>
            <iframe
              src={videoUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </>
        ) : (
          <>
            {/* Animated background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-linear-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20" />
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(0, 240, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)'
              }} />

              {/* Grid lines */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.3) 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }}
              />
            </div>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.button
                onClick={() => videoUrl && setIsPlaying(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group/play"
              >
                {/* Play button */}
                <div className={`
                  relative w-14 h-14 rounded-full flex items-center justify-center 
                  shadow-lg transition-all duration-300
                  ${level === 'Beginner' ? 'bg-linear-to-br from-green-400 to-green-600 shadow-green-500/20 group-hover/play:shadow-green-500/40' :
                    level === 'Intermediate' ? 'bg-linear-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/20 group-hover/play:shadow-yellow-500/40' :
                      'bg-linear-to-br from-purple-400 to-purple-600 shadow-purple-500/20 group-hover/play:shadow-purple-500/40'}
                `}>
                  <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                </div>
              </motion.button>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-sm font-bold text-white uppercase tracking-[0.2em] drop-shadow-md"
              >
                {thumbnailText}
              </motion.p>
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-medium text-zinc-300 border border-white/10">
              <Clock className="w-3 h-3" />
              {duration}
            </div>

            {/* Level indicator */}
            {level && (
              <div className={`
                absolute top-3 left-3 px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider
                ${LEVEL_COLORS[level]}
              `}>
                {level}
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Info */}
      <div className="p-5 bg-zinc-900/40">
        <h3 className="font-bold text-white text-base mb-2 line-clamp-1 group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-zinc-500 text-xs leading-relaxed mb-4 line-clamp-2 min-h-[32px]">
          {description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-medium uppercase tracking-wide">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3 h-3" />
              {views} views
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {duration}
            </span>
          </div>

          {!isPlaying && (
            <button
              onClick={() => videoUrl && setIsPlaying(true)}
              className={`
                text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors
                ${level === 'Beginner' ? 'text-green-400 hover:text-green-300' :
                  level === 'Intermediate' ? 'text-yellow-400 hover:text-yellow-300' :
                    'text-purple-400 hover:text-purple-300'}
              `}
            >
              Watch Now
              <Play className="w-2.5 h-2.5" fill="currentColor" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
