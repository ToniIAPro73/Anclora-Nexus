'use client'
import { X, Code, AlertTriangle, Info } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { IngestionEvent } from '@/lib/ingestion-api'

interface Props {
  event: IngestionEvent
  onClose: () => void
}

export function IngestionEventDetail({ event, onClose }: Props) {
  const { t } = useI18n()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-darker/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl border border-soft-subtle bg-navy-surface shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-soft-subtle bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-display font-semibold text-soft-white">{t('payloadDetails')}</h2>
            <p className="text-xs text-soft-muted mt-1 uppercase tracking-widest">{event.connector_name} • {event.external_id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-soft-muted hover:text-soft-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error detail if exists */}
          {event.status === 'error' && (
            <div className="p-4 rounded-2xl border border-red-400/20 bg-red-400/5 text-red-200">
              <div className="flex items-center gap-2 mb-2 font-semibold text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span>{t('errorDetails')}</span>
              </div>
              <p className="text-sm font-medium">{event.message}</p>
              {event.error_detail && (
                <pre className="mt-3 p-3 rounded-xl bg-navy-darker border border-red-400/10 text-[11px] font-mono overflow-x-auto">
                  {JSON.stringify(event.error_detail, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Info section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-soft-subtle bg-white/[0.01]">
              <div className="flex items-center gap-2 text-blue-light/70 mb-3">
                <Info className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t('details')}</span>
              </div>
              <dl className="space-y-2">
                <div className="flex justify-between text-xs">
                  <dt className="text-soft-muted">{t('status')}:</dt>
                  <dd className="text-soft-white font-medium uppercase">{event.status}</dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-soft-muted">{t('entityType')}:</dt>
                  <dd className="text-soft-white font-medium capitalize">{event.entity_type}</dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-soft-muted">{t('processedAt')}:</dt>
                  <dd className="text-soft-white font-medium">{event.processed_at}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Payload visualizer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gold/70">
              <Code className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t('viewPayload')}</span>
            </div>
            <div className="rounded-2xl border border-soft-subtle bg-navy-darker/80 p-4 font-mono text-[12px] text-blue-light/90 overflow-x-auto">
              <pre className="leading-relaxed">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-soft-subtle bg-white/[0.02] flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gold text-navy-deep font-bold text-sm tracking-wide hover:bg-gold-muted transition-all active:scale-95"
          >
            {t('closeLabel') || 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
