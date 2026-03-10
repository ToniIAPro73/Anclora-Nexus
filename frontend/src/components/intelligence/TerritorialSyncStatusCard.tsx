'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, Database, RefreshCw } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type SyncStatus = {
  status: 'ready' | 'warning' | 'error' | string
  generated_at?: string
  source_mode?: string
  notebook_name?: string
  age_hours?: number | null
  coverage?: {
    query_count?: number
    zones?: string[]
    total_word_count?: number
  }
  source_refs?: string[]
  warnings?: string[]
  errors?: string[]
}

type PipelineStatus = {
  status: 'idle' | 'running' | 'success' | 'error' | string
  message?: string
  started_at?: string | null
  finished_at?: string | null
  last_success_at?: string | null
  last_error_at?: string | null
  stats?: {
    sellers_created?: number
    signals_received?: number
    queries_synced?: number
    outreach_processed?: number
  }
}

function statusStyles(status: string) {
  if (status === 'ready') {
    return {
      border: 'border-emerald-500/25',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      icon: CheckCircle2,
      label: 'ready',
    }
  }
  if (status === 'warning') {
    return {
      border: 'border-amber-500/25',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
      icon: Clock3,
      label: 'warning',
    }
  }
  return {
    border: 'border-red-500/25',
    badge: 'bg-red-500/10 text-red-400 border-red-500/25',
    icon: AlertTriangle,
    label: 'error',
  }
}

export function TerritorialSyncStatusCard() {
  const { t } = useI18n()
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/intelligence/territorial-sync-status`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('sync status unavailable')
      const body = await res.json()
      setSyncStatus(body.sync_status as SyncStatus)
      setPipelineStatus((body.pipeline_status || null) as PipelineStatus | null)
    } catch {
      setSyncStatus({
        status: 'error',
        errors: [t('territorialSyncUnavailable')],
      })
      setPipelineStatus({
        status: 'error',
        message: t('territorialPipelineUnavailable'),
      })
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const current = syncStatus || { status: 'warning' }
  const styles = statusStyles(current.status)
  const Icon = styles.icon
  const generatedAt = current.generated_at
    ? new Date(current.generated_at).toLocaleString('es-ES')
    : '—'
  const latestRunAt = pipelineStatus?.finished_at || pipelineStatus?.started_at
  const latestRunLabel = latestRunAt ? new Date(latestRunAt).toLocaleString('es-ES') : '—'
  const pipelineStats = pipelineStatus?.stats || {}
  const pipelineTone =
    pipelineStatus?.status === 'success'
      ? 'text-emerald-400'
      : pipelineStatus?.status === 'running'
        ? 'text-amber-300'
        : pipelineStatus?.status === 'error'
          ? 'text-red-400'
          : 'text-soft-muted'

  return (
    <div className={`rounded-2xl border ${styles.border} bg-navy-surface/40 p-5 mb-6`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-soft-white">{t('territorialSyncTitle')}</h2>
              <p className="text-sm text-soft-muted">{t('territorialSyncSubtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide ${styles.badge}`}>
            <Icon className="w-3.5 h-3.5" />
            {t(`territorialSyncStatus_${styles.label}` as TranslationKey)}
          </span>
          <button
            type="button"
            onClick={() => void load()}
            className="p-2 rounded-lg border border-soft-subtle/20 text-soft-muted hover:text-gold hover:border-gold/30 transition-colors"
            aria-label={t('refresh')}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-5">
        <div className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('territorialSyncNotebook')}</p>
          <p className="text-sm text-soft-white mt-2">{current.notebook_name || '—'}</p>
        </div>
        <div className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('territorialSyncGeneratedAt')}</p>
          <p className="text-sm text-soft-white mt-2">{generatedAt}</p>
        </div>
        <div className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('territorialSyncCoverage')}</p>
          <p className="text-sm text-soft-white mt-2">
            {current.coverage?.query_count || 0} {t('territorialSyncQueries')} · {(current.coverage?.zones || []).length} {t('territorialSyncZones')}
          </p>
        </div>
        <div className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('territorialSyncMode')}</p>
          <p className="text-sm text-soft-white mt-2">{current.source_mode || '—'}</p>
        </div>
        <div className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('territorialPipelineLastRun')}</p>
          <p className={`text-sm mt-2 ${pipelineTone}`}>{latestRunLabel}</p>
          <p className="text-[11px] text-soft-muted mt-1">
            {t('status')}: {pipelineStatus?.status || 'idle'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('territorialSyncSourceRefs')}</p>
          <ul className="mt-2 space-y-1 text-sm text-soft-white">
            {(current.source_refs || []).slice(0, 4).map((ref) => (
              <li key={ref} className="truncate">{ref}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('territorialSyncObservations')}</p>
          <ul className="mt-2 space-y-1 text-sm text-soft-white">
            {(current.errors?.length ? current.errors : current.warnings)?.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
            {!current.errors?.length && !current.warnings?.length && (
              <li>{t('territorialSyncHealthy')}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('territorialPipelineStats')}</p>
          <p className={`text-sm ${pipelineTone}`}>{pipelineStatus?.message || t('territorialPipelineNoRuns')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
          <div>
            <p className="text-soft-muted text-[11px] uppercase tracking-wide">{t('territorialPipelineSignals')}</p>
            <p className="text-soft-white mt-1">{pipelineStats.signals_received || 0}</p>
          </div>
          <div>
            <p className="text-soft-muted text-[11px] uppercase tracking-wide">{t('territorialPipelineSellers')}</p>
            <p className="text-soft-white mt-1">{pipelineStats.sellers_created || 0}</p>
          </div>
          <div>
            <p className="text-soft-muted text-[11px] uppercase tracking-wide">{t('territorialPipelineQueries')}</p>
            <p className="text-soft-white mt-1">{pipelineStats.queries_synced || 0}</p>
          </div>
          <div>
            <p className="text-soft-muted text-[11px] uppercase tracking-wide">{t('territorialPipelineOutreach')}</p>
            <p className="text-soft-white mt-1">{pipelineStats.outreach_processed || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
