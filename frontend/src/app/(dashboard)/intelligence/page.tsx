'use client'
import { ChatConsole } from '@/components/intelligence/ChatConsole'
import { DecisionConsole } from '@/components/intelligence/DecisionConsole'
import { QueryPlanPanel } from '@/components/intelligence/QueryPlanPanel'
import { useStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Brain, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function IntelligencePage() {
  const { t } = useI18n()
  const { intelligence } = useStore()
  const latestResponse = intelligence.lastResponse

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col h-[calc(100vh-8rem)]"
      >
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 rounded-lg bg-navy-surface/40 border border-soft-subtle hover:border-gold/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-soft-white" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-soft-white">
                  {t('intelligenceControlCenter')}
                </h1>
                <div className="px-2 py-0.5 rounded-full bg-gold/10 border border-gold/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-gold" />
                  <span className="text-[10px] font-bold text-gold uppercase tracking-tighter">{t('verifiedEngine')}</span>
                </div>
              </div>
              <p className="text-sm text-soft-muted mt-1">
                {t('intelligenceSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-navy-surface/50 backdrop-blur-md border border-white/5 rounded-2xl p-3">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-soft-muted">{t('governanceStatus')}</p>
              <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 justify-end">
                <Lock className="w-3 h-3" /> {t('immutableAudit')}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-gold animate-float" />
            </div>
          </div>
        </div>

        {/* MAIN BENTO GRID */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
          {/* LEFT COLUMN: CHAT (approx. 5/12) */}
          <div className="lg:col-span-5 h-full min-h-0">
             <ChatConsole />
          </div>

          {/* RIGHT COLUMN: ANALYSIS & DECISION (approx. 7/12) */}
          <div className="lg:col-span-7 h-full min-h-0">
            <div className="h-full bg-navy-surface/40 border border-soft-subtle rounded-2xl hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <AnimatePresence mode="wait">
                {!latestResponse ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30 min-h-[400px]"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Brain className="w-8 h-8 text-soft-muted" />
                    </div>
                    <p className="text-sm italic text-soft-muted">{t('waitingForQuery')}</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 pb-6"
                  >
                    <DecisionConsole decision={latestResponse.governor_decision} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <QueryPlanPanel plan={latestResponse.query_plan} />
                    </div>

                    {/* AUDIT INFO FOOTER */}
                    <div className="p-4 rounded-xl bg-navy-darker/40 border border-white/5 flex items-center justify-between text-[10px] font-mono text-soft-muted">
                       <div className="flex items-center gap-4">
                         <span>{t('auditId')}: {latestResponse.audit_id || 'LOCAL_EXE'}</span>
                         <span className="w-1 h-1 rounded-full bg-soft-subtle" />
                         <span>{t('engine')}: v1.0.4</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                           {t('signatureVerified')}
                         </span>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
