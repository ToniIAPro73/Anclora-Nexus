'use client'
import { Plus, Search, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

export function QuickActions() {
  const actions = [
    { label: 'New Lead', icon: Plus, sub: 'Manual intake' },
    { label: 'Run Prospection', icon: Search, sub: 'Weekly batch' },
    { label: 'Force Recap', icon: FileText, sub: 'Generate report' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-full">
      {actions.map((action, idx) => (
        <motion.button
          key={idx}
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          className="widget-card-gold flex flex-col items-center justify-center gap-2 text-center group"
        >
          <div className="p-3 rounded-xl bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
            <action.icon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-gold tracking-tight">{action.label}</div>
            <div className="text-[10px] uppercase tracking-widest text-gold/60">{action.sub}</div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
