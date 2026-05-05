'use client'

import { CheckCircle2, ClipboardList, XCircle } from 'lucide-react'
import type { TranslationKey } from '@/lib/i18n'
import type { AccessRequest } from '@/lib/access-requests-api'
import { productLabel, sourceLabel, statusLabel } from './AccessRequestsTable'

type Translate = (key: TranslationKey) => string

interface AccessRequestDetailPanelProps {
  request: AccessRequest | null
  onApprove: () => void
  onReject: () => void
  t: Translate
}

function formatDate(value?: string | null): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
      <p className="kpi-label">{label}</p>
      <p className="mt-2 text-sm text-soft-white">{value || '-'}</p>
    </div>
  )
}

export function AccessRequestDetailPanel({ request, onApprove, onReject, t }: AccessRequestDetailPanelProps) {
  if (!request) {
    return (
      <section className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5">
        <div className="flex items-start gap-3">
          <ClipboardList className="mt-1 h-5 w-5 text-blue-light" />
          <div>
            <h2 className="section-title">{t('accessRequestsDetailTitle')}</h2>
            <p className="section-subtitle mt-1">{t('accessRequestsSelectPrompt')}</p>
          </div>
        </div>
      </section>
    )
  }

  const isPending = request.status === 'pending'

  return (
    <section className="surface-primary surface-copy-safe rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kpi-label">{t('accessRequestsDetailTitle')}</p>
          <h2 className="section-title mt-2">{request.full_name}</h2>
          <p className="section-subtitle mt-1">{request.email}</p>
        </div>
        {isPending ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onApprove} className="btn-action h-10 px-4">
              <CheckCircle2 className="h-4 w-4" />
              {t('accessRequestsApprove')}
            </button>
            <button type="button" onClick={onReject} className="btn-create h-10 px-4 text-rose-200 border-rose-400/35">
              <XCircle className="h-4 w-4" />
              {t('accessRequestsReject')}
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label={t('accessRequestsColumnProduct')} value={productLabel(request.product)} />
        <Field label={t('accessRequestsColumnStatus')} value={statusLabel(request.status, t)} />
        <Field label={t('accessRequestsColumnSource')} value={sourceLabel(request.source, t)} />
        <Field label={t('accessRequestsLanguage')} value={request.submission_language} />
        <Field label={t('accessRequestsCompany')} value={request.company || request.profile_type} />
        <Field label={t('accessRequestsPhone')} value={request.phone} />
        <Field label={t('accessRequestsCaptchaVerified')} value={request.captcha_verified ? t('accessRequestsYes') : t('accessRequestsNo')} />
        <Field label={t('accessRequestsCreatedAt')} value={formatDate(request.created_at)} />
      </div>

      <div className="mt-5 grid gap-3">
        <Field label={t('accessRequestsServiceCategory')} value={request.service_category} />
        <Field label={t('accessRequestsServiceSummary')} value={request.service_summary} />
        <Field label={t('accessRequestsIntendedUse')} value={request.intended_use} />
        <Field label={t('accessRequestsRequestedScope')} value={request.requested_scope} />
        <Field label={t('accessRequestsMessage')} value={request.message} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label={t('accessRequestsReviewedAt')} value={formatDate(request.reviewed_at)} />
        <Field label={t('accessRequestsReviewedBy')} value={request.reviewed_by} />
        <Field label={t('accessRequestsAdminNotes')} value={request.admin_notes} />
        <Field label={t('accessRequestsRejectionReason')} value={request.rejection_reason} />
      </div>

      {request.decision_email?.status ? (
        <div className="mt-5 rounded-xl border border-blue-light/25 bg-blue-light/10 p-3 text-sm text-blue-light">
          {t('accessRequestsEmailStatus')}: {request.decision_email.status}
        </div>
      ) : null}
    </section>
  )
}
