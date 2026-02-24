'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Bot, Play, RefreshCw, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <div className="min-h-screen p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <section className="rounded-2xl border border-soft-subtle bg-gradient-to-br from-navy-deep/80 via-navy-surface/50 to-navy-deep/70 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-soft-white">{t('automationMenu')}</h1>
              <p className="mt-1 text-sm text-soft-muted">{t('automationSubtitle')}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-soft-subtle bg-navy-surface/40 px-3 py-2 text-sm text-soft-white hover:border-gold/50"
                onClick={() => void load()}
              >
                <RefreshCw className="h-4 w-4" />
                {t('refresh')}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/20"
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
          </div>
        </section>

        {error ? <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</section> : null}
        {message ? <section className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</section> : null}

        {loading ? (
          <section className="h-64 rounded-xl border border-soft-subtle bg-navy-surface/30 animate-pulse" />
        ) : (
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <article className="rounded-xl border border-soft-subtle bg-navy-surface/35 p-4">
              <header className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-soft-white">{t('automationRulesTitle')}</h2>
                <span className="text-xs text-soft-muted">{rules.length}</span>
              </header>
              <div className="space-y-2">
                {rules.length === 0 ? <p className="text-sm text-soft-muted">{t('automationNoRules')}</p> : rules.map((r) => (
                  <div key={r.id} className="rounded-lg border border-soft-subtle/60 bg-navy-deep/30 p-3">
                    <p className="text-sm font-semibold text-soft-white line-clamp-1">{r.name}</p>
                    <p className="mt-1 text-xs text-soft-muted">{r.event_type} · {r.channel}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-blue-400/40 bg-blue-500/10 px-2 py-1 text-xs text-blue-200 hover:bg-blue-500/20"
                        onClick={() => void run(`dry-${r.id}`, async () => {
                          const res = await dryRunAutomationRule(r.id, { cost_estimate_eur: 1 })
                          setMessage(`${t('automationDryRun')}: ${res.decision}`)
                        })}
                        disabled={busyKey === `dry-${r.id}`}
                      >
                        <ShieldCheck className="mr-1 inline h-3 w-3" />
                        {t('automationDryRun')}
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-gold/40 bg-gold/10 px-2 py-1 text-xs font-semibold text-gold hover:bg-gold/20"
                        onClick={() => void run(`exec-${r.id}`, async () => {
                          const res = await executeAutomationRule(r.id, {
                            cost_estimate_eur: 1,
                            confirm_human_checkpoint: true,
                          })
                          setMessage(`${t('automationExecute')}: ${res.status}`)
                        })}
                        disabled={busyKey === `exec-${r.id}`}
                      >
                        <Play className="mr-1 inline h-3 w-3" />
                        {t('automationExecute')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-soft-subtle bg-navy-surface/35 p-4">
              <header className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-soft-white">{t('automationExecutionsTitle')}</h2>
                <span className="text-xs text-soft-muted">{executions.length}</span>
              </header>
              <div className="space-y-2">
                {executions.length === 0 ? <p className="text-sm text-soft-muted">{t('automationNoExecutions')}</p> : executions.slice(0, 8).map((e) => (
                  <div key={e.id} className="rounded-lg border border-soft-subtle/60 bg-navy-deep/30 p-3">
                    <p className="text-xs text-soft-muted">{e.trace_id}</p>
                    <p className="mt-1 text-sm text-soft-white">{e.status}</p>
                    <p className="mt-1 text-xs text-gold">{(e.reasons || []).join(', ') || t('automationNoReasons')}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-soft-subtle bg-navy-surface/35 p-4">
              <header className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-soft-white">{t('automationAlertsTitle')}</h2>
                <span className="text-xs text-soft-muted">{alerts.length}</span>
              </header>
              <div className="space-y-2">
                {alerts.length === 0 ? <p className="text-sm text-soft-muted">{t('automationNoAlerts')}</p> : alerts.slice(0, 8).map((a) => (
                  <div key={a.id} className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    <p className="text-sm font-semibold text-red-200"><AlertTriangle className="mr-1 inline h-4 w-4" />{a.alert_type}</p>
                    <p className="mt-1 text-xs text-red-100">{a.message}</p>
                    <button
                      type="button"
                      className="mt-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-500/20"
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
      </motion.div>
    </div>
  )
}
