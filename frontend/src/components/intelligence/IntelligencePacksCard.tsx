'use client'

import { useCallback, useEffect, useState } from 'react'
import { BookOpen, Globe2, Layers3, Plus, RefreshCw } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Language, TranslationKey } from '@/lib/i18n'
import { authFetch } from '@/lib/auth-fetch'

const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  es: 'es-ES',
  en: 'en-US',
  de: 'de-DE',
  ru: 'ru-RU',
}

type IntelligencePack = {
  id: string
  pack_key: string
  pack_label: string
  notebook_id: string
  notebook_name: string
  market_scope: 'seller' | 'buyer' | 'mixed' | string
  zone_scope: string[]
  language_code: 'es' | 'en' | 'de' | 'ru' | string
  source_mode: 'notebooklm_manual' | 'live_sync_pack' | 'imported_rag' | string
  status: 'active' | 'draft' | 'archived' | string
  is_default: boolean
  last_synced_at?: string | null
  age_hours?: number | null
  insight_count?: number
  zones_with_data?: string[]
  synthetic?: boolean
}

type IntelligencePacksResponse = {
  items: IntelligencePack[]
  active_pack?: IntelligencePack | null
}

function inputClassName() {
  return 'w-full rounded-xl border border-soft-subtle/30 bg-navy-deep/40 px-3 py-2 text-sm text-soft-white outline-none transition-colors focus:border-gold/40'
}

export function IntelligencePacksCard() {
  const { t, language } = useI18n()
  const [packs, setPacks] = useState<IntelligencePack[]>([])
  const [activePackId, setActivePackId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    pack_label: '',
    notebook_name: '',
    notebook_id: '',
    zone_scope: '',
    market_scope: 'seller',
    source_mode: 'notebooklm_manual',
    language_code: 'es',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch('/api/intelligence/packs', { cache: 'no-store' })
      if (!res.ok) throw new Error(t('intelligencePacksLoadingError'))
      const body = (await res.json()) as IntelligencePacksResponse
      setPacks(body.items || [])
      setActivePackId(body.active_pack?.id || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('intelligencePacksLoadingError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const activatePack = async (packId: string) => {
    setSaving(true)
    setError(null)
    try {
      const res = await authFetch(`/api/intelligence/packs/${packId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true, status: 'active' }),
      })
      if (!res.ok) throw new Error(t('intelligencePacksActivateError'))
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('intelligencePacksActivateError'))
    } finally {
      setSaving(false)
    }
  }

  const createPack = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await authFetch('/api/intelligence/packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pack_label: form.pack_label.trim(),
          notebook_name: form.notebook_name.trim(),
          notebook_id: form.notebook_id.trim(),
          zone_scope: form.zone_scope.split(',').map((item) => item.trim()).filter(Boolean),
          market_scope: form.market_scope,
          source_mode: form.source_mode,
          language_code: form.language_code,
          is_default: packs.length === 0,
        }),
      })
      if (!res.ok) throw new Error(t('intelligencePacksCreateError'))
      setForm({
        pack_label: '',
        notebook_name: '',
        notebook_id: '',
        zone_scope: '',
        market_scope: 'seller',
        source_mode: 'notebooklm_manual',
        language_code: 'es',
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('intelligencePacksCreateError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="surface-primary surface-copy-safe rounded-2xl border border-soft-subtle/30 bg-navy-surface/40 p-5 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Layers3 className="w-5 h-5 text-gold" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-soft-white">{t('intelligencePacksTitle')}</h2>
              <p className="text-sm text-soft-muted">{t('intelligencePacksSubtitle')}</p>
            </div>
          </div>
          <p className="text-xs text-soft-muted mt-3 break-words">{t('intelligencePacksIsolation')}</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl border border-soft-subtle/20 bg-navy-deep/30 px-3 py-2 text-sm text-soft-white transition-colors hover:border-gold/35"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </button>
      </div>

      {error && (
        <div className="surface-secondary rounded-xl border border-red-400/25 bg-red-500/5 p-3 mt-4 text-sm text-red-200 break-words">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4 mt-5">
        <div className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="section-title text-soft-white">{t('intelligencePacksTitle')}</h3>
            <span className="kpi-meta text-soft-muted">{packs.length}</span>
          </div>

          {loading ? (
            <p className="page-subtitle">{t('loading')}</p>
          ) : packs.length === 0 ? (
            <p className="page-subtitle">{t('intelligencePacksEmpty')}</p>
          ) : (
            <div className="space-y-3">
              {packs.map((pack) => {
                const lastSyncedLabel = pack.last_synced_at
                  ? new Date(pack.last_synced_at).toLocaleString(LOCALE_BY_LANGUAGE[language])
                  : '—'
                return (
                  <article key={pack.id} className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/30 bg-navy-deep/30 p-4 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-semibold text-soft-white break-words">{pack.pack_label}</h4>
                          {pack.is_default && (
                            <span className="inline-flex items-center rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                              {t('intelligencePacksActive')}
                            </span>
                          )}
                          {pack.synthetic && (
                            <span className="inline-flex items-center rounded-full border border-soft-subtle/20 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-soft-muted">
                              {t('intelligencePacksLegacy')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-soft-muted break-words mt-1">{pack.notebook_name}</p>
                      </div>
                      <button
                        type="button"
                        disabled={saving || activePackId === pack.id || pack.synthetic}
                        onClick={() => void activatePack(pack.id)}
                        className="rounded-xl border border-gold/30 px-3 py-2 text-sm text-gold transition-colors hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {activePackId === pack.id ? t('intelligencePacksActive') : t('intelligencePacksActivate')}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                      <div>
                        <p className="kpi-label">{t('intelligencePacksNotebook')}</p>
                        <p className="text-soft-white break-all mt-1">{pack.notebook_id}</p>
                      </div>
                      <div>
                        <p className="kpi-label">{t('intelligencePacksZones')}</p>
                        <p className="text-soft-white break-words mt-1">{(pack.zone_scope || []).join(', ') || '—'}</p>
                      </div>
                      <div>
                        <p className="kpi-label">{t('intelligencePacksMarketScope')}</p>
                        <p className="text-soft-white mt-1">
                          {t(`intelligencePackMarketScope_${pack.market_scope}` as TranslationKey)}
                        </p>
                      </div>
                      <div>
                        <p className="kpi-label">{t('intelligencePacksSourceMode')}</p>
                        <p className="text-soft-white mt-1">
                          {t(`intelligencePackSourceMode_${pack.source_mode}` as TranslationKey)}
                        </p>
                      </div>
                      <div>
                        <p className="kpi-label">{t('intelligencePacksLanguage')}</p>
                        <p className="text-soft-white mt-1">{String(pack.language_code || 'es').toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="kpi-label">{t('status')}</p>
                        <p className="text-soft-white mt-1">
                          {t(`intelligencePackStatus_${pack.status}` as TranslationKey)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
                      <div className="surface-secondary rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-3">
                        <p className="kpi-label">{t('intelligencePacksFreshness')}</p>
                        <p className="kpi-value text-soft-white mt-1">{pack.age_hours == null ? '—' : `${pack.age_hours}h`}</p>
                      </div>
                      <div className="surface-secondary rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-3">
                        <p className="kpi-label">{t('intelligencePacksLastSynced')}</p>
                        <p className="text-soft-white mt-1 break-words">{lastSyncedLabel}</p>
                      </div>
                      <div className="surface-secondary rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-3">
                        <p className="kpi-label">{t('details')}</p>
                        <p className="text-soft-white mt-1">{pack.insight_count || 0} insights · {(pack.zones_with_data || []).length} zonas</p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        <div className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-gold" />
            <h3 className="section-title text-soft-white">{t('intelligencePacksNewPack')}</h3>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="kpi-label">{t('intelligencePacksLabel')}</span>
              <input className={inputClassName()} value={form.pack_label} onChange={(e) => setForm((prev) => ({ ...prev, pack_label: e.target.value }))} placeholder={t('intelligencePacksLabelPlaceholder')} />
            </label>
            <label className="block">
              <span className="kpi-label">{t('intelligencePacksNotebookName')}</span>
              <input className={inputClassName()} value={form.notebook_name} onChange={(e) => setForm((prev) => ({ ...prev, notebook_name: e.target.value }))} placeholder="NotebookLM" />
            </label>
            <label className="block">
              <span className="kpi-label">{t('intelligencePacksNotebookId')}</span>
              <input className={inputClassName()} value={form.notebook_id} onChange={(e) => setForm((prev) => ({ ...prev, notebook_id: e.target.value }))} placeholder="uuid-notebook" />
            </label>
            <label className="block">
              <span className="kpi-label">{t('intelligencePacksZones')}</span>
              <input className={inputClassName()} value={form.zone_scope} onChange={(e) => setForm((prev) => ({ ...prev, zone_scope: e.target.value }))} placeholder={t('intelligencePacksZonesPlaceholder')} />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="block">
                <span className="kpi-label">{t('intelligencePacksMarketScope')}</span>
                <select className="ui-select" value={form.market_scope} onChange={(e) => setForm((prev) => ({ ...prev, market_scope: e.target.value }))}>
                  {['seller', 'buyer', 'mixed'].map((scope) => (
                    <option key={scope} value={scope}>
                      {t(`intelligencePackMarketScope_${scope}` as TranslationKey)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="kpi-label">{t('intelligencePacksSourceMode')}</span>
                <select className="ui-select" value={form.source_mode} onChange={(e) => setForm((prev) => ({ ...prev, source_mode: e.target.value }))}>
                  {['notebooklm_manual', 'live_sync_pack', 'imported_rag'].map((mode) => (
                    <option key={mode} value={mode}>
                      {t(`intelligencePackSourceMode_${mode}` as TranslationKey)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="kpi-label">{t('intelligencePacksLanguage')}</span>
                <select className="ui-select" value={form.language_code} onChange={(e) => setForm((prev) => ({ ...prev, language_code: e.target.value }))}>
                  {['es', 'en', 'de', 'ru'].map((code) => (
                    <option key={code} value={code}>{code.toUpperCase()}</option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              disabled={
                saving ||
                !form.pack_label.trim() ||
                !form.notebook_name.trim() ||
                !form.notebook_id.trim()
              }
              onClick={() => void createPack()}
              className="inline-flex items-center gap-2 rounded-xl border border-gold/35 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BookOpen className="w-4 h-4" />
              {saving ? t('intelligencePacksCreating') : t('intelligencePacksCreate')}
            </button>

            <div className="surface-secondary rounded-xl border border-soft-subtle/20 bg-navy-deep/20 p-3 text-sm text-soft-muted">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-gold" />
                <span>{t('intelligencePacksIsolation')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
