'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserSearch, TrendingUp, MapPin, Users, Target, Plus, Filter, RefreshCw } from 'lucide-react'
import { SellersTable, NexusSeller, EstadoContacto } from '@/components/sellers/SellersTable'

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
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                <UserSearch className="w-5 h-5 text-gold" />
              </div>
              <h1 className="font-display text-2xl text-soft-white">Nexus Sellers</h1>
            </div>
            <p className="text-sm text-soft-muted pl-1">
              Motor de adquisición de vendedores — señales tempranas antes que la competencia
            </p>
          </div>
          <button
            type="button"
            onClick={fetchSellers}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-soft-subtle/40 text-soft-muted hover:text-gold hover:border-gold/40 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Sellers"
            value={totalSellers}
            accent="default"
          />
          <StatCard
            icon={Target}
            label="Whales (P5)"
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

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-soft-muted shrink-0" />

          <select
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            className="text-sm bg-navy-surface/40 border border-soft-subtle/30 rounded-lg px-3 py-2 text-soft-white focus:outline-none focus:border-gold/50"
          >
            {ZONA_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-navy">
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="text-sm bg-navy-surface/40 border border-soft-subtle/30 rounded-lg px-3 py-2 text-soft-white focus:outline-none focus:border-gold/50"
          >
            {ESTADO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-navy">
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={prioridadMin}
            onChange={(e) => setPrioridadMin(e.target.value ? Number(e.target.value) : '')}
            className="text-sm bg-navy-surface/40 border border-soft-subtle/30 rounded-lg px-3 py-2 text-soft-white focus:outline-none focus:border-gold/50"
          >
            <option value="" className="bg-navy">Toda prioridad</option>
            <option value="5" className="bg-navy">★ Whale (P5)</option>
            <option value="4" className="bg-navy">Alta (P4+)</option>
            <option value="3" className="bg-navy">Media (P3+)</option>
          </select>

          {(zona || estado || prioridadMin) && (
            <button
              type="button"
              onClick={() => { setZona(''); setEstado(''); setPrioridadMin('') }}
              className="text-xs text-soft-muted hover:text-gold transition-colors px-2 py-1 rounded border border-soft-subtle/20"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="rounded-xl border border-red-800/50 bg-red-900/20 px-4 py-3 text-red-400 text-sm">
            Error al cargar sellers: {error}
          </div>
        )}

        {/* ── Table ── */}
        <SellersTable
          sellers={sellers}
          onEstadoChange={handleEstadoChange}
          loading={loading}
        />

        {/* ── Oportunidades (vulnerabilidades.md summary) ── */}
        <div className="rounded-xl border border-gold/20 bg-gold/5 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gold" />
            <h2 className="font-display text-lg text-gold">Oportunidades Territoriales Activas</h2>
          </div>
          <p className="text-sm text-soft-muted">
            Insights del NotebookLM &quot;Anclora Nexus Territorial Brain&quot; — actualizado 2026-03-08
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
    </div>
  )
}
