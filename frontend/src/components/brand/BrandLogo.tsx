'use client'
import { motion } from 'framer-motion'

interface BrandLogoProps {
  className?: string
  size?: number
  src?: string
}

export function BrandLogo({ className = "", size = 64, src }: BrandLogoProps) {
  if (src) {
    return (
      <div 
        className={`relative rounded-full bg-navy-deep flex items-center justify-center overflow-hidden border border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)] ${className}`}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Brand Logo" className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div 
      className={`relative rounded-full bg-navy-deep flex items-center justify-center overflow-hidden border border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)] ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Ring */}
      <div className="absolute inset-1 rounded-full border border-gold/10" />
      
      {/* Golden Circle Base */}
      <div className="w-2/3 h-2/3 rounded-full bg-gradient-to-br from-gold via-gold-muted to-gold shadow-inner opacity-90" />
      
      {/* Digital Waves (Animated Rings) */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-gold/40"
          initial={{ width: "30%", height: "30%", opacity: 0 }}
          animate={{ 
            width: ["30%", "100%"], 
            height: ["30%", "100%"], 
            opacity: [0, 0.5, 0] 
          }}
          transition={{
            duration: 3,
            delay: i * 1,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Center Glow */}
      <div className="absolute inset-0 bg-gold/5 blur-xl" />
    </div>
  )
}
