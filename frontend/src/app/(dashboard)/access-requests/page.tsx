'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import {
  ApiError,
  approveAccessRequest,
  getAccessRequestAnalyticsSummary,
  getAccessRequestAudit,
  getAccessRequest,
  getAccessRequestLifecycle,
  listAccessRequests,
  rejectAccessRequest,
  retryAccessRequestDecisionEmail,
  type AccessRequest,
  type AccessRequestAuditEvent,
  type AccessRequestAnalyticsSummary,
  type AccessRequestLifecycle,
  type AccessRequestProduct,
  type AccessRequestSource,
  type AccessRequestStatus,
} from '@/lib/access-requests-api'
import { AccessRequestDecisionDialog } from '@/components/access-requests/AccessRequestDecisionDialog'
import { AccessRequestDetailPanel } from '@/components/access-requests/AccessRequestDetailPanel'
import { AccessRequestOperationsDashboard } from '@/components/access-requests/AccessRequestOperationsDashboard'
import { AccessRequestsTable } from '@/components/access-requests/AccessRequestsTable'

export default function AccessRequestsPage() {
  const { t } = useI18n()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [selected, setSelected] = useState<AccessRequest | null>(null)
  const [analytics, setAnalytics] = useState<AccessRequestAnalyticsSummary | null>(null)
  const [statusFilter, setStatusFilter] = useState<AccessRequestStatus | ''>('pending')
  const [productFilter, setProductFilter] = useState<AccessRequestProduct | ''>('')
  const [sourceFilter, setSourceFilter] = useState<AccessRequestSource | ''>('')
  const [emailFilter, setEmailFilter] = useState('')
  const [auditEvents, setAuditEvents] = useState<AccessRequestAuditEvent[]>([])
  const [lifecycle, setLifecycle] = useState<AccessRequestLifecycle | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [auditLoading, setAuditLoading] = useState(false)
  const [lifecycleLoading, setLifecycleLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [retryingEmail, setRetryingEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [auditError, setAuditError] = useState<string | null>(null)
  const [lifecycleError, setLifecycleError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [decisionError, setDecisionError] = useState<string | null>(null)
  const [decisionMode, setDecisionMode] = useState<'approve' | 'reject' | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const selectedId = selected?.id ?? null

  const formatApiError = useCallback((err: unknown, fallbackKey: Parameters<typeof t>[0]) => {
    if (err instanceof ApiError) {
      if (err.status === 403) return t('accessRequestsPermissionDenied')
      if (err.status === 404) return t('accessRequestsNotFound')
      if (err.status === 409) return t('accessRequestsInvalidTransition')
      if (err.status === 401) return t('accessRequestsAuthRequired')
    }
    return err instanceof Error ? err.message : t(fallbackKey)
  }, [t])

  const loadList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = await listAccessRequests({
        status: statusFilter,
        product: productFilter,
        source: sourceFilter,
        email: emailFilter,
        limit: 50,
      })
      setRequests(payload)
      setSelected((current) => payload.find((request) => request.id === current?.id) ?? payload[0] ?? null)
    } catch (err) {
      setError(formatApiError(err, 'accessRequestsLoadError'))
      setRequests([])
      setSelected(null)
    } finally {
      setLoading(false)
    }
  }, [emailFilter, formatApiError, productFilter, sourceFilter, statusFilter])

  useEffect(() => {
    void loadList()
  }, [loadList])

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    setAnalyticsError(null)
    try {
      setAnalytics(await getAccessRequestAnalyticsSummary(500))
    } catch (err) {
      setAnalytics(null)
      setAnalyticsError(formatApiError(err, 'accessRequestsAnalyticsLoadError'))
    } finally {
      setAnalyticsLoading(false)
    }
  }, [formatApiError])

  useEffect(() => {
    void loadAnalytics()
  }, [loadAnalytics])

  const loadAudit = useCallback(async (requestId: string) => {
    setAuditLoading(true)
    setAuditError(null)
    try {
      setAuditEvents(await getAccessRequestAudit(requestId))
    } catch (err) {
      setAuditEvents([])
      setAuditError(formatApiError(err, 'accessRequestsAuditLoadError'))
    } finally {
      setAuditLoading(false)
    }
  }, [formatApiError])

  const loadLifecycle = useCallback(async (requestId: string) => {
    setLifecycleLoading(true)
    setLifecycleError(null)
    try {
      setLifecycle(await getAccessRequestLifecycle(requestId))
    } catch (err) {
      setLifecycle(null)
      setLifecycleError(formatApiError(err, 'accessRequestsLifecycleLoadError'))
    } finally {
      setLifecycleLoading(false)
    }
  }, [formatApiError])

  useEffect(() => {
    if (!selectedId) {
      setAuditEvents([])
      setAuditError(null)
      setLifecycle(null)
      setLifecycleError(null)
      return
    }
    void loadAudit(selectedId)
    void loadLifecycle(selectedId)
  }, [loadAudit, loadLifecycle, selectedId])

  async function selectRequest(request: AccessRequest) {
    await openRequestById(request.id, request)
  }

  async function openRequestById(requestId: string, fallback?: AccessRequest) {
    if (fallback) {
      setSelected(fallback)
    }
    setDetailLoading(true)
    setError(null)
    try {
      setSelected(await getAccessRequest(requestId))
    } catch (err) {
      setError(formatApiError(err, 'accessRequestsDetailLoadError'))
    } finally {
      setDetailLoading(false)
    }
  }

  function openDecision(mode: 'approve' | 'reject') {
    setDecisionMode(mode)
    setDecisionError(null)
    setAdminNotes('')
    setRejectionReason('')
  }

  async function submitDecision() {
    if (!selected || !decisionMode) return

    setSubmitting(true)
    setDecisionError(null)
    setSuccess(null)
    try {
      const payload =
        decisionMode === 'approve'
          ? await approveAccessRequest(selected.id, {
              admin_notes: adminNotes.trim() || undefined,
            })
          : await rejectAccessRequest(selected.id, {
              admin_notes: adminNotes.trim() || undefined,
              rejection_reason: rejectionReason.trim(),
            })

      setSelected(payload)
      setDecisionMode(null)
      const emailStatus = payload.decision_email?.status
      setSuccess(
        emailStatus
          ? `${t('accessRequestsDecisionSaved')} ${t('accessRequestsEmailStatus')}: ${emailStatus}`
          : t('accessRequestsDecisionSaved'),
      )
      await loadList()
      await loadAnalytics()
      setSelected(payload)
      if (payload.lifecycle) {
        setLifecycle(payload.lifecycle)
      } else {
        await loadLifecycle(payload.id)
      }
      await loadAudit(payload.id)
    } catch (err) {
      setDecisionError(formatApiError(err, 'accessRequestsDecisionError'))
    } finally {
      setSubmitting(false)
    }
  }

  async function retryDecisionEmail() {
    if (!selected) return

    setRetryingEmail(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = await retryAccessRequestDecisionEmail(selected.id)
      setSelected(payload)
      const emailStatus = payload.decision_email?.status
      setSuccess(
        emailStatus
          ? `${t('accessRequestsDecisionEmailRetrySaved')} ${t('accessRequestsEmailStatus')}: ${emailStatus}`
          : t('accessRequestsDecisionEmailRetrySaved'),
      )
      if (payload.lifecycle) {
        setLifecycle(payload.lifecycle)
      } else {
        await loadLifecycle(payload.id)
      }
      await loadAudit(payload.id)
      await loadList()
      await loadAnalytics()
      setSelected(payload)
    } catch (err) {
      setError(formatApiError(err, 'accessRequestsDecisionEmailRetryError'))
    } finally {
      setRetryingEmail(false)
    }
  }

  return (
    <div className="min-h-full p-6">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-5">
        <section className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="page-title">{t('accessRequestsTitle')}</h1>
              <p className="page-subtitle mt-2">{t('accessRequestsSubtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => void Promise.all([loadList(), loadAnalytics()])}
              className="btn-action"
              disabled={loading || analyticsLoading}
            >
              <RefreshCw className={`h-4 w-4 ${loading || analyticsLoading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </button>
          </div>
        </section>

        <AccessRequestOperationsDashboard
          analytics={analytics}
          loading={analyticsLoading}
          error={analyticsError}
          onSelectAttentionItem={(requestId) => void openRequestById(requestId)}
          t={t}
        />

        <section className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5">
          <div className="grid gap-3 md:grid-cols-[180px_180px_180px_minmax(220px,1fr)]">
            <label>
              <span className="mb-2 block text-sm font-semibold text-soft-white">{t('status')}</span>
              <select className="ui-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AccessRequestStatus | '')}>
                <option value="">{t('accessRequestsAllStatuses')}</option>
                <option value="pending">{t('accessRequestsStatusPending')}</option>
                <option value="approved">{t('accessRequestsStatusApproved')}</option>
                <option value="rejected">{t('accessRequestsStatusRejected')}</option>
                <option value="cancelled">{t('accessRequestsStatusCancelled')}</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-soft-white">{t('accessRequestsColumnProduct')}</span>
              <select className="ui-select" value={productFilter} onChange={(event) => setProductFilter(event.target.value as AccessRequestProduct | '')}>
                <option value="">{t('accessRequestsAllProducts')}</option>
                <option value="synergi">Synergi</option>
                <option value="data_lab">Data Lab</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-soft-white">{t('accessRequestsColumnSource')}</span>
              <select className="ui-select" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as AccessRequestSource | '')}>
                <option value="">{t('accessRequestsAllSources')}</option>
                <option value="landing">{t('accessRequestsSourceLanding')}</option>
                <option value="synergi_app">{t('accessRequestsSourceSynergiApp')}</option>
                <option value="data_lab_app">{t('accessRequestsSourceDataLabApp')}</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-soft-white">{t('accessRequestsEmailFilter')}</span>
              <input
                className="ui-input"
                value={emailFilter}
                onChange={(event) => setEmailFilter(event.target.value)}
                placeholder={t('accessRequestsEmailFilterPlaceholder')}
              />
            </label>
            <div className="self-end rounded-xl border border-soft-subtle/50 bg-navy-deep/30 px-4 py-3 text-sm text-soft-muted">
              {t('accessRequestsFilterHint')}
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-rose-400/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <section className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5">
            <div className="mb-4">
              <h2 className="section-title">{t('accessRequestsQueueTitle')}</h2>
              <p className="section-subtitle mt-1">{t('accessRequestsQueueSubtitle')}</p>
            </div>
            <AccessRequestsTable
              requests={requests}
              selectedId={selectedId}
              loading={loading}
              onSelect={(request) => void selectRequest(request)}
              t={t}
            />
          </section>

          <div className="min-w-0 space-y-3">
            {detailLoading ? (
              <div className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5 text-sm text-soft-muted">
                {t('accessRequestsDetailLoading')}
              </div>
            ) : null}
            <AccessRequestDetailPanel
              request={selected}
              auditEvents={auditEvents}
              auditLoading={auditLoading}
              auditError={auditError}
              lifecycle={lifecycle}
              lifecycleLoading={lifecycleLoading}
              lifecycleError={lifecycleError}
              retryingEmail={retryingEmail}
              onApprove={() => openDecision('approve')}
              onReject={() => openDecision('reject')}
              onRetryDecisionEmail={() => void retryDecisionEmail()}
              t={t}
            />
          </div>
        </div>
      </div>

      <AccessRequestDecisionDialog
        request={selected}
        mode={decisionMode}
        adminNotes={adminNotes}
        rejectionReason={rejectionReason}
        submitting={submitting}
        error={decisionError}
        onAdminNotesChange={setAdminNotes}
        onRejectionReasonChange={setRejectionReason}
        onClose={() => setDecisionMode(null)}
        onSubmit={() => void submitDecision()}
        t={t}
      />
    </div>
  )
}
