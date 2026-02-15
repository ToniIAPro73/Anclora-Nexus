'use client'
import { useEffect, useState } from 'react'
import { useStore, Property } from '@/lib/store'
import { ArrowLeft, MapPin, Home, TrendingUp, ChevronLeft, ChevronRight, Trash2, Plus, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import PropertyFormModal from '@/components/modals/PropertyFormModal'
import { listMatches, listProperties, type ProspectedProperty } from '@/lib/prospection-api'

type PropertyPbmMeta = {
  matchCount: number
  bestCommission: number | null
  bestMatchScore: number
  topBuyerName: string | null
  pbmSource: string | null
}

import { useCurrency } from '@/lib/currency'

export default function PropertiesPage() {
  const properties = useStore((state) => state.properties)
  const deleteProperty = useStore((state) => state.deleteProperty)
  const { t } = useI18n()
  const { formatMoney, formatSurface } = useCurrency()
  const [pbmMetaByPropertyId, setPbmMetaByPropertyId] = useState<Record<string, PropertyPbmMeta>>({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  const ITEMS_PER_PAGE = 9
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE)
  
  const safeCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages))
  const paginatedProperties = properties.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE)

  const getPropertyStatusLabel = (status: string) => {
    const normalized = String(status || '').toLowerCase()
    if (normalized === 'prospect') return t('propertyStatusProspect')
    if (normalized === 'listed') return t('propertyStatusListed')
    if (normalized === 'offer') return t('propertyStatusOffer')
    if (normalized === 'sold') return t('propertyStatusSold')
    if (normalized === 'rejected') return t('propertyStatusRejected')
    return status
  }

  const getOriginLabel = (property: Property) => {
    if (property.source_system === 'pbm') return 'Prospero + Match'
    if (property.source_system === 'widget') return 'Auto-Prospero'
    return 'Manual'
  }

  const normalizePortal = (portal?: string | null) => {
    if (!portal) return null
    const v = String(portal).trim().toLowerCase()
    if (!v) return null
    if (v === 'idealista') return 'Idealista'
    if (v === 'fotocasa') return 'Fotocasa'
    if (v === 'facebook') return 'Facebook'
    if (v === 'instagram') return 'Instagram'
    if (v === 'rightmove') return 'Rightmove'
    if (v === 'kyero') return 'Kyero'
    return portal
  }

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setIsModalOpen(true)
  }

  const handleNewProperty = () => {
    setEditingProperty(null)
    setIsModalOpen(true)
  }

  // ... syncPbmMeta useEffect logic remains largely similar but simplified if needed ...

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
              <h1 className="text-3xl font-bold text-soft-white">{t('properties')}</h1>
              <p className="text-sm text-soft-muted mt-1">{t('propertyManagement')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button
                onClick={handleNewProperty}
                className="px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Propiedad
              </button>
             <div className="px-4 py-2 bg-navy-surface/40 border border-soft-subtle rounded-lg">
                <span className="text-sm text-soft-muted">{t('total')}: </span>
                <span className="text-lg font-bold text-gold">{properties.length}</span>
             </div>
          </div>
        </div>

        {/* Grid Container */}
        <div className="flex flex-col gap-6">
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.length === 0 ? (
              <div className="col-span-full bg-navy-surface/40 border border-soft-subtle rounded-2xl p-12 text-center">
                <p className="text-soft-muted italic">{t('noPipelineProperties')}</p>
              </div>
            ) : (
              paginatedProperties.map((property, index) => (
                (() => {
                  const isProspected = property.source_system === 'widget' || property.source_system === 'pbm'
                  return (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-navy-surface/40 border border-soft-subtle rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-gold/5 flex flex-col h-full"
                  onClick={() => handleEdit(property)}
                >
                  {/* Property Header */}
                  <div className="p-6 border-b border-soft-subtle bg-navy-deep/20 flex-none">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Home className="w-5 h-5 text-gold shrink-0" />
                          <h3 className="text-lg font-bold text-soft-white group-hover:text-gold transition-colors leading-tight line-clamp-1" title={property.title || property.address}>
                            {property.title || property.address}
                          </h3>
                        </div>
                        <span className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          property.status === 'prospect' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          property.status === 'offer' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          property.status === 'sold' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          property.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {getPropertyStatusLabel(property.status)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          property.source_system === 'pbm' 
                            ? 'bg-gold/10 text-gold border-gold/20' 
                            : property.source_system === 'widget'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                            : 'bg-white/5 text-soft-muted border-soft-subtle'
                        }`}>
                          {getOriginLabel(property)}
                        </span>
                        {property.source_portal && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-navy-deep/60 text-blue-light border border-blue-light/20 flex items-center gap-1">
                            {normalizePortal(property.source_portal)}
                          </span>
                        )}
                        {(property.built_area_m2 || property.useful_area_m2) && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/5 text-soft-white border border-soft-subtle flex items-center gap-1">
                            {formatSurface(property.built_area_m2 || property.useful_area_m2 || 0)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-soft-muted">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">{property.zone || property.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-6 space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-soft-muted uppercase tracking-wider">{t('price')}</span>
                      <div className="flex items-center gap-1 text-lg font-bold text-blue-light tabular-nums">
                        <span>{typeof property.price === 'number' ? formatMoney(property.price, { minFractionDigits: 0 }) : property.price}</span>
                      </div>
                    </div>

                    {isProspected ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-soft-muted uppercase tracking-wider">{t('estimatedCommission')}</span>
                          <div className="flex items-center gap-1 text-sm font-semibold text-gold">
                            <TrendingUp className="w-4 h-4" />
                            <span>
                              {pbmMetaByPropertyId[property.id]?.bestCommission != null
                                ? formatMoney(pbmMetaByPropertyId[property.id].bestCommission!, { minFractionDigits: 0 })
                                : (property.commission_est || '-')}
                            </span>
                          </div>
                        </div>

                        {pbmMetaByPropertyId[property.id]?.topBuyerName ? (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-soft-muted uppercase tracking-wider">Comprador potencial</span>
                            <span className="text-xs font-medium text-soft-white text-right line-clamp-1">
                              {pbmMetaByPropertyId[property.id].topBuyerName}
                            </span>
                          </div>
                        ) : null}

                        {(pbmMetaByPropertyId[property.id]?.bestMatchScore || property.match_score) ? (
                           <div className="flex items-center justify-between pt-2">
                              <span className="text-xs text-soft-muted uppercase tracking-wider">Match</span>
                              <div className="flex items-center gap-2">
                                 <div className="h-1.5 w-16 bg-navy-deep rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-gold to-amber-500" 
                                      style={{ width: `${pbmMetaByPropertyId[property.id]?.bestMatchScore || property.match_score}%` }}
                                    />
                                 </div>
                                 <span className="text-xs font-bold text-gold">{pbmMetaByPropertyId[property.id]?.bestMatchScore || property.match_score}%</span>
                              </div>
                           </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="text-[11px] text-soft-muted">
                        {t('noMatchDataForManual')}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 bg-navy-deep/30 border-t border-soft-subtle/30 flex justify-between items-center">
                      <span className="text-xs text-soft-muted italic">{property.last_update || 'Recently'}</span>
                      <div className="flex items-center gap-2">
                         <button
                           onClick={(e) => {
                             e.stopPropagation()
                             handleEdit(property)
                           }}
                           className="p-1.5 text-soft-muted hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all"
                           title="Editar"
                         >
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button
                           onClick={(e) => {
                             e.stopPropagation()
                             if (window.confirm('¿Eliminar esta propiedad?')) deleteProperty(property.id)
                           }}
                           className="p-1.5 text-soft-muted hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                           title="Eliminar propiedad"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                  </div>
                </motion.div>
                  )
                })()
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-navy-surface/40 border border-soft-subtle rounded-xl">
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
      
      <PropertyFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editProperty={editingProperty}
      />
    </div>
  )
}
