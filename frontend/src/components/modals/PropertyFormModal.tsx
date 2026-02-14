'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Home, MapPin, Euro, Activity, Loader2 } from 'lucide-react'
import { useStore, Property } from '@/lib/store'
import { createProperty } from '@/lib/api'
import { useI18n } from '@/lib/i18n'

interface PropertyFormModalProps {
  isOpen: boolean
  onClose: () => void
  editProperty?: Property | null
}

export default function PropertyFormModal({ isOpen, onClose, editProperty }: PropertyFormModalProps) {
  const { t } = useI18n()
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

  useEffect(() => {
    if (editProperty) {
      setFormData(editProperty)
    } else {
      setFormData({
        title: '',
        address: '',
        price: '',
        status: 'prospect',
        source_system: 'manual',
        source_portal: '',
        match_score: 0,
        image: '/images/prop-placeholder.jpg'
      })
    }
  }, [editProperty, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.address) return

    setLoading(true)
    try {
      if (editProperty) {
        updateProperty(editProperty.id, formData)
      } else {
        await createProperty(formData)
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
                {editProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Title */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Título (Opcional)</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50"
                    placeholder="ej. Villa Moderna en Andratx"
                  />
                </div>

                {/* Address (Location) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Dirección / Zona</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-subtle" />
                    <input
                      type="text"
                      required
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50"
                      placeholder="ej. Port d'Andratx"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Precio</label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-subtle" />
                    <input
                      type="text"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })} // Handles string or number
                      className="w-full pl-10 pr-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50"
                      placeholder="ej. 4.5M"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Estado</label>
                  <select
                    value={formData.status || 'prospect'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Property['status'] })}
                    className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all appearance-none cursor-pointer"
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
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Origen</label>
                  <select
                    value={formData.source_system || 'manual'}
                    onChange={(e) => setFormData({ ...formData, source_system: e.target.value as Property['source_system'] })}
                    className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="manual">Alta manual</option>
                    <option value="widget">Prospección automática</option>
                    <option value="pbm">Prospección + Match</option>
                  </select>
                </div>

                {/* Source Portal */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Portal / Fuente</label>
                  <select
                    value={formData.source_portal || ''}
                    onChange={(e) => setFormData({ ...formData, source_portal: e.target.value })}
                    className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Ninguno</option>
                    <option value="idealista">Idealista</option>
                    <option value="fotocasa">Fotocasa</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="rightmove">Rightmove</option>
                    <option value="kyero">Kyero</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                {/* Match Score (Simulated) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Match Score (0-100)</label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-subtle" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.match_score || 0}
                      onChange={(e) => setFormData({ ...formData, match_score: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50"
                    />
                  </div>
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
                  {editProperty ? 'Guardar Cambios' : (loading ? 'Guardando...' : 'Crear Propiedad')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
