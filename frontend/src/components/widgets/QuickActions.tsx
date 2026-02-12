'use client'
import { Plus, Search, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

export function QuickActions() {
  const actions = [
    { label: 'Nuevo Lead', icon: Plus, sub: 'Alta manual' },
    { label: 'Prospection Run', icon: Search, sub: 'Scan semanal' },
    { label: 'Force Recap', icon: FileText, sub: 'Generar reporte' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-full">
      {actions.map((action, idx) => (
        <motion.button
          key={idx}
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          className="widget-card flex flex-col items-center justify-center gap-2 text-center group border-gold/10 hover:border-gold/30"
        >
          <div className="p-3 rounded-xl bg-gold/5 text-gold group-hover:bg-gold/10 transition-colors border border-gold/10">
            <action.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-gold uppercase tracking-tighter">{action.label}</div>
            <div className="text-[9px] uppercase tracking-widest text-soft-muted">{action.sub}</div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

