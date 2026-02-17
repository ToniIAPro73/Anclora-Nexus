'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { ingestionApi, IngestionEvent, IngestionStats } from '@/lib/ingestion-api'
import { IngestionSummary } from '@/components/ingestion/IngestionSummary'
import { IngestionEventList } from '@/components/ingestion/IngestionEventList'
import { IngestionEventDetail } from '@/components/ingestion/IngestionEventDetail'

export default function IngestionPage() {
  const { t } = useI18n()
  const [events, setEvents] = useState<IngestionEvent[]>([])
  const [stats, setStats] = useState<IngestionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<IngestionEvent | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [eventsData, statsData] = await Promise.all([
        ingestionApi.getEvents(),
        ingestionApi.getStats()
      ])
      setEvents(eventsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching ingestion data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="h-full p-6 overflow-hidden">
      <div className="max-w-[1400px] mx-auto h-full flex flex-col gap-5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-5 border-b border-soft-subtle/50">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/dashboard"
              className="p-2 rounded-xl border border-soft-subtle bg-navy-surface/40 text-soft-muted hover:text-soft-white hover:border-blue-light/50 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <h1 className="text-4xl font-bold text-soft-white tracking-tight">
              {t('ingestionTitle')}
            </h1>
          </div>
          <p className="text-soft-muted max-w-2xl leading-relaxed">
            {t('ingestionSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="btn-action"
          >
            <span className="btn-action-emoji" aria-hidden="true">✦</span>
            <span>{loading ? (t('loading') || 'Cargando') : (t('refresh') || 'Actualizar')}</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <IngestionSummary stats={stats} loading={loading} />

      {/* Event List */}
      <div className="space-y-4 min-h-0 overflow-auto pr-1 custom-scrollbar">
        <h2 className="text-3xl font-bold text-soft-white flex items-center gap-2">
          {t('eventLog')}
          <span className="px-2 py-0.5 rounded-full bg-blue-light/10 text-blue-light text-[10px] font-bold">
            {events.length}
          </span>
        </h2>
        <IngestionEventList 
          events={events} 
          loading={loading} 
          onViewDetails={setSelectedEvent} 
        />
      </div>

      {/* Detail Modal */}
      {selectedEvent && (
        <IngestionEventDetail 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
      </div>
    </div>
  )
}
