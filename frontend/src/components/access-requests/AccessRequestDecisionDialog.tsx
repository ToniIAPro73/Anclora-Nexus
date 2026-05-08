'use client'

import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import type { TranslationKey } from '@/lib/i18n'
import type { AccessRequest } from '@/lib/access-requests-api'
import { productLabel } from './AccessRequestsTable'

type Translate = (key: TranslationKey) => string

interface AccessRequestDecisionDialogProps {
  request: AccessRequest | null
  mode: 'approve' | 'reject' | null
  adminNotes: string
  rejectionReason: string
  submitting: boolean
  error: string | null
  onAdminNotesChange: (value: string) => void
  onRejectionReasonChange: (value: string) => void
  onClose: () => void
  onSubmit: () => void
  t: Translate
}

export function AccessRequestDecisionDialog({
  request,
  mode,
  adminNotes,
  rejectionReason,
  submitting,
  error,
  onAdminNotesChange,
  onRejectionReasonChange,
  onClose,
  onSubmit,
  t,
}: AccessRequestDecisionDialogProps) {
  if (!request || !mode) return null

  const isReject = mode === 'reject'
  const title = isReject ? t('accessRequestsRejectTitle') : t('accessRequestsApproveTitle')
  const disabled = submitting || (isReject && !rejectionReason.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-darker/80 p-4 backdrop-blur-sm">
      <section className="surface-primary surface-copy-safe w-full max-w-2xl rounded-2xl border border-soft-subtle bg-navy-surface p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="kpi-label">{productLabel(request.product)}</p>
            <h2 className="section-title mt-2">{title}</h2>
            <p className="section-subtitle mt-1">
              {request.full_name} · {request.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-soft-subtle/70 bg-navy-deep/60 p-2 text-soft-muted transition hover:border-blue-light/40 hover:text-soft-white"
            aria-label={t('closeLabel')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-gold/20 bg-gold/10 p-3 text-sm text-gold">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{isReject ? t('accessRequestsRejectConfirmCopy') : t('accessRequestsApproveConfirmCopy')}</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {isReject ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-soft-white">{t('accessRequestsRejectionReason')}</span>
              <textarea
                className="ui-textarea"
                value={rejectionReason}
                onChange={(event) => onRejectionReasonChange(event.target.value)}
                placeholder={t('accessRequestsRejectionPlaceholder')}
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-soft-white">{t('accessRequestsAdminNotes')}</span>
            <textarea
              className="ui-textarea"
              value={adminNotes}
              onChange={(event) => onAdminNotesChange(event.target.value)}
              placeholder={t('accessRequestsAdminNotesPlaceholder')}
            />
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-navy-surface/50 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-create h-10 px-4" disabled={submitting}>
            {t('accessRequestsCancel')}
          </button>
          <button type="button" onClick={onSubmit} className="btn-action h-10 px-4" disabled={disabled}>
            <CheckCircle2 className="h-4 w-4" />
            {submitting ? t('accessRequestsSubmitting') : isReject ? t('accessRequestsReject') : t('accessRequestsApprove')}
          </button>
        </div>
      </section>
    </div>
  )
}
