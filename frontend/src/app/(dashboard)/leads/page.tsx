'use client'
import { useStore } from '@/lib/store'
import { format } from 'date-fns'
import { ArrowLeft, Mail, Phone, Euro } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

export default function LeadsPage() {
  const leads = useStore((state) => state.leads)
  const { t } = useI18n()

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 rounded-lg bg-navy-surface/40 border border-soft-subtle hover:border-gold/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-soft-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-soft-white">{t('leads')}</h1>
              <p className="text-sm text-soft-muted mt-1">{t('contactManagement')}</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-navy-surface/40 border border-soft-subtle rounded-lg">
            <span className="text-sm text-soft-muted">{t('total')}: </span>
            <span className="text-lg font-bold text-gold">{leads.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-navy-surface/40 border border-soft-subtle rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-deep/50 border-b border-soft-subtle">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-soft-muted uppercase tracking-wider">
                    {t('lead')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-soft-muted uppercase tracking-wider">
                    {t('contact')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-soft-muted uppercase tracking-wider">
                    {t('budget')}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-soft-muted uppercase tracking-wider">
                    {t('priority')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-soft-muted uppercase tracking-wider">
                    {t('source')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-soft-muted uppercase tracking-wider">
                    {t('status')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-subtle">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-soft-muted italic">{t('noLeadsRegistered')}</p>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-soft-white">{lead.name}</span>
                          <span className="text-xs text-soft-muted mt-1">{lead.property_interest}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-soft-muted">
                            <Mail className="w-3 h-3" />
                            <span>{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-soft-muted">
                            <Phone className="w-3 h-3" />
                            <span>{lead.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm font-medium text-blue-light">
                          <Euro className="w-4 h-4" />
                          <span>{lead.budget}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`priority-badge priority-${lead.priority}`}>
                          P{lead.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs uppercase tracking-wider text-soft-muted font-medium">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {lead.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
