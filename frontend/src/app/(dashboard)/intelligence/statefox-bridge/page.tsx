'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeft, Bot, ExternalLink, Link2, MapPinned, Upload } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import supabase from '@/lib/supabase'
import { buildBackendUrl } from '@/lib/backend-url'

type ParsedListing = {
  title: string
  price: number
  property_type?: string
  bedrooms?: number
  bathrooms?: number
  area_m2?: number
  app_url?: string | null
  public_url?: string | null
}

export default function StatefoxBridgePage() {
  const { t } = useI18n()
  const [rawText, setRawText] = useState('')
  const [zone, setZone] = useState('')
  const [city, setCity] = useState('Mallorca')
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsed, setParsed] = useState<{ listings: ParsedListing[]; count: number; has_reproducible_app_links?: boolean } | null>(null)
  const [importResult, setImportResult] = useState<{ imported_count: number; skipped_count: number } | null>(null)

  const canRun = rawText.trim().length > 0

  const parsePayload = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(buildBackendUrl('/api/intelligence/statefox-bridge/parse'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText, zone: zone || undefined, city: city || undefined }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.detail || 'Parse error')
      setParsed(body.parsed)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parse error')
    } finally {
      setLoading(false)
    }
  }

  const importPayload = async () => {
    setImporting(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(buildBackendUrl('/api/intelligence/statefox-bridge/import'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ raw_text: rawText, zone: zone || undefined, city: city || undefined }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.detail || 'Import error')
      setImportResult(body.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import error')
    } finally {
      setImporting(false)
    }
  }

  const reproducibleCount = useMemo(() => parsed?.listings.filter((x) => x.app_url).length || 0, [parsed])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/intelligence/statefox-discovery" className="p-2 rounded-lg bg-navy-surface/40 border border-soft-subtle hover:border-gold/50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-soft-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-soft-white">{t('statefoxBridgeTitle')}</h1>
            <p className="text-sm text-soft-muted mt-1">{t('statefoxBridgeSubtitle')}</p>
          </div>
        </div>

        <section className="rounded-2xl border border-soft-subtle/20 bg-navy-surface/40 p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <input value={zone} onChange={(e) => setZone(e.target.value)} placeholder={t('zone')} className="rounded-xl border border-soft-subtle/20 bg-navy-darker/30 px-4 py-3 text-soft-white outline-none" />
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('statefoxBridgeCity')} className="rounded-xl border border-soft-subtle/20 bg-navy-darker/30 px-4 py-3 text-soft-white outline-none" />
            <div className="flex gap-3">
              <button type="button" disabled={!canRun || loading} onClick={() => void parsePayload()} className="btn-action flex-1">
                <Bot className="w-4 h-4" />
                {loading ? t('statefoxBridgeParsing') : t('statefoxBridgeParse')}
              </button>
              <button type="button" disabled={!canRun || importing} onClick={() => void importPayload()} className="btn-create flex-1">
                <Upload className="w-4 h-4" />
                {importing ? t('statefoxBridgeImporting') : t('statefoxBridgeImport')}
              </button>
            </div>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={12}
            placeholder={t('statefoxBridgeTextareaPlaceholder')}
            className="w-full rounded-2xl border border-soft-subtle/20 bg-navy-darker/20 px-4 py-4 text-sm text-soft-white outline-none"
          />

          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

          <div className="flex flex-wrap gap-3 text-sm text-soft-muted">
            <span className="rounded-full border border-soft-subtle/20 px-3 py-1">{t('statefoxBridgeObservedLinks')}: {reproducibleCount}</span>
            {importResult && <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">{t('statefoxBridgeImported')}: {importResult.imported_count}</span>}
            {importResult && <span className="rounded-full border border-soft-subtle/20 px-3 py-1">{t('statefoxBridgeSkipped')}: {importResult.skipped_count}</span>}
          </div>
        </section>

        <section className="rounded-2xl border border-soft-subtle/20 bg-navy-surface/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPinned className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-semibold text-soft-white">{t('statefoxBridgePreview')}</h2>
          </div>

          <div className="space-y-3">
            {(parsed?.listings || []).map((listing, index) => (
              <div key={`${listing.title}-${index}`} className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-soft-white font-semibold">{listing.title}</h3>
                    <p className="text-sm text-soft-muted mt-1">
                      €{listing.price.toLocaleString('es-ES')} · {listing.bedrooms || 0} hab · {listing.bathrooms || 0} baños · {listing.area_m2 || 0} m²
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {listing.public_url && (
                      <a href={listing.public_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-soft-subtle/20 px-3 py-2 text-sm text-soft-white hover:border-gold/40">
                        <ExternalLink className="w-4 h-4" />
                        Public
                      </a>
                    )}
                    {listing.app_url && (
                      <a href={listing.app_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-soft-subtle/20 px-3 py-2 text-sm text-soft-white hover:border-gold/40">
                        <Link2 className="w-4 h-4" />
                        App
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!parsed?.listings?.length && (
              <div className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-6 text-sm text-soft-muted">
                {t('statefoxBridgeNoPreview')}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
