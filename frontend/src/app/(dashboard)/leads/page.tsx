'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useStore, Lead } from '@/lib/store'
import { ArrowLeft, Mail, Phone, Euro, ChevronLeft, ChevronRight, Trash2, Pencil, Plus } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import LeadFormModal from '@/components/modals/LeadFormModal'

export default function LeadsPage() {
  const leads = useStore((state) => state.leads)
  const deleteLead = useStore((state) => state.deleteLead)
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const [highlightId, setHighlightId] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE)
  
  const safeCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages))
  const paginatedLeads = leads.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE)

  useEffect(() => {
    const hl = searchParams.get('highlight')
    if (hl) setHighlightId(hl)
  }, [searchParams])

  useEffect(() => {
    if (highlightId) {
      const index = leads.findIndex(l => l.id === highlightId)
      if (index !== -1) {
        const targetPage = Math.ceil((index + 1) / ITEMS_PER_PAGE)
        setCurrentPage(targetPage)
        
        setTimeout(() => {
          const el = document.getElementById(`lead-row-${highlightId}`)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 300)
      }
    }
  }, [highlightId, leads])

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
          <div className="flex items-center gap-4">
             <div className="text-right">
                <span className="text-sm text-soft-muted">{t('total')}: </span>
                <span className="text-lg font-bold text-gold">{leads.length}</span>
             </div>
             <button
                onClick={() => {
                  setEditingLead(null)
                  setIsModalOpen(true)
                }}
                className="px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('newLead')}
              </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-navy-surface/40 border border-soft-subtle rounded-2xl overflow-hidden shadow-lg shadow-navy-deep/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-deep/50 border-b border-soft-subtle">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-soft-muted uppercase tracking-wider w-[20%]">
                    {t('lead')}
                  </th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-soft-muted uppercase tracking-wider w-[20%]">
                    {t('contact')}
                  </th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-soft-muted uppercase tracking-wider w-[15%]">
                    {t('budget')}
                  </th>
                  <th className="px-3 py-4 text-center text-xs font-semibold text-soft-muted uppercase tracking-wider w-[10%]">
                    {t('priority')}
                  </th>
                  <th className="px-3 py-4 text-left text-xs font-semibold text-soft-muted uppercase tracking-wider w-[15%]">
                    {t('source')}
                  </th>
                  <th className="px-3 py-4 text-right text-xs font-semibold text-soft-muted uppercase tracking-wider w-[15%]">
                    {t('status')}
                  </th>
                  <th className="px-3 py-4 text-right text-xs font-semibold text-soft-muted uppercase tracking-wider w-[100px] min-w-[100px]">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-subtle/50">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-12 text-center">
                      <p className="text-soft-muted italic">{t('noLeadsRegistered')}</p>
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead, index) => {
                    const isHighlighted = lead.id === highlightId
                    return (
                      <motion.tr
                        key={lead.id}
                        id={`lead-row-${lead.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`group transition-all duration-500 ${
                          isHighlighted 
                            ? 'bg-gold/10 border-y border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                            : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="px-3 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-soft-white">{lead.name}</span>
                            <span className="text-xs text-soft-muted mt-1">{lead.property_interest}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4">
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
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-1 text-sm font-medium text-blue-light">
                            <Euro className="w-4 h-4" />
                            <span>{lead.budget}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <span className={`priority-badge priority-${lead.priority}`}>
                            P{lead.priority}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <span className="text-xs uppercase tracking-wider text-soft-muted font-medium">
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingLead(lead)
                                setIsModalOpen(true)
                              }}
                              className="p-2 text-soft-muted hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 border border-white/10 rounded-lg transition-all shadow-sm shrink-0"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
                                  deleteLead(lead.id)
                                }
                              }}
                              className="p-2 text-soft-muted hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 rounded-lg transition-all shadow-sm shrink-0"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-soft-subtle/50 bg-navy-deep/30">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-soft-muted hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs text-soft-muted font-medium">
                Page <span className="text-gold font-bold">{safeCurrentPage}</span> of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-soft-muted hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
      
      <LeadFormModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setEditingLead(null)
        }} 
        editLead={editingLead} 
      />
    </div>
  )
}
