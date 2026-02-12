'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function GoldShimmer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative group ${className}`}
      whileHover={{ scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="absolute -inset-[1px] rounded-widget opacity-0 group-hover:opacity-100
                      transition-opacity duration-700 pointer-events-none"
           style={{
             background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)',
             backgroundSize: '200% 100%',
             animation: 'shimmer 3s ease-in-out infinite',
           }} />
      {children}
    </motion.div>
  )
}
