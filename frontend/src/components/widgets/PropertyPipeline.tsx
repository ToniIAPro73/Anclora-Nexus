'use client'
import { useStore } from '@/lib/store'
import { StaggerList, StaggerItem } from '@/components/effects/animations'
import { Home, ExternalLink } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export function PropertyPipeline() {
  const properties = useStore((state) => state.properties)
  const router = useRouter()
  const { t } = useI18n()

  const columns = [
    { id: 'prospect', label: t('prospect') },
    { id: 'listed', label: t('listed') },
    { id: 'offer', label: t('offer') },
    { id: 'sold', label: t('sold') },
  ]

  // Flattened list for "View All" check
  const hasManyProperties = properties.length > 8

  return (
    <div className="widget-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <Link href="/properties" className="hover:opacity-80 transition-opacity">
          <h3 className="widget-title mb-0 cursor-pointer">{t('propertyPipeline')}</h3>
        </Link>
      </div>

      <div className="flex-1 overflow-auto flex flex-col">
        <div className="grid grid-cols-4 gap-2 h-full min-w-[400px]">
          {columns.map((col) => {
            const colProps = properties.filter((p) => p.status === col.id)
            const displayProps = colProps.slice(0, 3)
            const remaining = colProps.length - 3

            return (
              <div key={col.id} className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-soft-muted uppercase tracking-wider mb-2 block sticky top-0 bg-navy-deep/80 backdrop-blur-sm py-1">
                  {col.label} <span className="text-[8px] opacity-60">({colProps.length})</span>
                </span>
                <StaggerList className="flex flex-col gap-2">
                  {displayProps.map((prop) => (
                    <StaggerItem key={prop.id}>
                      <div 
                        onClick={() => router.push('/properties')}
                        className={`p-2 rounded-lg border border-soft-subtle/20 group hover:border-gold/30 transition-all cursor-pointer ${
                          col.id === 'sold' ? 'bg-gold/5 border-gold/20' : 'bg-white/[0.02]'
                        }`}
                      >
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
                  {remaining > 0 && (
                    <button 
                      onClick={() => router.push('/properties')}
                      className="w-full py-1.5 rounded-md bg-white/[0.02] border border-transparent hover:bg-white/[0.05] hover:border-gold/20 transition-all group/more flex items-center justify-center gap-1"
                    >
                      <span className="text-[9px] font-bold text-soft-muted group-hover/more:text-gold transition-colors">
                        +{remaining} {t('more')}
                      </span>
                    </button>
                  )}
                </StaggerList>
              </div>
            )
          })}
        </div>
        
        {hasManyProperties && (
          <div className="pt-2 border-t border-soft-subtle/30 mt-auto flex justify-center">
            <Link 
              href="/properties" 
              className="text-[10px] uppercase tracking-wider font-bold text-soft-muted hover:text-gold transition-colors flex items-center gap-1 group"
            >
              {t('viewAll')} 
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
