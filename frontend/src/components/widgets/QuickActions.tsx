'use client'
import { useState } from 'react'
import { Plus, Search, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import LeadFormModal from '@/components/modals/LeadFormModal'
import { runSkill } from '@/lib/api'

export function QuickActions() {
  const { t } = useI18n()
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
  
  const actions = [
    { label: t('newLead'), icon: Plus, sub: t('manualEntry') },
    { label: t('prospectionRun'), icon: Search, sub: t('weeklySearch') },
    { label: t('forceRecap'), icon: FileText, sub: t('generateReport') },
  ]

  const handleAction = async (idx: number) => {
    if (idx === 0) {
      setIsLeadModalOpen(true)
      return
    }

    setLoadingIndex(idx)
    
    // Add 'active' log based on index
    const logAgent = idx === 1 ? 'Prospection' : 'Weekly Recap'
    const logMsg = idx === 1 
      ? 'Iniciando búsqueda semanal en fuentes configuradas...' 
      : 'Generando resumen ejecutivo y KPIs de la semana...'
    
    const currentLogs = useStore.getState().agentLogs
    useStore.getState().setAgentLogs([...currentLogs, {
      id: Date.now().toString(),
      agent: logAgent,
      status: 'active',
      message: logMsg,
      timestamp: 'Justo ahora'
    }])

    try {
      // Call backend skill
      const skillName = idx === 1 ? 'prospection_weekly' : 'recap_weekly'
      const skillParams = idx === 1 ? { priority_min: 3 } : {}
      
      const result = await runSkill(skillName, skillParams)
      
      // Parse result for message
      let finalMsg = ''
      if (idx === 1) {
        const matches = result.matches_found || 0
        const processed = result.leads_processed || 0
        finalMsg = `Prospección finalizada. ${processed} leads analizados, ${matches} coincidencias encontradas.`
      } else {
        finalMsg = `Recap semanal generado. Resumen: ${result.luxury_summary?.substring(0, 60)}...`
      }

      // Add 'success' log
      const updatedLogs = useStore.getState().agentLogs
      useStore.getState().setAgentLogs([...updatedLogs, {
        id: (Date.now() + 1).toString(),
        agent: logAgent,
        status: 'success',
        message: finalMsg,
        timestamp: 'Justo ahora'
      }])

      // Initialize store to get new data (recap, matches, etc)
      await useStore.getState().initialize()

    } catch (error) {
      console.error('Skill error:', error)
      const updatedLogs = useStore.getState().agentLogs
      useStore.getState().setAgentLogs([...updatedLogs, {
        id: (Date.now() + 1).toString(),
        agent: logAgent,
        status: 'error',
        message: `Error al ejecutar ${idx === 1 ? 'prospección' : 'recap'}. Verifica la conexión.`,
        timestamp: 'Justo ahora'
      }])
    } finally {
      setLoadingIndex(null)
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

