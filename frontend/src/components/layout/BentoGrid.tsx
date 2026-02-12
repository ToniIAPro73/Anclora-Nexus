'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function BentoGrid({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 p-4 xl:p-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.08
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

export function BentoCell({ children, colSpan = 1, rowSpan = 1, className = '' }: {
  children: ReactNode;
  colSpan?: number;
  rowSpan?: number;
  className?: string;
}) {
  // Mapping spans to tailwind classes for 6-column grid
  const colSpans = {
    1: 'xl:col-span-1',
    2: 'xl:col-span-2',
    3: 'xl:col-span-3',
    4: 'xl:col-span-4',
    6: 'xl:col-span-6',
  }

  const rowSpans = {
    1: 'xl:row-span-1',
    2: 'xl:row-span-2',
  }

  return (
    <motion.div
      className={`col-span-1 md:col-span-${Math.min(colSpan, 2)} ${colSpans[colSpan as keyof typeof colSpans] || ''} ${rowSpans[rowSpan as keyof typeof rowSpans] || ''} ${className}`}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}
