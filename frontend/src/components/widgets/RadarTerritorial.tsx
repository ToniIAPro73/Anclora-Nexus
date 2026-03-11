'use client'

import { useEffect, useState } from 'react'
import { Map, TrendingUp, AlertCircle, Clock, Leaf, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { authFetch } from '@/lib/auth-fetch'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

const ZONE_LABELS: Record<string, string> = {
  punta_negra: 'Punta Negra',
  calvia: 'Calvià',
  son_ferrer: 'Son Ferrer',
  paguera: 'Paguera',
  santa_ponca: 'Santa Ponça',
  portals_nous: 'Portals Nous',
  andratx: 'Andratx',
  bendinat: 'Bendinat',
  costa_den_blanes: "Costa d'en Blanes",
  port_adriano: 'Port Adriano',
  general: 'General',
}

// Priority zones to always show (even without data)
const PRIORITY_ZONES = ['punta_negra', 'calvia', 'son_ferrer', 'paguera', 'andratx']

type Urgencia = 'NOW' | 'CRITICA' | 'Q2 2026' | 'Q2-Q3 2026' | 'ongoing' | string

function getUrgenciaConfig(urgencia: Urgencia) {
  const u = String(urgencia).toUpperCase()
  if (u === 'NOW' || u === 'CRITICA') {
    return {
      icon: AlertCircle,
      label: 'Crítica',
      dot: 'bg-red-500',
      badge: 'bg-red-900/30 text-red-400 border-red-800/50',
      border: 'border-red-800/30',
      glow: 'shadow-red-900/20',
    }
  }
  if (u.startsWith('Q2') || u.startsWith('Q3')) {
    return {
      icon: Clock,
      label: 'Q2 2026',
      dot: 'bg-amber-400',
      badge: 'bg-amber-900/30 text-amber-300 border-amber-700/50',
      border: 'border-amber-800/20',
      glow: 'shadow-amber-900/10',
    }
  }
  return {
    icon: Leaf,
    label: 'Activa',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50',
    border: 'border-emerald-800/20',
    glow: 'shadow-emerald-900/10',
  }
}

function truncate(text: string, max: number) {
  const clean = text.replace(/^#+ .+\n?/gm, '').replace(/\[.*?\]/g, '').trim()
  return clean.length > max ? clean.slice(0, max) + '…' : clean
}

// ─────────────────────────────────────────────────────────────
// Zone Card
// ─────────────────────────────────────────────────────────────

function ZoneCard({ zona, insight }: { zona: string; insight: ZoneInsight | null }) {
  const urgencia = (insight?.metadata?.urgencia as string) || 'ongoing'
  const cfg = getUrgenciaConfig(urgencia)
  const Icon = cfg.icon
  const hasData = !!insight

  return (
    <div
      className={`
        flex flex-col gap-2 rounded-xl border p-4 transition-all
        bg-navy-surface/30 backdrop-blur-sm
        ${hasData ? `${cfg.border} shadow-lg ${cfg.glow}` : 'border-soft-subtle/15 opacity-50'}
      `}
    >
      {/* Zone header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${hasData ? cfg.dot : 'bg-gray-600'} ${urgencia === 'NOW' || urgencia === 'CRITICA' ? 'animate-pulse' : ''}`} />
          <span className="text-xs font-semibold text-soft-white truncate">
            {ZONE_LABELS[zona] || zona}
          </span>
        </div>
        {hasData && (
          <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.badge}`}>
            <Icon className="w-2.5 h-2.5" />
            {cfg.label}
          </span>
        )}
      </div>

      {/* Insight snippet */}
      {hasData ? (
        <p className="text-[11px] text-soft-muted leading-relaxed line-clamp-3">
          {truncate(insight!.response, 120)}
        </p>
      ) : (
        <p className="text-[11px] text-soft-muted/40 italic">Sin datos. Ejecuta un query territorial.</p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Widget
// ─────────────────────────────────────────────────────────────

export function RadarTerritorial() {
  const [data, setData] = useState<TerritorialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await authFetch('/api/intelligence/territorial-summary')
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Zones to display: priority zones + any extra zones with data
  const summary = data?.summary ?? {}
  const extraZones = Object.keys(summary).filter(
    (z) => z !== 'general' && !PRIORITY_ZONES.includes(z)
  )
  const zones = [...PRIORITY_ZONES, ...extraZones]

  const criticalCount = zones.filter((z) => {
    const u = String(summary[z]?.metadata?.urgencia ?? '').toUpperCase()
    return u === 'NOW' || u === 'CRITICA'
  }).length

  return (
    <div className="widget-card h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center">
            <Map className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h3 className="widget-title">Radar Territorial</h3>
            <p className="text-[10px] text-soft-muted">Suroeste Mallorca · Inteligencia Territorial 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!loading && criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-900/30 text-red-400 border border-red-800/50">
              <AlertCircle className="w-2.5 h-2.5" />
              {criticalCount} zona{criticalCount > 1 ? 's' : ''} crítica{criticalCount > 1 ? 's' : ''}
            </span>
          )}
          <button
            type="button"
            onClick={fetchData}
            className="p-1.5 rounded-lg text-soft-muted hover:text-gold transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Zone grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-soft-muted text-xs">
            <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            Cargando inteligencia territorial…
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-1">
            <TrendingUp className="w-8 h-8 text-soft-muted/30 mx-auto" />
            <p className="text-xs text-soft-muted">Backend no disponible</p>
            <button onClick={fetchData} className="text-xs text-gold hover:underline">Reintentar</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 flex-1">
          {zones.map((zona) => (
            <ZoneCard key={zona} zona={zona} insight={summary[zona] ?? null} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-soft-subtle/20">
        <p className="text-[10px] text-soft-muted">
          {data ? `${data.zones_with_data.filter(z => z !== 'general').length} zonas con datos · ${new Date(data.timestamp).toLocaleDateString('es-ES')}` : '—'}
        </p>
        <Link
          href="/intelligence"
          className="inline-flex items-center gap-1 text-[10px] text-gold hover:text-gold/80 transition-colors"
        >
          Análisis completo <ExternalLink className="w-2.5 h-2.5" />
        </Link>
      </div>
    </div>
  )
}
