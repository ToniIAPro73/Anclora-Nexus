'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, UserSearch, TrendingUp, MapPin, Users, Target, Filter, RefreshCw } from 'lucide-react'
import { SellersTable, NexusSeller, EstadoContacto } from '@/components/sellers/SellersTable'
import { SellerDrawer } from '@/components/sellers/SellerDrawer'

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
  const [sellers, setSellers] = useState<NexusSeller[]>([])
  const [stats, setStats] = useState<Record<string, unknown>>({})
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

      const [sellersRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/sellers/?${params}`),
        fetch(`${API_BASE}/api/sellers/stats`),
      ])

      if (!sellersRes.ok) throw new Error(`Error ${sellersRes.status}`)
      const sellersData = await sellersRes.json()
      const statsData = statsRes.ok ? await statsRes.json() : {}

      setSellers(sellersData)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setSellers([])
    } finally {
      setLoading(false)
    }
  }, [zona, estado, prioridadMin])

  useEffect(() => {
    fetchSellers()
  }, [fetchSellers])

  const handleEstadoChange = async (sellerId: string, newEstado: EstadoContacto) => {
    try {
      const res = await fetch(`${API_BASE}/api/sellers/${sellerId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado_contacto: newEstado }),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      await fetchSellers()
    } catch (err) {
      console.error('Error updating seller estado:', err)
    }
  }

  const totalSellers = (stats.total as number) || 0
  const whales = (stats.whales as number) || 0
  const mandatos = ((stats.por_estado as Record<string, number>)?.mandato_exclusivo) || 0
  const tasaMandatos = (stats.tasa_mandatos as number) || 0

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
                <h1 className="text-3xl font-bold text-soft-white">Nexus Sellers</h1>
                <p className="mt-1 text-sm text-soft-muted">
                  Cola priorizada para captación temprana de vendedores antes de que entren en competencia abierta.
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
                Actualizar
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Vendedores detectados"
            value={totalSellers}
            accent="default"
          />
          <StatCard
            icon={Target}
            label="Prioridad P5"
            value={whales}
            accent="gold"
          />
          <StatCard
            icon={TrendingUp}
            label="Mandatos"
            value={mandatos}
            accent="green"
          />
          <StatCard
            icon={MapPin}
            label="Conversión"
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
                  <option key={o.value} value={o.value} className="bg-navy">
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
                  <option key={o.value} value={o.value} className="bg-navy">
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
                <option value="" className="bg-navy">Toda prioridad</option>
                <option value="5" className="bg-navy">Prioridad P5</option>
                <option value="4" className="bg-navy">Alta (P4+)</option>
                <option value="3" className="bg-navy">Media (P3+)</option>
              </select>
            </div>

            {(zona || estado || prioridadMin) && (
              <button
                type="button"
                onClick={() => { setZona(''); setEstado(''); setPrioridadMin('') }}
                className="rounded-full border border-soft-subtle bg-navy-surface/40 px-3 py-2 text-xs text-soft-muted hover:text-soft-white transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
            Error al cargar sellers: {error}
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
            <h2 className="text-lg font-semibold text-soft-white">Oportunidades territoriales activas</h2>
          </div>
          <p className="text-sm text-soft-muted">
            Insights del NotebookLM &quot;Inteligencia Territorial Suroeste Mallorca 2026&quot; — actualizado 2026-03-08
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            {[
              { urgencia: '🔴', label: 'Mandarin Oriental Halo Effect', zona: 'Punta Negra / Costa d\'en Blanes', nota: '+15-25% valorización en 18-24 meses' },
              { urgencia: '🔴', label: 'Enforcement STR → Vendedores Forzados', zona: 'Calvià / Andratx', nota: '+19% inspecciones, 4.400 anuncios retirados' },
              { urgencia: '🟡', label: 'Divergencias Microzonales + DOM >180d', zona: 'Son Ferrer / Costa d\'en Blanes', nota: 'Calvià +22% vs -3% zona vecina' },
              { urgencia: '🟡', label: 'Hub Superyates + Demanda UHNWI', zona: 'Puerto Portals / Puerto Andratx', nota: '20 nuevos amarres 30-60m LOA' },
              { urgencia: '🟢', label: 'FSBO + Cambio Generacional', zona: 'Paguera / Santa Ponça / Andratx', nota: 'Propietarios 50-75 sin acceso a compradores int.' },
            ].map((o) => (
              <div
                key={o.label}
                className="flex gap-3 rounded-lg border border-soft-subtle/20 bg-navy-surface/30 p-3"
              >
                <span className="text-lg leading-none mt-0.5">{o.urgencia}</span>
                <div className="space-y-0.5">
                  <p className="font-medium text-soft-white text-xs">{o.label}</p>
                  <p className="text-xs text-gold/70">{o.zona}</p>
                  <p className="text-xs text-soft-muted">{o.nota}</p>
                </div>
              </div>
            ))}
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
