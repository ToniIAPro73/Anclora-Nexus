'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function StaggerList({ children, delay = 0.06, className = '' }: {
  children: ReactNode; delay?: number; className?: string
}) {
  return (
    <motion.div className={className} initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: delay } } }}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={{
      hidden: { opacity: 0, y: 8 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    }}>
      {children}
    </motion.div>
  )
}
