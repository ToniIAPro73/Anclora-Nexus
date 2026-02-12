'use client'
import { useState } from 'react'
import { Plus, Search, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import LeadFormModal from '@/components/modals/LeadFormModal'

export function QuickActions() {
  const { t } = useI18n()
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
  
  const actions = [
    { label: t('newLead'), icon: Plus, sub: t('manualEntry') },
    { label: t('prospectionRun'), icon: Search, sub: t('weeklySearch') },
    { label: t('forceRecap'), icon: FileText, sub: t('generateReport') },
  ]

  const handleAction = (idx: number) => {
    if (idx === 0) {
      setIsLeadModalOpen(true)
    } else if (idx === 1) {
      // Simulate Prospection
      setLoadingIndex(idx)
      
      // Add 'active' log
      const currentLogs = useStore.getState().agentLogs
      useStore.getState().setAgentLogs([{
        id: Date.now().toString(),
        agent: 'Prospection',
        status: 'active',
        message: 'Iniciando búsqueda semanal en fuentes configuradas...',
        timestamp: 'Justo ahora'
      }, ...currentLogs])

      setTimeout(() => {
        // Add 'success' log
        const updatedLogs = useStore.getState().agentLogs
        useStore.getState().setAgentLogs([{
          id: (Date.now() + 1).toString(),
          agent: 'Prospection',
          status: 'success',
          message: 'Prospección finalizada. Se han analizado 142 propiedades.',
          timestamp: 'Justo ahora'
        }, ...updatedLogs])
        
        setLoadingIndex(null)
      }, 3000)
    } else {
      console.log('Action not implemented:', idx)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-full">
        {actions.map((action, idx) => (
          <motion.button
            key={idx}
            onClick={() => handleAction(idx)}
            disabled={loadingIndex !== null}
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`widget-card flex flex-col items-center justify-center gap-2 text-center group border-gold/10 hover:border-gold/30 ${loadingIndex === idx ? 'opacity-80 cursor-wait' : ''}`}
          >
            <div className={`p-3 rounded-xl bg-gold/5 text-gold group-hover:bg-gold/10 transition-colors border border-gold/10 ${loadingIndex === idx ? 'animate-pulse' : ''}`}>
              {loadingIndex === idx ? (
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Search className="w-5 h-5 opacity-50" />
                 </motion.div>
              ) : (
                 <action.icon className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-gold uppercase tracking-tighter">{action.label}</div>
              <div className="text-[9px] uppercase tracking-widest text-soft-muted">
                {loadingIndex === idx ? 'EJECUTANDO...' : action.sub}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <LeadFormModal 
        isOpen={isLeadModalOpen} 
        onClose={() => setIsLeadModalOpen(false)} 
      />
    </>
  )
}

