'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Filter, Home, RefreshCw, Shield, Target, Users, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import {
  getProspectionWorkspace,
  type BuyerProfile,
  type PropertyBuyerMatch,
  type ProspectedProperty,
  type ProspectionWorkspaceResponse,
} from '@/lib/prospection-api'

type SourceFilter = '' | 'manual' | 'widget' | 'pbm'

const SOURCE_LABELS: Record<Exclude<SourceFilter, ''>, string> = {
  manual: 'Manual',
  widget: 'Widget',
  pbm: 'PBM',
}

function formatSourceTag(source?: string | null): string {
  if (!source) return 'Origen no definido'
  const normalized = source.toLowerCase().trim()
  if (normalized === 'pbm') return 'PBM'
  if (normalized === 'widget') return 'Widget'
  if (normalized === 'manual') return 'Manual'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function getRoleLabel(role?: string): string {
  const normalized = (role || '').toLowerCase()
  if (normalized === 'owner') return 'Owner'
  if (normalized === 'manager') return 'Manager'
  if (normalized === 'agent') return 'Agente'
  return 'Usuario'
}

export default function ProspectionUnifiedPage() {
  const { t } = useI18n()
  const { formatMoney, formatCompact } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('')
  const [workspace, setWorkspace] = useState<ProspectionWorkspaceResponse | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)

  const loadWorkspace = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getProspectionWorkspace({
        source_system: sourceFilter || undefined,
        limit: 25,
        offset: 0,
      })
      setWorkspace(res)
      setLastUpdatedAt(new Date())
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al cargar el workspace'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [sourceFilter])

  useEffect(() => {
    void loadWorkspace()
  }, [loadWorkspace])

  const roleLabel = useMemo(() => getRoleLabel(workspace?.scope.role), [workspace?.scope.role])
  const totalRecords = (workspace?.totals.properties || 0) + (workspace?.totals.buyers || 0) + (workspace?.totals.matches || 0)
  const updatedLabel = lastUpdatedAt
    ? lastUpdatedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  const renderPropertyRow = (item: ProspectedProperty) => (
    <div key={item.id} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3 hover:border-gold/40 transition-colors">
      <p className="text-sm font-semibold text-soft-white line-clamp-1">
        {item.title || item.zone || item.city || 'Propiedad sin titulo'}
      </p>
      <p className="mt-1 text-xs text-soft-muted line-clamp-1">
        {(item.zone || item.city || 'Zona no definida')} · {item.property_type || 'Tipo no definido'}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-gold">
          {item.price != null
            ? formatCompact(item.price)
            : '-'}
        </span>
        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
          {formatSourceTag(item.source)}
        </span>
      </div>
    </div>
  )

  const renderBuyerRow = (item: BuyerProfile) => (
    <div key={item.id} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3 hover:border-gold/40 transition-colors">
      <p className="text-sm font-semibold text-soft-white line-clamp-1">
        {item.full_name || item.email || 'Buyer sin nombre'}
      </p>
      <p className="mt-1 text-xs text-soft-muted line-clamp-1">
        {item.email || item.phone || 'Sin contacto'}
      </p>
      <p className="mt-2 text-xs text-gold">
        {item.budget_min != null && item.budget_max != null
          ? `${formatMoney(item.budget_min, { minFractionDigits: 0, maxFractionDigits: 0 })} - ${formatMoney(item.budget_max, { minFractionDigits: 0, maxFractionDigits: 0 })}`
          : 'Presupuesto pendiente'}
      </p>
    </div>
  )

  const renderMatchRow = (item: PropertyBuyerMatch) => (
    <div key={item.id} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3 hover:border-gold/40 transition-colors">
      <p className="text-sm font-semibold text-soft-white line-clamp-1">
        {item.property_title || 'Propiedad sin titulo'}
      </p>
      <p className="mt-1 text-xs text-soft-muted line-clamp-1">
        {item.buyer_name || 'Buyer sin nombre'}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-soft-muted">{item.match_status}</span>
        <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold">
          Score {Math.round(item.match_score || 0)}
        </span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-5"
      >
        <section className="rounded-2xl border border-soft-subtle bg-gradient-to-br from-navy-deep/80 via-navy-surface/50 to-navy-deep/70 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Link
                href="/prospection"
                className="mt-0.5 rounded-lg border border-soft-subtle/70 bg-navy-surface/40 p-2 text-soft-white hover:border-gold/50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-soft-white">Prospeccion unificada</h1>
                <p className="mt-1 text-sm text-soft-muted">
                  Vista ejecutiva de propiedades, compradores y matching en tiempo real.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-lg border border-soft-subtle bg-navy-surface/40 px-3 py-2">
                <Filter className="h-4 w-4 text-soft-muted" />
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
                  className="bg-transparent text-sm text-soft-white outline-none"
                >
                  <option value="">{t('allOrigins') || 'Todos los origenes'}</option>
                  <option value="manual">{SOURCE_LABELS.manual}</option>
                  <option value="widget">{SOURCE_LABELS.widget}</option>
                  <option value="pbm">{SOURCE_LABELS.pbm}</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => void loadWorkspace()}
                className="inline-flex items-center gap-2 rounded-lg border border-soft-subtle bg-navy-surface/40 px-3 py-2 text-sm text-soft-white hover:border-gold/50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
              {roleLabel}
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              {totalRecords} registros visibles
            </span>
            <span className="rounded-full border border-soft-subtle bg-navy-surface/40 px-3 py-1 text-xs text-soft-muted">
              Ultima actualizacion {updatedLabel}
            </span>
          </div>
        </section>

        {error ? (
          <section className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
            <p className="text-sm text-red-300">{error}</p>
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">Propiedades</p>
              <Home className="h-4 w-4 text-gold" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gold">{workspace?.totals.properties ?? 0}</p>
            <p className="mt-1 text-xs text-soft-muted">Prospectadas y priorizadas</p>
          </article>

          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">Buyers</p>
              <Users className="h-4 w-4 text-gold" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gold">{workspace?.totals.buyers ?? 0}</p>
            <p className="mt-1 text-xs text-soft-muted">Perfiles activos de demanda</p>
          </article>

          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">Matches</p>
              <Zap className="h-4 w-4 text-gold" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gold">{workspace?.totals.matches ?? 0}</p>
            <p className="mt-1 text-xs text-soft-muted">Oportunidades de cierre detectadas</p>
          </article>
        </section>

        {loading ? (
          <section className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            {[1, 2, 3].map((id) => (
              <div key={id} className="rounded-2xl border border-soft-subtle bg-navy-surface/30 p-4 animate-pulse">
                <div className="h-4 w-40 rounded bg-white/10" />
                <div className="mt-4 h-20 rounded bg-white/5" />
                <div className="mt-2 h-20 rounded bg-white/5" />
              </div>
            ))}
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
              <header className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-soft-white">
                  <Target className="h-4 w-4 text-gold" />
                  Propiedades prospectadas
                </h2>
                <span className="text-xs text-soft-muted">{workspace?.properties.total ?? 0}</span>
              </header>
              <div className="max-h-[520px] space-y-2 overflow-auto pr-1">
                {(workspace?.properties.items || []).length > 0
                  ? (workspace?.properties.items || []).map(renderPropertyRow)
                  : <p className="text-sm text-soft-muted">Sin propiedades para este filtro.</p>}
              </div>
            </article>

            <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
              <header className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-soft-white">
                  <Users className="h-4 w-4 text-gold" />
                  Buyers
                </h2>
                <span className="text-xs text-soft-muted">{workspace?.buyers.total ?? 0}</span>
              </header>
              <div className="max-h-[520px] space-y-2 overflow-auto pr-1">
                {(workspace?.buyers.items || []).length > 0
                  ? (workspace?.buyers.items || []).map(renderBuyerRow)
                  : <p className="text-sm text-soft-muted">Sin buyers para este filtro.</p>}
              </div>
            </article>

            <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
              <header className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-soft-white">
                  <Shield className="h-4 w-4 text-gold" />
                  Tablero de matches
                </h2>
                <span className="text-xs text-soft-muted">{workspace?.matches.total ?? 0}</span>
              </header>
              <div className="max-h-[520px] space-y-2 overflow-auto pr-1">
                {(workspace?.matches.items || []).length > 0
                  ? (workspace?.matches.items || []).map(renderMatchRow)
                  : <p className="text-sm text-soft-muted">Sin matches para este filtro.</p>}
              </div>
            </article>
          </section>
        )}
      </motion.div>
    </div>
  )
}
