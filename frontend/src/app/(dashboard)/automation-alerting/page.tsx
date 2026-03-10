'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Bot, Play, RefreshCw, ShieldCheck } from 'lucide-react'

import { useI18n } from '@/lib/i18n'
import {
  acknowledgeAutomationAlert,
  createAutomationRule,
  dryRunAutomationRule,
  executeAutomationRule,
  listAutomationAlerts,
  listAutomationExecutions,
  listAutomationRules,
  type AlertItem,
  type AutomationRule,
  type ExecutionItem,
} from '@/lib/automation-api'

export default function AutomationAlertingPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [executions, setExecutions] = useState<ExecutionItem[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [rulesRes, execRes, alertRes] = await Promise.all([
        listAutomationRules(),
        listAutomationExecutions(),
        listAutomationAlerts(),
      ])
      setRules(rulesRes.items)
      setExecutions(execRes.items)
      setAlerts(alertRes.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('automationLoadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const run = useCallback(async (key: string, fn: () => Promise<void>) => {
    setBusyKey(key)
    setMessage(null)
    try {
      await fn()
      await load()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t('automationActionError'))
    } finally {
      setBusyKey(null)
    }
  }, [load, t])

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-5">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-soft-subtle/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl border border-soft-subtle bg-navy-surface/40 text-soft-muted hover:text-soft-white hover:border-blue-light/50 transition-all group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <h1 className="page-title">{t('automationMenu')}</h1>
            </div>
            <p className="page-subtitle">{t('automationSubtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-action"
              onClick={() => void load()}
            >
              <RefreshCw className="h-4 w-4" />
              {t('refresh')}
            </button>
            <button
              type="button"
              className="btn-create"
              onClick={() => void run('create-rule', async () => {
                await createAutomationRule({
                  name: t('automationDefaultRuleName'),
                  event_type: 'match.hot',
                  channel: 'in_app',
                  action_type: 'notify',
                  max_cost_eur_per_run: 2,
                  requires_human_checkpoint: true,
                })
                setMessage(t('automationRuleCreated'))
              })}
              disabled={busyKey === 'create-rule'}
            >
              <Bot className="h-4 w-4" />
              {t('automationCreateRule')}
            </button>
          </div>
        </section>

        {error ? <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</section> : null}
        {message ? <section className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</section> : null}

        {loading ? (
          <section className="h-64 rounded-2xl border border-soft-subtle bg-navy-surface/30 animate-pulse" />
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <p className="kpi-label">{t('automationAlertsTitle')}</p>
                <p className="mt-2 text-2xl font-semibold text-soft-white">{alerts.length}</p>
                <p className="mt-1 text-xs text-soft-muted">{t('automationOperationalVisibility')}</p>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <p className="kpi-label">{t('automationCriticalAlerts')}</p>
                <p className="mt-2 text-2xl font-semibold text-red-300">{alerts.filter((a) => a.severity === 'critical').length}</p>
                <p className="mt-1 text-xs text-soft-muted">{t('automationScopeOperational')}</p>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <p className="kpi-label">{t('automationRulesTitle')}</p>
                <p className="mt-2 text-2xl font-semibold text-soft-white">{rules.length}</p>
                <p className="mt-1 text-xs text-soft-muted">{t('automationExecutionsTitle')}: {executions.length}</p>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <p className="kpi-label">{t('automationGuardrailBlocks')}</p>
                <p className="mt-2 text-2xl font-semibold text-amber-200">{alerts.filter((a) => a.alert_scope === 'rule').length}</p>
                <p className="mt-1 text-xs text-soft-muted">{t('automationScopeRules')}</p>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4 min-h-0">
              <header className="mb-3 flex items-center justify-between">
                <h2 className="section-title">{t('automationRulesTitle')}</h2>
                <span className="text-sm text-soft-muted">{rules.length}</span>
              </header>
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                {rules.length === 0 ? <p className="text-sm text-soft-muted">{t('automationNoRules')}</p> : rules.map((r) => (
                  <div key={r.id} className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/60 bg-navy-deep/30 p-3">
                    <p className="text-sm font-semibold text-soft-white line-clamp-1">{r.name}</p>
                    <p className="mt-1 text-xs text-soft-muted">{r.event_type} · {r.channel}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="btn-action !h-8 !px-3 !rounded-lg !text-xs !font-semibold"
                        onClick={() => void run(`dry-${r.id}`, async () => {
                          const res = await dryRunAutomationRule(r.id, { cost_estimate_eur: 1 })
                          setMessage(`${t('automationDryRun')}: ${res.decision}`)
                        })}
                        disabled={busyKey === `dry-${r.id}`}
                      >
                        <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                        {t('automationDryRun')}
                      </button>
                      <button
                        type="button"
                        className="btn-action !h-8 !px-3 !rounded-lg !text-xs !font-semibold"
                        onClick={() => void run(`exec-${r.id}`, async () => {
                          const res = await executeAutomationRule(r.id, {
                            cost_estimate_eur: 1,
                            confirm_human_checkpoint: true,
                          })
                          setMessage(`${t('automationExecute')}: ${res.status}`)
                        })}
                        disabled={busyKey === `exec-${r.id}`}
                      >
                        <Play className="mr-1 inline h-3.5 w-3.5" />
                        {t('automationExecute')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4 min-h-0">
              <header className="mb-3 flex items-center justify-between">
                <h2 className="section-title">{t('automationExecutionsTitle')}</h2>
                <span className="text-sm text-soft-muted">{executions.length}</span>
              </header>
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                {executions.length === 0 ? <p className="text-sm text-soft-muted">{t('automationNoExecutions')}</p> : executions.slice(0, 8).map((e) => (
                  <div key={e.id} className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/60 bg-navy-deep/30 p-3">
                    <p className="text-xs text-soft-muted">{e.trace_id}</p>
                    <p className="mt-1 text-sm text-soft-white">{e.status}</p>
                    <p className="mt-1 text-xs text-gold">{(e.reasons || []).join(', ') || t('automationNoReasons')}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4 min-h-0">
              <header className="mb-3 flex items-center justify-between">
                <h2 className="section-title">{t('automationAlertsTitle')}</h2>
                <span className="text-sm text-soft-muted">{alerts.length}</span>
              </header>
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                {alerts.length === 0 ? <p className="text-sm text-soft-muted">{t('automationNoAlerts')}</p> : alerts.slice(0, 8).map((a) => (
                  (() => {
                    const sourceKey = typeof a.metadata_json?.['source_key'] === 'string' ? String(a.metadata_json['source_key']) : null
                    const freshnessHours = a.metadata_json?.['freshness_hours']
                    const heartbeatAgeHours = a.metadata_json?.['heartbeat_age_hours']
                    const retryCount = a.metadata_json?.['retry_count']
                    const missingEnv = Array.isArray(a.metadata_json?.['missing_env']) ? (a.metadata_json['missing_env'] as string[]) : []
                    return (
                      <div
                        key={a.id}
                        className={`surface-secondary surface-copy-safe rounded-xl p-3 ${
                          a.severity === 'critical'
                            ? 'border border-red-500/30 bg-red-500/10'
                            : 'border border-amber-500/30 bg-amber-500/10'
                        }`}
                      >
                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <p className={`min-w-0 flex-1 text-sm font-semibold ${a.severity === 'critical' ? 'text-red-200' : 'text-amber-100'}`}>
                            <AlertTriangle className="mr-1 inline h-4 w-4" />
                            {a.alert_type}
                          </p>
                          <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[11px] ${
                            a.severity === 'critical'
                              ? 'border border-red-500/30 bg-red-500/10 text-red-200'
                              : 'border border-amber-500/30 bg-amber-500/10 text-amber-100'
                          }`}>
                            {a.severity === 'critical' ? t('automationSeverityCritical') : t('automationSeverityWarning')}
                          </span>
                        </div>
                        <p className={`mt-1 min-w-0 break-words text-xs ${a.severity === 'critical' ? 'text-red-100' : 'text-amber-50'}`}>{a.message}</p>
                        <p className="mt-2 min-w-0 text-xs text-soft-muted">
                          {t('automationAlertScope')}: {a.alert_scope} · {t('lastUpdate')}: {new Date(a.updated_at || a.created_at).toLocaleString()}
                        </p>
                        {sourceKey && (
                          <p className="mt-1 min-w-0 text-xs text-soft-muted">
                            {t('source')}: {sourceKey}
                          </p>
                        )}
                        {freshnessHours != null && (
                          <p className="mt-1 min-w-0 text-xs text-soft-muted">
                            {t('automationFreshness')}: {String(freshnessHours)}h
                          </p>
                        )}
                        {heartbeatAgeHours != null && (
                          <p className="mt-1 min-w-0 text-xs text-soft-muted">
                            {t('automationHeartbeatAge')}: {String(heartbeatAgeHours)}h
                          </p>
                        )}
                        {retryCount != null && (
                          <p className="mt-1 min-w-0 text-xs text-soft-muted">
                            {t('sourceObservatoryRetries')}: {String(retryCount)}
                          </p>
                        )}
                        {missingEnv.length > 0 && (
                          <p className="mt-1 min-w-0 break-words text-xs text-soft-muted">
                            Missing env: {missingEnv.join(', ')}
                          </p>
                        )}
                    <button
                      type="button"
                      className="btn-action !mt-2 !h-8 !px-3 !rounded-lg !text-xs !font-semibold"
                      onClick={() => void run(`ack-${a.id}`, async () => {
                        await acknowledgeAutomationAlert(a.id)
                        setMessage(t('automationAlertAcknowledged'))
                      })}
                      disabled={busyKey === `ack-${a.id}`}
                    >
                      {t('automationAcknowledge')}
                    </button>
                      </div>
                    )
                  })()
                ))}
              </div>
            </article>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
