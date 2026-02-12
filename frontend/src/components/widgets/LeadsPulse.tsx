'use client'
import { useStore } from '@/lib/store'
import { PulseOrb } from '@/components/effects/PulseOrb'
import { GoldShimmer } from '@/components/effects/GoldShimmer'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { useI18n } from '@/lib/i18n'

export function LeadsPulse() {
  const leads = useStore((state) => state.leads)
  const { t } = useI18n()

  return (
    <GoldShimmer className="h-full">
      <div className="widget-card h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="widget-title mb-0">{t('leadsPulse')}</h3>
          <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <PulseOrb status="active" size={6} />
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider">{t('live')}</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-soft-muted border-b border-soft-subtle">
                <th className="pb-3 font-semibold">{t('lead')}</th>
                <th className="pb-3 font-semibold text-right">{t('budget')}</th>
                <th className="pb-3 font-semibold text-center">{t('priority')}</th>
                <th className="pb-3 font-semibold text-right">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-subtle">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-soft-muted italic">
                    {t('noLeadsRegistered')}
                  </td>
                </tr>
              ) : (
                leads.map((lead, index) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-soft-white">{lead.name}</span>
                        <span className="text-[10px] text-soft-muted uppercase tracking-tighter">{lead.source}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm font-medium text-blue-light text-right">{lead.budget}</td>
                    <td className="py-4 text-center">
                      <span className={`priority-badge priority-${lead.priority}`}>
                        P{lead.priority}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-[10px] uppercase tracking-wider text-soft-muted font-bold">{lead.status}</span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </GoldShimmer>
  )
}

