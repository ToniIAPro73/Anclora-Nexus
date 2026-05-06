'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { RefreshCw } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import supabase from '@/lib/supabase'
import {
  approveAccessRequest,
  getAccessRequest,
  listAccessRequests,
  rejectAccessRequest,
  type AccessRequest,
  type AccessRequestProduct,
  type AccessRequestStatus,
} from '@/lib/access-requests-api'
import { AccessRequestDecisionDialog } from '@/components/access-requests/AccessRequestDecisionDialog'
import { AccessRequestDetailPanel } from '@/components/access-requests/AccessRequestDetailPanel'
import { AccessRequestsTable } from '@/components/access-requests/AccessRequestsTable'

function getReviewerIdentity(user: { email?: string | null; id?: string | null } | null | undefined) {
  return user?.email || user?.id || null
}

export default function AccessRequestsPage() {
  const { t } = useI18n()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [selected, setSelected] = useState<AccessRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<AccessRequestStatus | ''>('pending')
  const [productFilter, setProductFilter] = useState<AccessRequestProduct | ''>('')
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [decisionError, setDecisionError] = useState<string | null>(null)
  const [decisionMode, setDecisionMode] = useState<'approve' | 'reject' | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [reviewerIdentity, setReviewerIdentity] = useState<string | null>(null)

  const selectedId = selected?.id ?? null

  const counts = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((request) => request.status === 'pending').length,
      approved: requests.filter((request) => request.status === 'approved').length,
      rejected: requests.filter((request) => request.status === 'rejected').length,
    }
  }, [requests])

  const loadList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = await listAccessRequests({
        status: statusFilter,
        product: productFilter,
        limit: 50,
      })
      setRequests(payload)
      setSelected((current) => payload.find((request) => request.id === current?.id) ?? payload[0] ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('accessRequestsLoadError'))
      setRequests([])
      setSelected(null)
    } finally {
      setLoading(false)
    }
  }, [productFilter, statusFilter, t])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    let mounted = true

    async function loadReviewerIdentity() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (mounted) {
        setReviewerIdentity(getReviewerIdentity(user))
      }
    }

    void loadReviewerIdentity()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setReviewerIdentity(getReviewerIdentity(session?.user))
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function selectRequest(request: AccessRequest) {
    setSelected(request)
    setDetailLoading(true)
    setError(null)
    try {
      setSelected(await getAccessRequest(request.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('accessRequestsDetailLoadError'))
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
    if (!reviewerIdentity) {
      setDecisionError(t('accessRequestsReviewerIdentityError'))
      return
    }

    setSubmitting(true)
    setDecisionError(null)
    setSuccess(null)
    try {
      const payload =
        decisionMode === 'approve'
          ? await approveAccessRequest(selected.id, {
              reviewed_by: reviewerIdentity,
              admin_notes: adminNotes.trim() || undefined,
            })
          : await rejectAccessRequest(selected.id, {
              reviewed_by: reviewerIdentity,
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
      setSelected(payload)
    } catch (err) {
      setDecisionError(err instanceof Error ? err.message : t('accessRequestsDecisionError'))
    } finally {
      setSubmitting(false)
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
            <button type="button" onClick={() => void loadList()} className="btn-action" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </button>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-4">
          <div className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
            <p className="kpi-label">{t('total')}</p>
            <p className="kpi-value">{counts.total}</p>
          </div>
          <div className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
            <p className="kpi-label">{t('accessRequestsStatusPending')}</p>
            <p className="kpi-value text-gold">{counts.pending}</p>
          </div>
          <div className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
            <p className="kpi-label">{t('accessRequestsStatusApproved')}</p>
            <p className="kpi-value">{counts.approved}</p>
          </div>
          <div className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
            <p className="kpi-label">{t('accessRequestsStatusRejected')}</p>
            <p className="kpi-value">{counts.rejected}</p>
          </div>
        </section>

        <section className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5">
          <div className="grid gap-3 md:grid-cols-[220px_220px_1fr]">
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
              onApprove={() => openDecision('approve')}
              onReject={() => openDecision('reject')}
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
