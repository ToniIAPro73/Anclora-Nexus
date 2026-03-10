'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, UserSearch, TrendingUp, MapPin, Users, Target, Filter, RefreshCw } from 'lucide-react'
import { SellersTable, NexusSeller, EstadoContacto } from '@/components/sellers/SellersTable'
import { SellerDrawer } from '@/components/sellers/SellerDrawer'
import { useI18n } from '@/lib/i18n'
import { buildBackendUrl } from '@/lib/backend-url'

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

const ZONA_OPTIONS = [
  { value: '', label: 'Todas las zonas' },
  { value: 'andratx', label: 'Andratx' },
  { value: 'calvia', label: 'Calvià' },
  { value: 'son_ferrer', label: 'Son Ferrer' },
  { value: 'santa_ponca', label: 'Santa Ponça' },
  { value: 'paguera', label: 'Paguera' },
  { value: 'portals_nous', label: 'Portals Nous' },
  { value: 'bendinat', label: 'Bendinat' },
  { value: 'punta_negra', label: 'Punta Negra' },
  { value: 'costa_den_blanes', label: "Costa d'en Blanes" },
]

const ESTADO_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'sin_contacto', label: 'Sin contacto' },
  { value: 'primer_contacto', label: 'Primer contacto' },
  { value: 'en_seguimiento', label: 'En seguimiento' },
  { value: 'reunion_agendada', label: 'Reunión agendada' },
  { value: 'propuesta_enviada', label: 'Propuesta enviada' },
  { value: 'mandato_exclusivo', label: 'Mandato exclusivo' },
  { value: 'descartado', label: 'Descartado' },
]

interface ZoneInsight {
  zona: string
  response: string
  metadata: Record<string, unknown>
  created_at: string
}

interface TerritorialSummary {
  summary: Record<string, ZoneInsight>
  zones_with_data: string[]
  timestamp: string
}

type OpportunityCard = {
  urgencia: string
  label: string
  zona: string
  nota: string
}

const TERRITORIAL_ZONE_LABELS: Record<string, string> = {
  andratx: 'Andratx',
  calvia: 'Calvià',
  son_ferrer: 'Son Ferrer',
  santa_ponca: 'Santa Ponça',
  paguera: 'Paguera',
  portals_nous: 'Portals Nous',
  bendinat: 'Bendinat',
  punta_negra: 'Punta Negra',
  costa_den_blanes: "Costa d'en Blanes",
  port_adriano: 'Port Adriano',
  palma: 'Palma',
  general: 'General',
}

function urgencyEmoji(value: string) {
  const normalized = value.toUpperCase()
  if (normalized === 'NOW' || normalized === 'CRITICA') return '🔴'
  if (normalized.includes('Q2') || normalized.includes('Q3')) return '🟡'
  return '🟢'
}

function normalizeOpportunity(summary: TerritorialSummary | null): OpportunityCard[] {
  return Object.entries(summary?.summary || {})
    .filter(([zona]) => zona !== 'general')
    .map(([zona, insight]) => ({
      urgencia: String(insight.metadata?.urgencia || 'ongoing'),
      label: String(
        insight.metadata?.señal
        || insight.metadata?.signal
        || insight.metadata?.accion
        || TERRITORIAL_ZONE_LABELS[zona]
        || zona
      ),
      zona: TERRITORIAL_ZONE_LABELS[zona] || zona,
      nota: insight.response.replace(/\s+/g, ' ').trim().slice(0, 160),
    }))
    .sort((a, b) => {
      const rank = (value: string) => {
        const normalized = value.toUpperCase()
        if (normalized === 'NOW' || normalized === 'CRITICA') return 0
        if (normalized.includes('Q2') || normalized.includes('Q3')) return 1
        return 2
      }
      return rank(a.urgencia) - rank(b.urgencia)
    })
    .slice(0, 5)
}

// ─────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof UserSearch
  label: string
  value: string | number
  accent?: 'gold' | 'green' | 'blue' | 'default'
}) {
  const colorMap = {
    gold: 'text-gold',
    green: 'text-emerald-400',
    blue: 'text-blue-light',
    default: 'text-soft-white',
  }
  const bgMap = {
    gold: 'bg-gold/10 border-gold/20',
    green: 'bg-emerald-900/20 border-emerald-700/30',
    blue: 'bg-blue-light/10 border-blue-light/20',
    default: 'bg-navy-surface/30 border-soft-subtle/20',
  }
  const accentKey = accent ?? 'default'

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-2 ${bgMap[accentKey]}`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${colorMap[accentKey]}`} />
        <span className="text-xs text-soft-muted uppercase tracking-wide">{label}</span>
      </div>
      <span className={`text-2xl font-display font-bold ${colorMap[accentKey]}`}>{value}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function SellersPage() {
  const { t } = useI18n()
  const [sellers, setSellers] = useState<NexusSeller[]>([])
  const [stats, setStats] = useState<Record<string, unknown>>({})
  const [territorialSummary, setTerritorialSummary] = useState<TerritorialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSeller, setSelectedSeller] = useState<NexusSeller | null>(null)

  // Filters
  const [zona, setZona] = useState('')
  const [estado, setEstado] = useState('')
  const [prioridadMin, setPrioridadMin] = useState<number | ''>('')

  const fetchSellers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (zona) params.set('zona', zona)
      if (estado) params.set('estado', estado)
      if (prioridadMin) params.set('prioridad_min', String(prioridadMin))
      params.set('limit', '100')

      const [sellersRes, statsRes, territorialRes] = await Promise.all([
        fetch(buildBackendUrl(`/api/sellers/?${params}`)),
        fetch(buildBackendUrl('/api/sellers/stats')),
        fetch(buildBackendUrl('/api/intelligence/territorial-summary')),
      ])

      if (!sellersRes.ok) throw new Error(`${t('error')} ${sellersRes.status}`)
      const sellersData = await sellersRes.json()
      const statsData = statsRes.ok ? await statsRes.json() : {}
      const territorialData = territorialRes.ok ? await territorialRes.json() : null

      setSellers(sellersData)
      setStats(statsData)
      setTerritorialSummary(territorialData)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'))
      setSellers([])
      setTerritorialSummary(null)
    } finally {
      setLoading(false)
    }
  }, [zona, estado, prioridadMin, t])

  useEffect(() => {
    fetchSellers()
  }, [fetchSellers])

  const handleEstadoChange = async (sellerId: string, newEstado: EstadoContacto) => {
    try {
      const res = await fetch(buildBackendUrl(`/api/sellers/${sellerId}/estado`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado_contacto: newEstado }),
      })
      if (!res.ok) throw new Error(`${t('error')} ${res.status}`)
      await fetchSellers()
    } catch (err) {
      console.error('Error updating seller estado:', err)
    }
  }

  const totalSellers = (stats.total as number) || 0
  const whales = (stats.whales as number) || 0
  const mandatos = ((stats.por_estado as Record<string, number>)?.mandato_exclusivo) || 0
  const tasaMandatos = (stats.tasa_mandatos as number) || 0
  const opportunities = normalizeOpportunity(territorialSummary)

  return (
    <div className="min-h-screen bg-navy text-soft-white">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        <section className="rounded-2xl border border-soft-subtle bg-gradient-to-br from-navy-deep/80 via-navy-surface/50 to-navy-deep/70 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Link
                href="/dashboard"
                className="mt-0.5 rounded-lg border border-soft-subtle/70 bg-navy-surface/40 p-2 text-soft-white hover:border-gold/50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="page-title">{t('sellersTitle')}</h1>
                <p className="mt-1 text-sm text-soft-muted">
                  {t('sellersSubtitle')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={fetchSellers}
                className="btn-action"
              >
                <RefreshCw className="h-4 w-4" />
                {t('refresh')}
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label={t('sellersDetected')}
            value={totalSellers}
            accent="default"
          />
          <StatCard
            icon={Target}
            label={t('sellerPriorityP5')}
            value={whales}
            accent="gold"
          />
          <StatCard
            icon={TrendingUp}
            label={t('mandates')}
            value={mandatos}
            accent="green"
          />
          <StatCard
            icon={MapPin}
            label={t('conversion')}
            value={`${tasaMandatos}%`}
            accent="blue"
          />
        </div>

        <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-lg border border-soft-subtle bg-navy-surface/40 px-3 py-2">
              <Filter className="h-4 w-4 text-soft-muted" />
              <select
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                className="bg-transparent text-sm text-soft-white outline-none"
              >
                {ZONA_OPTIONS.map((o) => (
                  <option
                    key={o.value}
                    value={o.value}
                    className="bg-navy text-soft-white"
                    style={{ backgroundColor: '#18255c', color: '#f6f3eb' }}
                  >
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg border border-soft-subtle bg-navy-surface/40 px-3 py-2">
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="bg-transparent text-sm text-soft-white outline-none"
              >
                {ESTADO_OPTIONS.map((o) => (
                  <option
                    key={o.value}
                    value={o.value}
                    className="bg-navy text-soft-white"
                    style={{ backgroundColor: '#18255c', color: '#f6f3eb' }}
                  >
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg border border-soft-subtle bg-navy-surface/40 px-3 py-2">
              <select
                value={prioridadMin}
                onChange={(e) => setPrioridadMin(e.target.value ? Number(e.target.value) : '')}
                className="bg-transparent text-sm text-soft-white outline-none"
              >
                <option value="" className="bg-navy text-soft-white" style={{ backgroundColor: '#18255c', color: '#f6f3eb' }}>{t('allPriority')}</option>
                <option value="5" className="bg-navy text-soft-white" style={{ backgroundColor: '#18255c', color: '#f6f3eb' }}>{t('sellerPriorityP5')}</option>
                <option value="4" className="bg-navy text-soft-white" style={{ backgroundColor: '#18255c', color: '#f6f3eb' }}>{t('priorityHigh')}</option>
                <option value="3" className="bg-navy text-soft-white" style={{ backgroundColor: '#18255c', color: '#f6f3eb' }}>{t('priorityMedium')}</option>
              </select>
            </div>

            {(zona || estado || prioridadMin) && (
              <button
                type="button"
                onClick={() => { setZona(''); setEstado(''); setPrioridadMin('') }}
                className="rounded-full border border-soft-subtle bg-navy-surface/40 px-3 py-2 text-xs text-soft-muted hover:text-soft-white transition-colors"
              >
                {t('clearFilters')}
              </button>
            )}
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
            {t('errorLoadingSellers')}: {error}
          </div>
        )}

        <SellersTable
          sellers={sellers}
          onEstadoChange={handleEstadoChange}
          onOpenDetail={(seller) => setSelectedSeller(seller)}
          loading={loading}
        />

        <div className="rounded-2xl border border-gold/20 bg-gold/5 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-semibold text-soft-white">{t('activeTerritorialOpportunities')}</h2>
          </div>
          <p className="text-sm text-soft-muted">
            {t('territorialInsightsSource')}
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            {opportunities.map((o) => (
              <div
                key={`${o.zona}-${o.label}`}
                className="flex gap-3 rounded-lg border border-soft-subtle/20 bg-navy-surface/30 p-3"
              >
                <span className="text-lg leading-none mt-0.5">{urgencyEmoji(o.urgencia)}</span>
                <div className="space-y-0.5">
                  <p className="font-medium text-soft-white text-xs">{o.label}</p>
                  <p className="text-xs text-gold/70">{o.zona}</p>
                  <p className="text-xs text-soft-muted">{o.nota}</p>
                </div>
              </div>
            ))}
            {!opportunities.length && (
              <div className="rounded-lg border border-soft-subtle/20 bg-navy-surface/30 p-3 text-xs text-soft-muted">
                {t('territorialSyncUnavailable')}
              </div>
            )}
          </div>
        </div>

      </div>
      <SellerDrawer
        sellerId={selectedSeller?.id ?? null}
        sellerName={selectedSeller?.nombre_propietario}
        open={Boolean(selectedSeller)}
        onClose={() => setSelectedSeller(null)}
      />
    </div>
  )
}
