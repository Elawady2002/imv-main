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
}

export function VideoCard({
  title = "Getting Started: Your First $100 Day",
  description = "Watch this essential training to understand exactly how to use Inbox Money Vault to generate your first profitable leads and close your first deals.",
  duration = "12:34",
  views = "2,847",
  thumbnailText = "WATCH NOW",
  videoUrl
}: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
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
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                {/* Pulse rings */}
                <div className="absolute inset-0 -m-4">
                  <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
                </div>
                <div className="absolute inset-0 -m-2">
                  <div className="absolute inset-0 rounded-full bg-cyan-400/30 animate-pulse" />
                </div>

                {/* Play button */}
                <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-2xl shadow-cyan-400/30 group-hover:shadow-cyan-400/50 transition-shadow">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
              </motion.button>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-lg font-bold text-white uppercase tracking-widest"
              >
                {thumbnailText}
              </motion.p>
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/60 rounded text-xs text-white">
              <Clock className="w-3 h-3" />
              {duration}
            </div>

            {/* Live indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-500/80 rounded text-xs text-white font-semibold">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              FEATURED
            </div>
          </>
        )}
      </div>

      {/* Video Info */}
      <div className="p-5">
        <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed mb-4">{description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {views} views
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {duration}
            </span>
          </div>

          {!isPlaying && (
            <button
              onClick={() => videoUrl && setIsPlaying(true)}
              className="text-cyan-400 text-sm font-semibold hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              Watch Now
              <Play className="w-3 h-3" fill="currentColor" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
