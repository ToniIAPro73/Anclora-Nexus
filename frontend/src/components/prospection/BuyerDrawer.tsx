'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Mail, MessageCircle, RefreshCw, Sparkles, X } from 'lucide-react'
import {
  confirmBuyerSupervisedSend,
  generateBuyerOutreach,
  getBuyerWorkbench,
  sendBuyerSupervised,
  type BuyerSupervisedSendPayload,
  type BuyerWorkbenchPayload,
} from '@/lib/prospection-api'
import { useI18n } from '@/lib/i18n'

interface BuyerDrawerProps {
  buyerId: string | null
  open: boolean
  onClose: () => void
}

export function BuyerDrawer({ buyerId, open, onClose }: BuyerDrawerProps) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [dispatchingChannel, setDispatchingChannel] = useState<'email' | 'whatsapp' | null>(null)
  const [pendingSend, setPendingSend] = useState<Partial<Record<'email' | 'whatsapp', BuyerSupervisedSendPayload>>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [workbench, setWorkbench] = useState<BuyerWorkbenchPayload | null>(null)

  const loadWorkbench = useCallback(async () => {
    if (!buyerId) return
    setLoading(true)
    setError(null)
    try {
      const payload = await getBuyerWorkbench(buyerId, 30)
      setWorkbench(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading buyer workbench')
    } finally {
      setLoading(false)
    }
  }, [buyerId])

  useEffect(() => {
    if (open && buyerId) {
      void loadWorkbench()
    }
  }, [open, buyerId, loadWorkbench])

  const generateOutreach = async () => {
    if (!buyerId) return
    setGenerating(true)
    setError(null)
    setSuccess(null)
    try {
      await generateBuyerOutreach(buyerId)
      await loadWorkbench()
      setSuccess(t('buyersOutreachGenerated'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('buyersOutreachGenerateError'))
    } finally {
      setGenerating(false)
    }
  }

  const launchSupervisedSend = async (channel: 'email' | 'whatsapp') => {
    if (!buyerId) return
    setDispatchingChannel(channel)
    setError(null)
    setSuccess(null)
    try {
      const payload = await sendBuyerSupervised(buyerId, channel)
      if (payload.status === 'ready_for_human_send' && payload.launch_url) {
        setPendingSend((prev) => ({ ...prev, [channel]: payload }))
        window.open(payload.launch_url, '_blank', 'noopener,noreferrer')
        setSuccess(channel === 'email' ? t('emailClientOpened') : t('whatsappOpened'))
      } else if (channel === 'email' && payload.status === 'sent_natively') {
        setSuccess(t('nativeEmailSent'))
      } else {
        setSuccess(t('supervisedSendReady'))
      }
      await loadWorkbench()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorPreparingSupervisedSend'))
    } finally {
      setDispatchingChannel(null)
    }
  }

  const confirmSend = async (channel: 'email' | 'whatsapp') => {
    const payload = pendingSend[channel]
    if (!buyerId || !payload?.interaction_id) return
    setDispatchingChannel(channel)
    setError(null)
    setSuccess(null)
    try {
      await confirmBuyerSupervisedSend(buyerId, payload.interaction_id)
      setPendingSend((prev) => ({ ...prev, [channel]: undefined }))
      await loadWorkbench()
      setSuccess(channel === 'email' ? t('emailSendConfirmed') : t('whatsappSendConfirmed'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorConfirmingSend'))
    } finally {
      setDispatchingChannel(null)
    }
  }

  const emailDraft = workbench?.latest_artifacts.email_draft
  const whatsappDraft = workbench?.latest_artifacts.whatsapp_draft
  const buyerBrief = workbench?.latest_artifacts.buyer_brief
  const buyer = workbench?.buyer
  const sourceTypeLabel = buyer ? t(`buyersSourceType_${buyer.source_type}` as never) : '—'
  const sourcePlatformLabel = buyer ? t(`buyersSourcePlatform_${buyer.source_platform}` as never) : '—'

  const emailSubject = useMemo(
    () => String((emailDraft?.metadata?.subject as string | undefined) || ''),
    [emailDraft],
  )

  if (!open || !buyerId) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="h-full w-full max-w-3xl overflow-y-auto border-l border-soft-subtle/40 bg-navy-darker/95 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-soft-muted">{t('buyersWorkbenchTitle')}</p>
            <h2 className="page-title mt-1">{buyer?.full_name || buyer?.email || 'Buyer'}</h2>
            <p className="page-subtitle mt-1">{workbench?.console.next_action || t('buyersWorkbenchSubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-soft-subtle/40 p-2 text-soft-white hover:border-gold/40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? <div className="surface-secondary mb-4 rounded-xl border border-red-400/30 bg-red-500/5 p-3 text-sm text-red-200">{error}</div> : null}
        {success ? <div className="surface-secondary mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-3 text-sm text-emerald-200">{success}</div> : null}

        <div className="grid grid-cols-1 gap-4">
          <section className="surface-primary rounded-2xl border border-soft-subtle/20 bg-navy-surface/35 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="section-title">{t('buyersWorkbenchConsole')}</h3>
                <p className="section-subtitle">{workbench?.console.readiness || '—'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void loadWorkbench()} className="btn-secondary !h-9 !px-3">
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  {t('refresh')}
                </button>
                <button type="button" onClick={generateOutreach} className="btn-action !h-9 !px-3" disabled={generating}>
                  <Sparkles className="h-4 w-4" />
                  {generating ? t('loading') : t('buyersGenerateOutreach')}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="surface-secondary rounded-xl border border-soft-subtle/20 bg-navy-deep/20 p-3">
                <p className="kpi-label">{t('recommendedChannel')}</p>
                <p className="kpi-value text-gold">{workbench?.console.recommended_channel || '—'}</p>
              </div>
              <div className="surface-secondary rounded-xl border border-soft-subtle/20 bg-navy-deep/20 p-3">
                <p className="kpi-label">{t('buyersTopMatches')}</p>
                <p className="kpi-value text-gold">{workbench?.snapshot.matches_count ?? 0}</p>
              </div>
              <div className="surface-secondary rounded-xl border border-soft-subtle/20 bg-navy-deep/20 p-3">
                <p className="kpi-label">{t('buyersMemoryHighlights')}</p>
                <p className="kpi-value text-gold">{workbench?.snapshot.semantic_memory_count ?? 0}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="surface-secondary rounded-xl border border-soft-subtle/20 bg-navy-deep/20 p-3">
                <p className="kpi-label">{t('buyersSourceOriginLabel')}</p>
                <p className="text-sm text-soft-white mt-1">{sourceTypeLabel}</p>
              </div>
              <div className="surface-secondary rounded-xl border border-soft-subtle/20 bg-navy-deep/20 p-3">
                <p className="kpi-label">{t('buyersSourceChannelLabel')}</p>
                <p className="text-sm text-soft-white mt-1">{sourcePlatformLabel}</p>
              </div>
            </div>

            {workbench?.console.reasons?.length ? (
              <div className="mt-4 surface-secondary rounded-xl border border-soft-subtle/20 bg-navy-deep/20 p-3 text-sm text-soft-white space-y-2">
                {workbench.console.reasons.map((reason) => (
                  <p key={reason}>{reason}</p>
                ))}
              </div>
            ) : null}
          </section>

          <section className="surface-primary rounded-2xl border border-soft-subtle/20 bg-navy-surface/35 p-4">
            <h3 className="section-title">{t('buyersOutreachDrafts')}</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="surface-secondary rounded-xl border border-soft-subtle/20 bg-navy-deep/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-soft-white">Email</p>
                  <button type="button" className="btn-action !h-8 !px-3" onClick={() => void launchSupervisedSend('email')} disabled={dispatchingChannel === 'email'}>
                    <Mail className="h-4 w-4" />
                    {t('buyersSendEmail')}
                  </button>
                </div>
                <p className="mt-2 text-xs text-soft-muted">{emailSubject || '—'}</p>
                <p className="mt-2 text-sm text-soft-white whitespace-pre-wrap break-words">{emailDraft?.contenido || 'Draft pendiente.'}</p>
                {pendingSend.email ? (
                  <button type="button" className="btn-secondary mt-3 !h-8 !px-3" onClick={() => void confirmSend('email')}>
                    {t('buyersConfirmSend')}
                  </button>
                ) : null}
              </div>

              <div className="surface-secondary rounded-xl border border-soft-subtle/20 bg-navy-deep/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-soft-white">WhatsApp</p>
                  <button type="button" className="btn-action !h-8 !px-3" onClick={() => void launchSupervisedSend('whatsapp')} disabled={dispatchingChannel === 'whatsapp'}>
                    <MessageCircle className="h-4 w-4" />
                    {t('buyersSendWhatsapp')}
                  </button>
                </div>
                <p className="mt-2 text-sm text-soft-white whitespace-pre-wrap break-words">{whatsappDraft?.contenido || 'Draft pendiente.'}</p>
                {pendingSend.whatsapp ? (
                  <button type="button" className="btn-secondary mt-3 !h-8 !px-3" onClick={() => void confirmSend('whatsapp')}>
                    {t('buyersConfirmSend')}
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <section className="surface-primary rounded-2xl border border-soft-subtle/20 bg-navy-surface/35 p-4">
            <h3 className="section-title">{t('buyersBrief')}</h3>
            <div className="mt-3 surface-secondary rounded-xl border border-soft-subtle/20 bg-navy-deep/20 p-3">
              <p className="text-sm text-soft-white whitespace-pre-wrap break-words">{buyerBrief?.contenido || 'Brief pendiente.'}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
