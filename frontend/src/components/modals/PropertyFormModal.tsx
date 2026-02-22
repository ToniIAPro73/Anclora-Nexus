'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Home, MapPin, Activity, Loader2 } from 'lucide-react'
import { useStore, Property } from '@/lib/store'
import { createProperty, PropertyData } from '@/lib/api'
import { useI18n } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import { buildPropertyEditabilityPolicy, sanitizePropertyUpdates } from '@/lib/origin-editability'

interface PropertyFormModalProps {
  isOpen: boolean
  onClose: () => void
  editProperty?: Property | null
}

export default function PropertyFormModal({ isOpen, onClose, editProperty }: PropertyFormModalProps) {
  const { t } = useI18n()
  const { currency, currencyConfig, unitSystem, parseAmount, convertFromEur } = useCurrency()
  const updateProperty = useStore((state) => state.updateProperty)
  const [loading, setLoading] = useState(false)

  // Estado inicial
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    address: '',
    price: '',
    status: 'prospect',
    source_system: 'manual',
    source_portal: '',
    match_score: 0,
    image: '/images/prop-placeholder.jpg'
  })
  const propertyPolicy = buildPropertyEditabilityPolicy(editProperty?.source_system || formData.source_system)
  const isLocked = (field: 'title' | 'address' | 'price' | 'status' | 'source_system' | 'source_portal' | 'match_score' | 'useful_area_m2' | 'built_area_m2' | 'plot_area_m2' | 'zone' | 'type') =>
    propertyPolicy.lockedFields.includes(field)
  const isScoreLocked = isLocked('match_score')
  const areaUnit = unitSystem === 'metric' ? 'm²' : 'sq ft'

  const formatNumberDisplay = (value: number, maximumFractionDigits = 0) => {
    if (!Number.isFinite(value)) return ''
    return new Intl.NumberFormat(currencyConfig.locale, {
      maximumFractionDigits,
      minimumFractionDigits: 0,
    }).format(value)
  }

  const parseLooseNumber = (raw: string): number => {
    if (!raw) return 0
    const cleaned = raw.replace(/[^\d,.\-]/g, '')
    const hasComma = cleaned.includes(',')
    const hasDot = cleaned.includes('.')
    let normalized = cleaned
    if (hasComma && hasDot) {
      const lastComma = cleaned.lastIndexOf(',')
      const lastDot = cleaned.lastIndexOf('.')
      normalized = lastComma > lastDot ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned.replace(/,/g, '')
    } else if (hasComma) {
      normalized = cleaned.replace(',', '.')
    }
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }

  useEffect(() => {
    if (editProperty) {
      const formatInLocale = (value: number) =>
        new Intl.NumberFormat(currencyConfig.locale, {
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
        }).format(value)
      const rawPrice = typeof editProperty.price === 'number'
        ? formatInLocale(convertFromEur(editProperty.price))
        : formatInLocale(parseLooseNumber(String(editProperty.price || '0')))
      setFormData({ ...editProperty, price: rawPrice })
    } else {
      setFormData({
        title: '',
        address: '',
        price: '',
        status: 'prospect',
        source_system: 'manual',
        source_portal: '',
        match_score: 0,
        useful_area_m2: 0,
        built_area_m2: 0,
        plot_area_m2: 0,
        image: '/images/prop-placeholder.jpg'
      })
    }
  }, [editProperty, isOpen, convertFromEur, currencyConfig.locale])

  const toDisplayArea = (areaM2?: number) => {
    const base = areaM2 ?? 0
    return unitSystem === 'metric' ? base : Math.round(base * 10.7639)
  }

  const toStoredArea = (displayValue: number) => {
    if (!Number.isFinite(displayValue) || displayValue <= 0) return 0
    return unitSystem === 'metric' ? displayValue : Number((displayValue / 10.7639).toFixed(2))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.address) return

    setLoading(true)
    try {
      const normalizedPrice = parseAmount(String(formData.price ?? '')) ?? 0
      const payload: PropertyData = {
        address: formData.address || '',
        price: String(normalizedPrice),
        type: formData.type,
        status: formData.status,
        zone: formData.zone,
        useful_area_m2: formData.useful_area_m2,
        built_area_m2: formData.built_area_m2,
        plot_area_m2: formData.plot_area_m2,
        match_score: (formData.source_system || 'manual') === 'manual' ? 0 : (formData.match_score || 0),
        source_system: formData.source_system,
        source_portal: formData.source_portal
      }

      if (editProperty) {
        const sanitized = sanitizePropertyUpdates(payload as unknown as Partial<Property>, propertyPolicy)
        updateProperty(editProperty.id, sanitized)
      } else {
        await createProperty(payload)
        // Refresh to get real ID and correct mapping
        await useStore.getState().initialize()
      }
      onClose()
    } catch (error) {
      console.error('Failed to save property:', error)
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
                <Home className="w-5 h-5 text-gold" />
                {editProperty ? t('propertyFormEditTitle') : t('propertyFormCreateTitle')}
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
              {editProperty && propertyPolicy.lockedFields.length > 0 ? (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                  <p className="font-semibold">{t('editabilityPolicyTitle')}</p>
                  <p className="mt-1">
                    {propertyPolicy.reasons.includes('property_pbm_scoring')
                      ? t('editabilityReasonPropertyPbm')
                      : t('editabilityReasonPropertyAuto')}
                  </p>
                </div>
              ) : null}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Title */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('propertyFormTitleOptional')}</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={isLocked('title')}
                    className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={t('propertyFormTitlePlaceholder')}
                  />
                </div>

                {/* Address (Location) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('propertyFormAddressZone')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-subtle" />
                    <input
                      type="text"
                      required
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={isLocked('address')}
                      className="w-full pl-10 pr-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={t('propertyFormAddressPlaceholder')}
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Precio ({currency})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-soft-subtle">{currencyConfig.symbol}</span>
                    <input
                      type="text"
                      value={formData.price || ''}
                      onChange={(e) => {
                        const n = parseLooseNumber(e.target.value)
                        const formatted = e.target.value.trim() === '' ? '' : formatNumberDisplay(n, 0)
                        setFormData({ ...formData, price: formatted })
                      }}
                      disabled={isLocked('price')}
                      className="w-full pl-10 pr-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="ej. 4500000"
                    />
                  </div>
                </div>

                {/* Built Area */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('propertyFormBuiltArea')} ({areaUnit})</label>
                  <input
                    type="text"
                    value={formatNumberDisplay(toDisplayArea(formData.built_area_m2), 0)}
                    onChange={(e) => {
                      const parsed = parseLooseNumber(e.target.value)
                      setFormData({ ...formData, built_area_m2: toStoredArea(parsed) })
                    }}
                    disabled={isLocked('built_area_m2')}
                    className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Useful Area */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('propertyFormUsefulArea')} ({areaUnit})</label>
                  <input
                    type="text"
                    value={formatNumberDisplay(toDisplayArea(formData.useful_area_m2), 0)}
                    onChange={(e) => {
                      const parsed = parseLooseNumber(e.target.value)
                      setFormData({ ...formData, useful_area_m2: toStoredArea(parsed) })
                    }}
                    disabled={isLocked('useful_area_m2')}
                    className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Plot Area */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('propertyFormPlotArea')} ({areaUnit})</label>
                  <input
                    type="text"
                    value={formatNumberDisplay(toDisplayArea(formData.plot_area_m2), 0)}
                    onChange={(e) => {
                      const parsed = parseLooseNumber(e.target.value)
                      setFormData({ ...formData, plot_area_m2: toStoredArea(parsed) })
                    }}
                    disabled={isLocked('plot_area_m2')}
                    className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('status')}</label>
                  <select
                    value={formData.status || 'prospect'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Property['status'] })}
                    disabled={isLocked('status')}
                    className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="prospect">{t('propertyStatusProspect')}</option>
                    <option value="listed">{t('propertyStatusListed')}</option>
                    <option value="offer">{t('propertyStatusOffer')}</option>
                    <option value="sold">{t('propertyStatusSold')}</option>
                    <option value="rejected">{t('propertyStatusRejected')}</option>
                  </select>
                </div>

                {/* Source System */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('propertyFormSource')}</label>
                  <select
                    value={formData.source_system || 'manual'}
                    onChange={(e) => setFormData({ ...formData, source_system: e.target.value as Property['source_system'] })}
                    disabled={isLocked('source_system')}
                    className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="manual">{t('propertyFormManualEntry')}</option>
                    <option value="widget">{t('propertyFormAutoProspection')}</option>
                    <option value="pbm">{t('propertyFormProspectionMatch')}</option>
                  </select>
                </div>

                {/* Source Portal */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('propertyFormPortalSource')}</label>
                  <select
                    value={formData.source_portal || ''}
                    onChange={(e) => setFormData({ ...formData, source_portal: e.target.value })}
                    disabled={isLocked('source_portal')}
                    className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{t('none')}</option>
                    <option value="idealista">Idealista</option>
                    <option value="fotocasa">Fotocasa</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="rightmove">Rightmove</option>
                    <option value="kyero">Kyero</option>
                    <option value="other">{t('sourceOther')}</option>
                  </select>
                </div>

                {/* Match Score (only non-manual origins) */}
                {(formData.source_system || 'manual') !== 'manual' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('matchScore')} (0-100)</label>
                    <div className="relative">
                      <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-subtle" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.match_score || 0}
                        onChange={(e) => setFormData({ ...formData, match_score: Number(e.target.value) })}
                        disabled={isScoreLocked}
                        className="w-full pl-10 pr-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50 disabled:opacity-50"
                      />
                    </div>
                    {(formData.source_system || 'manual') === 'pbm' && (
                      <p className="text-[11px] text-soft-muted">{t('propertyFormMatchScoreHint')}</p>
                    )}
                  </div>
                ) : null}

              </div>

              {/* Footer */}
              <div className="pt-6 mt-6 border-t border-soft-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-soft-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-gold text-navy-deep text-sm font-bold hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editProperty ? t('propertyFormSaveChanges') : (loading ? t('propertyFormSaving') : t('propertyFormCreateAction'))}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
