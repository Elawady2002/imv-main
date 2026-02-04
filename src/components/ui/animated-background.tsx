'use client'

import { useEffect, useState } from 'react'

function Particle({ delay, duration, left }: { delay: number; duration: number; left: number }) {
  return (
    <div
      className="particle"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  )
}

export function AnimatedBackground() {
  const [particles, setParticles] = useState<Array<{ id: number; delay: number; duration: number; left: number }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      delay: Math.random() * 20,
      duration: 15 + Math.random() * 10,
      left: Math.random() * 100,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <>
      {/* Gradient background */}
      <div className="animated-bg" />
      
      {/* Grid overlay */}
      <div className="grid-overlay" />
      
      {/* Floating particles */}
      <div className="particles">
        {particles.map((particle) => (
          <Particle
            key={particle.id}
            delay={particle.delay}
            duration={particle.duration}
            left={particle.left}
          />
        ))}
      </div>

      {/* Ambient orbs */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[500px] h-[500px] rounded-full animate-float"
          style={{
            top: '10%',
            left: '10%',
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full animate-float"
          style={{
            bottom: '20%',
            right: '10%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animationDelay: '-3s',
          }}
        />
        <div 
          className="absolute w-[300px] h-[300px] rounded-full animate-float"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animationDelay: '-5s',
          }}
        />
      </div>
    </>
  )
}
