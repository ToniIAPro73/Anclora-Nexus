'use client'
import { useStore } from '@/lib/store'
import { ArrowLeft, MapPin, Home, Euro, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

export default function PropertiesPage() {
  const properties = useStore((state) => state.properties)
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
              <h1 className="text-3xl font-bold text-soft-white">{t('properties')}</h1>
              <p className="text-sm text-soft-muted mt-1">{t('propertyManagement')}</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-navy-surface/40 border border-soft-subtle rounded-lg">
            <span className="text-sm text-soft-muted">{t('total')}: </span>
            <span className="text-lg font-bold text-gold">{properties.length}</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.length === 0 ? (
            <div className="col-span-full bg-navy-surface/40 border border-soft-subtle rounded-2xl p-12 text-center">
              <p className="text-soft-muted italic">{t('noPipelineProperties')}</p>
            </div>
          ) : (
            properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-navy-surface/40 border border-soft-subtle rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-300 group"
              >
                {/* Property Header */}
                <div className="p-6 border-b border-soft-subtle">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-gold" />
                      <h3 className="text-lg font-bold text-soft-white group-hover:text-gold transition-colors">
                        {property.address}
                      </h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      property.stage === 'Captación' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      property.stage === 'Negociación' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {property.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-soft-muted">
                    <MapPin className="w-4 h-4" />
                    <span>{property.zone}</span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6 space-y-4">
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
                      <span>{property.commission_est}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-soft-subtle">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-soft-muted">{t('lastUpdate')}</span>
                      <span className="text-soft-white font-medium">{property.last_update}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
