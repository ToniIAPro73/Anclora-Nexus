'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock3, Filter, Home, RefreshCw, Users, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import {
  getProspectionWorkspace,
  updateBuyer,
  updateMatch,
  updateProperty,
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

const STATUS_ACTION: Record<string, string> = {
  candidate: 'Llamar comprador',
  contacted: 'Agendar visita',
  viewing: 'Preparar propuesta',
  negotiating: 'Cerrar condiciones',
  offer: 'Follow-up oferta',
  closed: 'Archivado',
  discarded: 'Descartado',
}

const MATCH_FLOW: PropertyBuyerMatch['match_status'][] = [
  'candidate',
  'contacted',
  'viewing',
  'negotiating',
  'offer',
  'closed',
]

const PROPERTY_FLOW: ProspectedProperty['status'][] = [
  'new',
  'contacted',
  'negotiating',
  'listed',
]

const BUYER_FLOW: BuyerProfile['status'][] = [
  'active',
  'inactive',
  'closed',
]

function sourceLabel(source?: string | null): string {
  if (!source) return 'Origen no definido'
  const s = source.toLowerCase()
  if (s === 'pbm') return 'PBM'
  if (s === 'widget') return 'Widget'
  if (s === 'manual') return 'Manual'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function roleLabel(role?: string): string {
  const s = (role || '').toLowerCase()
  if (s === 'owner') return 'Owner'
  if (s === 'manager') return 'Manager'
  if (s === 'agent') return 'Agente'
  return 'Usuario'
}

function priorityBadge(score: number): { label: string; cls: string } {
  if (score >= 85) return { label: 'P1', cls: 'bg-red-500/15 text-red-300 border-red-500/30' }
  if (score >= 70) return { label: 'P2', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' }
  if (score >= 55) return { label: 'P3', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' }
  return { label: 'P4', cls: 'bg-blue-500/15 text-blue-300 border-blue-500/30' }
}

function nextInFlow<T extends string>(current: T, flow: readonly T[]): T {
  const idx = flow.indexOf(current)
  if (idx === -1 || idx === flow.length - 1) return flow[0]
  return flow[idx + 1]
}

export default function ProspectionUnifiedPage() {
  const { t } = useI18n()
  const { formatCompact } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('')
  const [workspace, setWorkspace] = useState<ProspectionWorkspaceResponse | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)
  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({})
  const [actionMessage, setActionMessage] = useState<string | null>(null)

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

  const runAction = useCallback(async (key: string, fn: () => Promise<void>, okMessage: string) => {
    setActionBusy((prev) => ({ ...prev, [key]: true }))
    setActionMessage(null)
    try {
      await fn()
      setActionMessage(okMessage)
      await loadWorkspace()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo completar la accion'
      setActionMessage(message)
    } finally {
      setActionBusy((prev) => ({ ...prev, [key]: false }))
    }
  }, [loadWorkspace])

  const role = roleLabel(workspace?.scope.role)
  const updatedLabel = lastUpdatedAt
    ? lastUpdatedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  const totalVisible = (workspace?.totals.properties || 0) + (workspace?.totals.buyers || 0) + (workspace?.totals.matches || 0)

  const topMatches = useMemo(
    () => [...(workspace?.matches.items || [])].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 8),
    [workspace?.matches.items],
  )

  const propertyQueue = useMemo(
    () => [...(workspace?.properties.items || [])].sort((a, b) => (b.high_ticket_score || 0) - (a.high_ticket_score || 0)).slice(0, 8),
    [workspace?.properties.items],
  )

  const buyerQueue = useMemo(
    () => [...(workspace?.buyers.items || [])].sort((a, b) => (b.motivation_score || 0) - (a.motivation_score || 0)).slice(0, 8),
    [workspace?.buyers.items],
  )

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
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
                <h1 className="text-3xl font-bold text-soft-white">Prospeccion operativa</h1>
                <p className="mt-1 text-sm text-soft-muted">Cola de trabajo priorizada para ejecutar captacion, contacto y cierre.</p>
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

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">{role}</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              {totalVisible} items en bandeja
            </span>
            <span className="rounded-full border border-soft-subtle bg-navy-surface/40 px-3 py-1 text-xs text-soft-muted">
              Ultima actualizacion {updatedLabel}
            </span>
          </div>
        </section>

        {error ? (
          <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</section>
        ) : null}

        {actionMessage ? (
          <section className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {actionMessage}
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">Propiedades</p>
            <p className="mt-2 text-3xl font-bold text-gold">{workspace?.totals.properties ?? 0}</p>
            <p className="mt-1 text-xs text-soft-muted">Activas en pipeline</p>
          </article>
          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">Buyers</p>
            <p className="mt-2 text-3xl font-bold text-gold">{workspace?.totals.buyers ?? 0}</p>
            <p className="mt-1 text-xs text-soft-muted">Con demanda cualificada</p>
          </article>
          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">Matches</p>
            <p className="mt-2 text-3xl font-bold text-gold">{workspace?.totals.matches ?? 0}</p>
            <p className="mt-1 text-xs text-soft-muted">Para ejecutar hoy</p>
          </article>
        </section>

        {loading ? (
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 rounded-2xl border border-soft-subtle bg-navy-surface/30 animate-pulse" />
            ))}
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
              <header className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-soft-white">
                  <Zap className="h-4 w-4 text-gold" />
                  Cola de cierre (hoy)
                </h2>
                <span className="text-xs text-soft-muted">{topMatches.length}</span>
              </header>
              <div className="max-h-[520px] space-y-2 overflow-auto pr-1">
                {topMatches.length === 0 ? (
                  <p className="text-sm text-soft-muted">Sin matches para ejecutar.</p>
                ) : (
                  topMatches.map((m) => {
                    const p = priorityBadge(m.match_score || 0)
                    const busyKey = `match-${m.id}`
                    const nextStatus = nextInFlow(m.match_status, MATCH_FLOW)
                    return (
                      <div key={m.id} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-soft-white line-clamp-1">{m.property_title || m.property_id}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${p.cls}`}>{p.label}</span>
                        </div>
                        <p className="mt-1 text-xs text-soft-muted line-clamp-1">{m.buyer_name || m.buyer_id}</p>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-gold">Score {Math.round(m.match_score || 0)}</span>
                          <span className="text-emerald-300">{STATUS_ACTION[m.match_status] || 'Revisar'}</span>
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            disabled={Boolean(actionBusy[busyKey])}
                            onClick={() => void runAction(
                              busyKey,
                              async () => {
                                await updateMatch(m.id, { match_status: nextStatus })
                              },
                              `Match actualizado a ${nextStatus}.`,
                            )}
                            className="w-full rounded-lg border border-gold/40 bg-gold/10 px-2 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20 disabled:opacity-50"
                          >
                            {actionBusy[busyKey] ? 'Actualizando...' : `Mover a ${nextStatus}`}
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
              <header className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-soft-white">
                  <Home className="h-4 w-4 text-gold" />
                  Captacion prioritaria
                </h2>
                <span className="text-xs text-soft-muted">{propertyQueue.length}</span>
              </header>
              <div className="max-h-[520px] space-y-2 overflow-auto pr-1">
                {propertyQueue.length === 0 ? (
                  <p className="text-sm text-soft-muted">Sin propiedades en cola.</p>
                ) : (
                  propertyQueue.map((pItem) => {
                    const p = priorityBadge(pItem.high_ticket_score || 0)
                    const busyKey = `property-${pItem.id}`
                    const nextStatus = nextInFlow(pItem.status, PROPERTY_FLOW)
                    return (
                      <div key={pItem.id} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-soft-white line-clamp-1">{pItem.title || pItem.zone || 'Propiedad sin titulo'}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${p.cls}`}>{p.label}</span>
                        </div>
                        <p className="mt-1 text-xs text-soft-muted line-clamp-1">{pItem.zone || pItem.city || 'Zona no definida'} · {pItem.property_type || 'Tipo no definido'}</p>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-gold">{pItem.price != null ? formatCompact(pItem.price) : '-'}</span>
                          <span className="text-blue-300">{sourceLabel(pItem.source)}</span>
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            disabled={Boolean(actionBusy[busyKey])}
                            onClick={() => void runAction(
                              busyKey,
                              async () => {
                                await updateProperty(pItem.id, { status: nextStatus })
                              },
                              `Propiedad movida a ${nextStatus}.`,
                            )}
                            className="w-full rounded-lg border border-blue-400/40 bg-blue-500/10 px-2 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-500/20 disabled:opacity-50"
                          >
                            {actionBusy[busyKey] ? 'Actualizando...' : `Mover a ${nextStatus}`}
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
              <header className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-soft-white">
                  <Users className="h-4 w-4 text-gold" />
                  Seguimiento de buyers
                </h2>
                <span className="text-xs text-soft-muted">{buyerQueue.length}</span>
              </header>
              <div className="max-h-[520px] space-y-2 overflow-auto pr-1">
                {buyerQueue.length === 0 ? (
                  <p className="text-sm text-soft-muted">Sin buyers en seguimiento.</p>
                ) : (
                  buyerQueue.map((b) => {
                    const p = priorityBadge((b.motivation_score || 0) * 10)
                    const busyKey = `buyer-${b.id}`
                    const nextStatus = nextInFlow(b.status, BUYER_FLOW)
                    return (
                      <div key={b.id} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-soft-white line-clamp-1">{b.full_name || b.email || 'Buyer sin nombre'}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${p.cls}`}>{p.label}</span>
                        </div>
                        <p className="mt-1 text-xs text-soft-muted line-clamp-1">{b.email || b.phone || 'Sin contacto'}</p>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-gold">
                            {b.budget_min != null && b.budget_max != null
                              ? `${formatCompact(b.budget_min)} - ${formatCompact(b.budget_max)}`
                              : 'Presupuesto pendiente'}
                          </span>
                          <span className="text-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Accionable
                          </span>
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            disabled={Boolean(actionBusy[busyKey])}
                            onClick={() => void runAction(
                              busyKey,
                              async () => {
                                await updateBuyer(b.id, { status: nextStatus })
                              },
                              `Buyer movido a ${nextStatus}.`,
                            )}
                            className="w-full rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
                          >
                            {actionBusy[busyKey] ? 'Actualizando...' : `Mover a ${nextStatus}`}
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </article>
          </section>
        )}

        <section className="rounded-xl border border-soft-subtle bg-navy-surface/30 p-4">
          <div className="flex items-center gap-2 text-xs text-soft-muted">
            <Clock3 className="h-4 w-4" />
            Esta vista esta orientada a ejecucion diaria (quien contactar, que priorizar y que cerrar hoy).
          </div>
        </section>
      </motion.div>
    </div>
  )
}
