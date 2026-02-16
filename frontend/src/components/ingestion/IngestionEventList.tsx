'use client'
import { useState } from 'react'
import { format } from 'date-fns'
import { Eye, Filter, Database, Tag, Calendar, ChevronRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { IngestionEvent, IngestionStatus, EntityType } from '@/lib/ingestion-api'

interface Props {
  events: IngestionEvent[]
  loading: boolean
  onViewDetails: (event: IngestionEvent) => void
}

export function IngestionEventList({ events, loading, onViewDetails }: Props) {
  const { t } = useI18n()
  const [statusFilter, setStatusFilter] = useState<IngestionStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all')

  const filteredEvents = events.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (typeFilter !== 'all' && e.entity_type !== typeFilter) return false
    return true
  })

  const getStatusColor = (status: IngestionStatus) => {
    switch (status) {
      case 'success': return 'bg-green-400/10 text-green-400 border-green-400/20'
      case 'duplicate': return 'bg-blue-400/10 text-blue-400 border-blue-400/20'
      case 'error': return 'bg-red-400/10 text-red-400 border-red-400/20'
      default: return 'bg-soft-white/5 text-soft-muted border-soft-subtle'
    }
  }

  const getStatusLabel = (status: IngestionStatus) => {
    switch (status) {
      case 'success': return t('ingested')
      case 'duplicate': return t('duplicate')
      case 'error': return t('failed')
      default: return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-soft-subtle bg-navy-surface/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-soft-muted" />
          <span className="text-sm font-medium text-soft-white">{t('filters')}</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-navy-darker border border-soft-subtle text-soft-white text-xs rounded-lg px-3 py-1.5 focus:border-blue-light/50 outline-none transition-all cursor-pointer"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="success">{t('ingested')}</option>
            <option value="duplicate">{t('duplicate')}</option>
            <option value="error">{t('failed')}</option>
          </select>

          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-navy-darker border border-soft-subtle text-soft-white text-xs rounded-lg px-3 py-1.5 focus:border-blue-light/50 outline-none transition-all cursor-pointer"
          >
            <option value="all">{t('viewAll')}</option>
            <option value="lead">{t('lead')}</option>
            <option value="property">{t('properties')}</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-soft-subtle bg-navy-surface/40 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-soft-subtle bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('processedAt')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('connector')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('entityType')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('externalId')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-soft-muted uppercase tracking-wider">{t('status')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-soft-muted uppercase tracking-wider text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-subtle/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-soft-white/5 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-soft-muted italic">
                    {t('noEventsFound')}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-soft-white">
                        <Calendar className="w-3.5 h-3.5 text-blue-light/60" />
                        {event.processed_at ? format(new Date(event.processed_at), 'dd/MM/yy HH:mm') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-soft-white font-medium">
                        <Database className="w-3.5 h-3.5 text-gold/60" />
                        {event.connector_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs text-soft-muted">
                        <Tag className="w-3 h-3" />
                        <span className="capitalize">{event.entity_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-[10px] text-blue-light/80">
                      {event.external_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onViewDetails(event)}
                        className="p-1.5 rounded-lg border border-soft-subtle/50 text-soft-muted hover:text-blue-light hover:border-blue-light/50 transition-all"
                        title={t('viewPayload')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
