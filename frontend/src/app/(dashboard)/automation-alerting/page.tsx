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
              <h1 className="text-4xl font-bold text-soft-white tracking-tight">{t('automationMenu')}</h1>
            </div>
            <p className="text-soft-muted">{t('automationSubtitle')}</p>
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
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4 min-h-0">
              <header className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-soft-white">{t('automationRulesTitle')}</h2>
                <span className="text-sm text-soft-muted">{rules.length}</span>
              </header>
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                {rules.length === 0 ? <p className="text-sm text-soft-muted">{t('automationNoRules')}</p> : rules.map((r) => (
                  <div key={r.id} className="rounded-xl border border-soft-subtle/60 bg-navy-deep/30 p-3">
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
                <h2 className="text-lg font-semibold text-soft-white">{t('automationExecutionsTitle')}</h2>
                <span className="text-sm text-soft-muted">{executions.length}</span>
              </header>
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                {executions.length === 0 ? <p className="text-sm text-soft-muted">{t('automationNoExecutions')}</p> : executions.slice(0, 8).map((e) => (
                  <div key={e.id} className="rounded-xl border border-soft-subtle/60 bg-navy-deep/30 p-3">
                    <p className="text-xs text-soft-muted">{e.trace_id}</p>
                    <p className="mt-1 text-sm text-soft-white">{e.status}</p>
                    <p className="mt-1 text-xs text-gold">{(e.reasons || []).join(', ') || t('automationNoReasons')}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4 min-h-0">
              <header className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-soft-white">{t('automationAlertsTitle')}</h2>
                <span className="text-sm text-soft-muted">{alerts.length}</span>
              </header>
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                {alerts.length === 0 ? <p className="text-sm text-soft-muted">{t('automationNoAlerts')}</p> : alerts.slice(0, 8).map((a) => (
                  <div key={a.id} className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                    <p className="text-sm font-semibold text-red-200"><AlertTriangle className="mr-1 inline h-4 w-4" />{a.alert_type}</p>
                    <p className="mt-1 text-xs text-red-100">{a.message}</p>
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
                ))}
              </div>
            </article>
          </section>
        )}
      </div>
    </div>
  )
}
