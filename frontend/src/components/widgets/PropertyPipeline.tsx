'use client'
import { useStore } from '@/lib/store'
import { Home, MapPin } from 'lucide-react'

export function PropertyPipeline() {
  const properties = useStore((state) => state.properties)

  const columns = [
    { id: 'prospect', label: 'Prospect' },
    { id: 'listed', label: 'Listed' },
    { id: 'sold', label: 'Sold' },
  ]

  return (
    <div className="widget-card h-full flex flex-col">
      <h3 className="widget-title">Property Pipeline</h3>
      
      <div className="flex-1 grid grid-cols-3 gap-2">
        {columns.map((col) => (
          <div key={col.id} className="flex flex-col gap-2">
            <div className="text-[10px] font-bold text-soft-muted uppercase tracking-[0.15em] mb-1">
              {col.label}
            </div>
            <div className="flex-1 space-y-2">
              {properties
                .filter((p) => p.status === col.id)
                .map((prop) => (
                  <div 
                    key={prop.id}
                    className="p-2.5 bg-navy-mid/40 border border-soft-subtle rounded-lg hover:border-blue-light/30 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Home className="w-3.5 h-3.5 text-blue-light" />
                      <span className="text-xs font-bold text-soft-white">
                        {(prop.price / 1000000).toFixed(1)}M€
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-soft-muted">
                      <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="truncate">{prop.address.split(',')[0]}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
