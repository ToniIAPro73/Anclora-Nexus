'use client'
import { useEffect, useState } from 'react'
import { useStore, Property } from '@/lib/store'
import { ArrowLeft, MapPin, Home, Euro, TrendingUp, ChevronLeft, ChevronRight, Trash2, Plus, Edit2 } from 'lucide-react'
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

export default function PropertiesPage() {
  const properties = useStore((state) => state.properties)
  const deleteProperty = useStore((state) => state.deleteProperty)
  const { t } = useI18n()
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

  const getOriginLabel = (property: Property, hasPbmLink: boolean) => {
    if (hasPbmLink || property.source_system === 'pbm') return 'Prospección + Match'
    if (property.source_system === 'widget') return 'Prospección automática'
    return 'Alta manual'
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

  const normalizeText = (v?: string) =>
    (v || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

  useEffect(() => {
    const syncPbmMeta = async () => {
      try {
        const [pbmPropsRes, pbmMatchesRes] = await Promise.all([
          listProperties({ limit: 500, offset: 0 }),
          listMatches({ limit: 500, offset: 0 }),
        ])

        const pbmProps = pbmPropsRes.items
        const pbmMatches = pbmMatchesRes.items

        const aggByPbmPropertyId: Record<string, PropertyPbmMeta> = {}
        for (const m of pbmMatches) {
          const prev = aggByPbmPropertyId[m.property_id] || {
            matchCount: 0,
            bestCommission: null,
            bestMatchScore: 0,
            topBuyerName: null,
            pbmSource: null,
          }
          const pbmPropertySource = pbmProps.find((p) => p.id === m.property_id)?.source || null
          const nextMatchScore = Math.max(prev.bestMatchScore, m.match_score || 0)
          const topBuyerName = (m.match_score || 0) >= prev.bestMatchScore ? (m.buyer_name || prev.topBuyerName) : prev.topBuyerName
          aggByPbmPropertyId[m.property_id] = {
            matchCount: prev.matchCount + 1,
            bestCommission:
              m.commission_estimate != null
                ? Math.max(prev.bestCommission ?? 0, m.commission_estimate)
                : prev.bestCommission,
            bestMatchScore: nextMatchScore,
            topBuyerName,
            pbmSource: pbmPropertySource,
          }
        }

        const localMeta: Record<string, PropertyPbmMeta> = {}

        for (const legacy of properties) {
          const legacyName = normalizeText(legacy.title || legacy.address)
          const legacyZone = normalizeText(legacy.zone || legacy.address)
          const legacyType = normalizeText(legacy.type)
          const legacyPrice = typeof legacy.price === 'number'
            ? legacy.price
            : Number(String(legacy.price).replace(/[^\d.]/g, ''))

          const linkedPbm = pbmProps.find((p: ProspectedProperty) => {
            const pbmName = normalizeText(p.title || p.city || '')
            const pbmZone = normalizeText(p.zone || p.city || '')
            const pbmType = normalizeText(p.property_type || '')
            const pbmPrice = p.price ?? null

            const nameMatch = legacyName && pbmName && (legacyName.includes(pbmName) || pbmName.includes(legacyName))
            const zoneMatch = legacyZone && pbmZone && (legacyZone.includes(pbmZone) || pbmZone.includes(legacyZone))
            const typeMatch = !legacyType || !pbmType || legacyType === pbmType

            const priceMatch =
              legacyPrice > 0 && pbmPrice && pbmPrice > 0
                ? Math.abs(legacyPrice - pbmPrice) / pbmPrice < 0.25
                : false

            return (nameMatch || (zoneMatch && priceMatch)) && typeMatch
          })

          if (linkedPbm && aggByPbmPropertyId[linkedPbm.id]) {
            localMeta[legacy.id] = {
              matchCount: aggByPbmPropertyId[linkedPbm.id].count,
              bestCommission: aggByPbmPropertyId[linkedPbm.id].bestCommission,
            }
          }
        }

        setPbmMetaByPropertyId(localMeta)
      } catch {
        // ignore PBM sync failures to avoid blocking Properties page
      }
    }

    syncPbmMeta()
  }, [properties])

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
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-navy-surface/40 border border-soft-subtle rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-gold/5 flex flex-col"
                  onClick={() => handleEdit(property)}
                >
                  {/* Property Header */}
                  <div className="p-6 border-b border-soft-subtle bg-navy-deep/20">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Home className="w-5 h-5 text-gold shrink-0" />
                        <h3 className="text-lg font-bold text-soft-white group-hover:text-gold transition-colors leading-tight line-clamp-1 md:line-clamp-2" title={property.title || property.address}>
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
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-soft-muted border border-soft-subtle">
                        {getOriginLabel(property, Boolean(pbmMetaByPropertyId[property.id]))}
                      </span>
                      {normalizePortal(property.source_portal) ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {normalizePortal(property.source_portal)}
                        </span>
                      ) : null}
                      {pbmMetaByPropertyId[property.id] ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          PBM ({pbmMetaByPropertyId[property.id].matchCount} matches)
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-soft-muted">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="line-clamp-1">{property.zone || property.address}</span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-6 space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-soft-muted uppercase tracking-wider">{t('price')}</span>
                      <div className="flex items-center gap-1 text-lg font-bold text-blue-light">
                        <Euro className="w-4 h-4" />
                        <span>{property.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-soft-muted uppercase tracking-wider">{t('estimatedCommission')}</span>
                      <div className="flex items-center gap-1 text-sm font-semibold text-gold">
                        <TrendingUp className="w-4 h-4" />
                        <span>
                          {pbmMetaByPropertyId[property.id]?.bestCommission != null
                            ? `€${pbmMetaByPropertyId[property.id].bestCommission?.toLocaleString()}`
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
