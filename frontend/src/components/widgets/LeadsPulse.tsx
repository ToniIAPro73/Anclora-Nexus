'use client'
import { useStore } from '@/lib/store'
import { PulseOrb } from '@/components/effects/PulseOrb'
import { GoldShimmer } from '@/components/effects/GoldShimmer'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { useI18n } from '@/lib/i18n'

export function LeadsPulse() {
  const leads = useStore((state) => state.leads)
  const { t } = useI18n()
  const router = useRouter()

  const displayLeads = leads.slice(0, 5)

  const getLeadStatusLabel = (status: string) => {
    const normalized = String(status || '').toLowerCase()
    if (normalized === 'new') return t('leadStatusNew')
    if (normalized === 'contacted') return t('leadStatusContacted')
    if (normalized === 'qualified') return t('leadStatusQualified')
    if (normalized === 'negotiating') return t('leadStatusNegotiating')
    if (normalized === 'closed') return t('leadStatusClosed')
    return status
  }

  return (
    <GoldShimmer className="h-full">
      <div className="widget-card h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Link href="/leads" className="hover:opacity-80 transition-opacity">
            <h3 className="widget-title mb-0 cursor-pointer">{t('leadsPulse')}</h3>
          </Link>
          <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <PulseOrb status="active" size={6} />
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider">{t('live')}</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto -mx-4 px-4">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-navy-deep z-10">
                <tr className="text-[10px] uppercase tracking-widest text-soft-muted border-b border-soft-subtle">
                  <th className="pb-3 font-semibold">{t('lead')}</th>
                  <th className="pb-3 pl-2 font-semibold text-right">{t('budget')}</th>
                  <th className="pb-3 pl-2 font-semibold text-center">{t('priority')}</th>
                  <th className="pb-3 pl-2 font-semibold text-right">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-subtle/50">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-soft-muted italic">
                      {t('noLeadsRegistered')}
                    </td>
                  </tr>
                ) : (
                  displayLeads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
                      onClick={() => router.push(`/leads?highlight=${lead.id}`)}
                      className="group hover:bg-white/[0.04] cursor-pointer transition-colors select-none"
                    >
                      <td className="py-3 pr-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-soft-white group-hover:text-gold transition-colors">{lead.name}</span>
                          <span className="text-[10px] text-soft-muted uppercase tracking-tighter">{lead.source}</span>
                        </div>
                      </td>
                      <td className="py-3 pl-2 text-xs font-medium text-blue-light text-right">{lead.budget}</td>
                      <td className="py-3 pl-2 text-center">
                        <span className={`priority-badge priority-${lead.priority} scale-90 origin-center`}>
                          P{lead.priority}
                        </span>
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <span className="text-[9px] uppercase tracking-wider text-soft-muted font-bold group-hover:text-white transition-colors">
                          {getLeadStatusLabel(lead.status)}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {leads.length > 0 && (
            <div className="pt-3 border-t border-soft-subtle/30 mt-auto flex justify-center">
              <Link 
                href="/leads" 
                className="text-[10px] uppercase tracking-wider font-bold text-soft-muted hover:text-gold transition-colors flex items-center gap-1 group"
              >
                {t('viewAll')} 
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </GoldShimmer>
  )
}

