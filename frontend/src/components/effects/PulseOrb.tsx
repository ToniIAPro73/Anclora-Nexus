'use client'
import { motion } from 'framer-motion'

export function PulseOrb({ status = 'active', size = 8 }: {
  status?: 'active' | 'processing' | 'error' | 'idle'; size?: number
}) {
  const colors = {
    active:     { bg: '#34D399', glow: 'rgba(52,211,153,0.4)' },
    processing: { bg: '#D4AF37', glow: 'rgba(212,175,55,0.4)' },
    error:      { bg: '#E53E3E', glow: 'rgba(229,62,62,0.4)' },
    success:    { bg: '#34D399', glow: 'rgba(52,211,153,0.4)' }, // Added success mapping
    idle:       { bg: 'rgba(245,245,240,0.3)', glow: 'transparent' },
  }
  const color = colors[status as keyof typeof colors] || colors.idle
  const { bg, glow } = color

  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size * 2, height: size * 2 }}>
      {status !== 'idle' && (
        <motion.span className="absolute inset-0 rounded-full" style={{ background: glow }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
      )}
      <span className="relative inline-flex rounded-full"
            style={{ width: size, height: size, background: bg }} />
    </span>
  )
}
