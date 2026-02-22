'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, User, Mail, Phone, Sparkles, Home, Loader2 } from 'lucide-react'
import { useStore, Lead } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { createLead } from '@/lib/api'
import { useCurrency } from '@/lib/currency'
import { buildLeadEditabilityPolicy, sanitizeLeadUpdates } from '@/lib/origin-editability'

interface LeadFormModalProps {
  isOpen: boolean
  onClose: () => void
  editLead?: Lead | null
}

export default function LeadFormModal({ isOpen, onClose, editLead }: LeadFormModalProps) {
  const { t } = useI18n()
  const { currency, currencyConfig, formatBudgetText } = useCurrency()
  const updateLead = useStore((state) => state.updateLead)
  const [loading, setLoading] = useState(false)
  const leadPolicy = buildLeadEditabilityPolicy(editLead?.source_system)
  const isLocked = (field: 'name' | 'email' | 'phone' | 'budget' | 'property_interest' | 'priority' | 'status') =>
    leadPolicy.lockedFields.includes(field)
  const lockReasonKey = leadPolicy.reasons[0]

  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    email: '',
    phone: '',
    budget: '',
    priority: 3,
    source: 'Manual',
    status: 'New',
    property_interest: '',
  })

  useEffect(() => {
    if (editLead) {
      setFormData({ ...editLead, budget: formatBudgetText(editLead.budget || '') })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        budget: '',
        priority: 3,
        source: 'Manual',
        status: 'New',
        property_interest: '',
      })
    }
  }, [editLead, isOpen, formatBudgetText])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return

    setLoading(true)
    try {
      if (editLead) {
        const sanitized = sanitizeLeadUpdates(formData as Partial<Lead>, leadPolicy)
        updateLead(editLead.id, sanitized)
      } else {
        await createLead(formData)
        await useStore.getState().initialize()
      }
      onClose()
    } catch (error) {
      console.error('Failed to save lead:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl bg-navy-deep border border-soft-subtle rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-soft-subtle flex items-center justify-between bg-navy-surface/50">
              <h2 className="text-xl font-bold text-soft-white flex items-center gap-2">
                <div className="text-gold">
                  {editLead ? <Pencil className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                {editLead ? 'Editar Contacto' : t('newLead') || 'Nuevo Contacto'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 -mr-2 text-soft-muted hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {editLead && leadPolicy.lockedFields.length > 0 ? (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                  <p className="font-semibold">{t('editabilityPolicyTitle')}</p>
                  <p className="mt-1">
                    {lockReasonKey === 'lead_auto_ingested'
                      ? t('editabilityReasonLeadAuto')
                      : t('editabilityPolicyDescription')}
                  </p>
                </div>
              ) : null}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('lead')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-subtle" />
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={isLocked('name')}
                      className="w-full pl-10 pr-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Nombre completo"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-subtle" />
                    <input
                      type="email"
                      required
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isLocked('email')}
                      className="w-full pl-10 pr-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-subtle" />
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={isLocked('phone')}
                      className="w-full pl-10 pr-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="+34 600..."
                    />
                  </div>
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('budget')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-soft-subtle">{currencyConfig.symbol}</span>
                    <input
                      type="text"
                      value={formData.budget || ''}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      disabled={isLocked('budget')}
                      className="w-full pl-10 pr-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={`ej. 1.5M - 2M ${currency}`}
                    />
                  </div>
                </div>
                
                {/* Property Interest */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Interés</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-subtle" />
                    <input
                      type="text"
                      value={formData.property_interest || ''}
                      onChange={(e) => setFormData({ ...formData, property_interest: e.target.value })}
                      disabled={isLocked('property_interest')}
                      className="w-full pl-10 pr-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="¿Qué busca? (ej. Villa en Andratx)"
                    />
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('priority')}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: p })}
                        disabled={isLocked('priority')}
                        className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all border ${
                          formData.priority === p
                            ? 'bg-gold text-navy-deep border-gold shadow-lg shadow-gold/20 scale-105'
                            : 'bg-navy-surface/50 text-soft-muted border-soft-subtle hover:border-gold/50 hover:text-soft-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        P{p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('status')}</label>
                  <select
                    value={formData.status || 'New'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={isLocked('status')}
                    className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <option value="New">{t('leadStatusNew')}</option>
                      <option value="Contacted">{t('leadStatusContacted')}</option>
                      <option value="Qualified">{t('leadStatusQualified')}</option>
                      <option value="Negotiating">{t('leadStatusNegotiating')}</option>
                      <option value="Closed">{t('leadStatusClosed')}</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 mt-6 border-t border-soft-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-soft-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-gold text-navy-deep text-sm font-bold hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editLead ? 'Guardar Cambios' : (loading ? 'Creando...' : 'Crear Contacto')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function Pencil({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      <path d="m15 5 4 4"/>
    </svg>
  )
}
