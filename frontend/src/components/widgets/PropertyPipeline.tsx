'use client'
import { useStore } from '@/lib/store'
import { StaggerList, StaggerItem } from '@/components/effects/animations'
import { Home, ExternalLink } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function PropertyPipeline() {
  const properties = useStore((state) => state.properties)
  const { t } = useI18n()

  const columns = [
    { id: 'prospect', label: 'Prospect' },
    { id: 'listed', label: 'Listed' },
    { id: 'offer', label: 'Offer' },
    { id: 'sold', label: 'Sold' },
  ]

  return (
    <div className="widget-card h-full flex flex-col">
      <h3 className="widget-title">{t('propertyPipeline')}</h3>
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-4 gap-2 h-full min-w-[400px]">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-soft-muted uppercase tracking-wider mb-2 block sticky top-0 bg-navy-deep/80 backdrop-blur-sm py-1">
                {col.label}
              </span>
              <StaggerList className="flex flex-col gap-2">
                {properties
                  .filter((p) => p.status === col.id)
                  .map((prop) => (
                    <StaggerItem key={prop.id}>
                      <div className={`p-2 rounded-lg border border-soft-subtle/20 group hover:border-gold/30 transition-all ${
                        col.id === 'sold' ? 'bg-gold/5 border-gold/20' : 'bg-white/[0.02]'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <Home className={`w-3 h-3 ${col.id === 'sold' ? 'text-gold' : 'text-blue-light'}`} />
                          <ExternalLink className="w-2 h-2 text-soft-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[10px] text-soft-white font-medium truncate mb-1">{prop.address}</p>
                        <p className={`text-[11px] font-bold tabular-nums ${col.id === 'sold' ? 'text-gold' : 'text-soft-white'}`}>
                          {typeof prop.price === 'number' ? `${(prop.price / 1000000).toFixed(1)}M€` : prop.price}
                        </p>
                      </div>
                    </StaggerItem>
                  ))}
              </StaggerList>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
