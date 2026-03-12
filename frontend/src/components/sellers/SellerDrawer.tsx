'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Clipboard,
  Download,
  Mail,
  MessageCircle,
  Phone,
  Save,
  Share2,
  Sparkles,
  StickyNote,
  X,
} from 'lucide-react'
import jsPDF from 'jspdf'
import { useI18n } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { authFetch } from '@/lib/auth-fetch'

interface Interaction {
  id: string
  tipo: string
  estado: string
  contenido: string
  resultado?: string
  metadata?: Record<string, unknown>
  created_at: string
}

interface WorkbenchPayload {
  seller: {
    id: string
    nombre_propietario?: string
    email_contacto?: string
    telefono_contacto?: string
    whatsapp_contacto?: string
    zona?: string
    fuente?: string
    prioridad?: number
    estado_contacto?: string
    argumentario?: string
  }
  interactions: Interaction[]
  latest_artifacts: {
    dossier?: Interaction | null
    email_draft?: Interaction | null
    whatsapp_draft?: Interaction | null
    call_brief?: Interaction | null
    context_brief?: Interaction | null
  }
  memory: {
    version: string
    seller_id: string
    status: string
    query: string
    total_records: number
    vector_ready_records?: number
    retrieval_mode?: string
    retrieval_summary: string
    matches: Array<{
      score: number
      matched_keywords: string[]
      reasons: Array<{ type: string; value: string }>
      record: {
        id: string
        memory_kind: string
        source_type: string
        source_artifact?: string | null
        summary: string
        redacted_content: string
        source_created_at: string
      }
    }>
  }
  console: {
    readiness: string
    recommended_channel: string
    next_action: string
    reasons: string[]
    last_touch_at?: string | null
    memory_focus_terms: string[]
    memory_highlights: Array<{ summary: string; score: number }>
  }
  snapshot: {
    has_argumentario: boolean
    has_email_draft: boolean
    has_whatsapp_draft: boolean
    has_call_brief: boolean
    has_context_brief: boolean
    interactions_count: number
    semantic_memory_count: number
    semantic_memory_ready: boolean
    recommended_channel: string
    readiness: string
    email_native_available?: boolean
    latest_email_delivery?: Interaction | null
    latest_whatsapp_delivery?: Interaction | null
  }
}

interface DossierExportPayload {
  seller: Record<string, unknown>
  generated_at: string
  file_name: string
  sections: {
    context_brief: string
    call_brief: string
    dossier: string
    email_subject: string
    email_body: string
    whatsapp_body: string
  }
  share_summary: string
}

interface SellerDrawerProps {
  sellerId: string | null
  sellerName?: string
  open: boolean
  onClose: () => void
}

interface SupervisedSendPayload {
  channel: 'email' | 'whatsapp'
  seller_id: string
  interaction_id: string
  target: string
  subject?: string
  body: string
  launch_url: string | null
  status: string
  transport?: string
  delivery?: {
    provider?: string
    message_id?: string
    from_email?: string
    reply_to?: string
  } | null
}

type InteractionType = 'llamada' | 'email' | 'whatsapp' | 'reunion' | 'nota'

const TYPE_OPTIONS: InteractionType[] = ['llamada', 'email', 'whatsapp', 'reunion', 'nota']
const STATE_OPTIONS = ['realizado', 'programado', 'borrador']

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function getTypeIcon(tipo: string) {
  switch (tipo) {
    case 'email':
    case 'email_draft':
      return Mail
    case 'whatsapp':
      return MessageCircle
    case 'llamada':
      return Phone
    default:
      return StickyNote
  }
}

function getTypeLabel(tipo: string, artifact: string | undefined, t: (key: TranslationKey) => string) {
  if (artifact === 'call_brief') return t('callBrief')
  if (artifact === 'context_brief') return t('contextBrief')
  if (artifact === 'whatsapp_draft') return 'WhatsApp'
  if (tipo === 'email_draft') return t('emailDraft')
  if (tipo === 'dossier') return t('dossierSection')
  return t(`interactionType_${tipo}` as never)
}

function formatConsoleLabel(value?: string) {
  if (!value) return '—'
  return value.replace(/_/g, ' ')
}

export function SellerDrawer({ sellerId, sellerName, open, onClose }: SellerDrawerProps) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [savingInteraction, setSavingInteraction] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [workbench, setWorkbench] = useState<WorkbenchPayload | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [formType, setFormType] = useState<InteractionType>('llamada')
  const [formState, setFormState] = useState('realizado')
  const [formResult, setFormResult] = useState('')
  const [formContent, setFormContent] = useState('')
  const [emailContacto, setEmailContacto] = useState('')
  const [telefonoContacto, setTelefonoContacto] = useState('')
  const [whatsappContacto, setWhatsappContacto] = useState('')
  const [savingContact, setSavingContact] = useState(false)
  const [dispatchingChannel, setDispatchingChannel] = useState<'email' | 'whatsapp' | null>(null)
  const [pendingSend, setPendingSend] = useState<Partial<Record<'email' | 'whatsapp', SupervisedSendPayload>>>({})
  const [memoryQuery, setMemoryQuery] = useState('seguimiento captacion objeciones siguiente paso')
  const [loadingMemory, setLoadingMemory] = useState(false)

  const loadWorkbench = useCallback(async () => {
    if (!sellerId) return
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch(`/api/sellers/${sellerId}/workbench?interaction_limit=30`)
      if (!res.ok) throw new Error(`${t('error')} ${res.status}`)
      const data = (await res.json()) as WorkbenchPayload
      setWorkbench(data)
      setMemoryQuery(data.memory?.query || 'seguimiento captacion objeciones siguiente paso')
      setEmailContacto(data.seller.email_contacto || '')
      setTelefonoContacto(data.seller.telefono_contacto || '')
      setWhatsappContacto(data.seller.whatsapp_contacto || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorLoadingInteractions'))
    } finally {
      setLoading(false)
    }
  }, [sellerId, t])

  useEffect(() => {
    if (open && sellerId) {
      void loadWorkbench()
    }
  }, [open, sellerId, loadWorkbench])

  const refreshMemory = async () => {
    if (!sellerId) return
    setLoadingMemory(true)
    setError(null)
    try {
      const res = await authFetch(`/api/sellers/${sellerId}/memory?query=${encodeURIComponent(memoryQuery)}&limit=5`)
      if (!res.ok) {
        throw new Error(await res.text())
      }
      const payload = await res.json()
      setWorkbench((current) => current ? {
        ...current,
        memory: payload,
        snapshot: {
          ...current.snapshot,
          semantic_memory_count: payload.total_records,
          semantic_memory_ready: payload.status === 'ready',
        },
      } : current)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorLoadingInteractions'))
    } finally {
      setLoadingMemory(false)
    }
  }

  const rebuildMemory = async () => {
    if (!sellerId) return
    setLoadingMemory(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await authFetch(`/api/sellers/${sellerId}/memory/rebuild`, {
        method: 'POST',
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      await refreshMemory()
      setSuccess(t('sellerMemoryRebuilt'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorRebuildingSellerMemory'))
    } finally {
      setLoadingMemory(false)
    }
  }

  const generateWorkbench = async () => {
    if (!sellerId) return
    setGenerating(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await authFetch(`/api/sellers/${sellerId}/generate-dossier`, {
        method: 'POST',
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Error ${res.status}`)
      }
      await loadWorkbench()
      setSuccess(t('dossierGenerated'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneratingDossier'))
    } finally {
      setGenerating(false)
    }
  }

  const saveInteraction = async () => {
    if (!sellerId || !formContent.trim()) return
    setSavingInteraction(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await authFetch(`/api/sellers/${sellerId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: formType,
          estado: formState,
          resultado: formResult.trim() || null,
          contenido: formContent.trim(),
        }),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Error ${res.status}`)
      }
      setFormResult('')
      setFormContent('')
      await loadWorkbench()
      setSuccess(t('interactionSaved'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorSavingInteraction'))
    } finally {
      setSavingInteraction(false)
    }
  }

  const saveContactChannels = async () => {
    if (!sellerId) return
    setSavingContact(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await authFetch(`/api/sellers/${sellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_contacto: emailContacto || null,
          telefono_contacto: telefonoContacto || null,
          whatsapp_contacto: whatsappContacto || null,
        }),
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      await loadWorkbench()
      setSuccess(t('contactChannelsSaved'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorSavingContactChannels'))
    } finally {
      setSavingContact(false)
    }
  }

  const copyText = async (value?: string) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setSuccess(t('copiedToClipboard'))
  }

  const fetchExportPayload = async (): Promise<DossierExportPayload> => {
    if (!sellerId) {
      throw new Error('Missing sellerId')
    }
    const res = await authFetch(`/api/sellers/${sellerId}/dossier-export`)
    if (!res.ok) {
      throw new Error(`Export ${res.status}`)
    }
    return res.json()
  }

  const exportPdf = async () => {
    setExportingPdf(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = await fetchExportPayload()
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const seller = payload.seller
      const sections = payload.sections
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 16
      let y = 20

      const ensureSpace = (required = 12) => {
        if (y + required > pageHeight - margin) {
          pdf.addPage()
          y = 20
        }
      }

      const writeSection = (title: string, content?: string) => {
        if (!content) return
        ensureSpace(20)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(13)
        pdf.text(title, margin, y)
        y += 7
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10)
        const lines = pdf.splitTextToSize(content, pageWidth - margin * 2)
        lines.forEach((line: string) => {
          ensureSpace(6)
          pdf.text(line, margin, y)
          y += 5
        })
        y += 4
      }

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(20)
      pdf.text(t('dossierSection'), margin, y)
      y += 10

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      const headerLines = [
        `${t('selectedSeller')}: ${String(seller.nombre_propietario || sellerName || '—')}`,
        `${t('zone')}: ${String(seller.zona || '—')}`,
        `${t('priority')}: P${String(seller.prioridad || '—')}`,
        `${t('status')}: ${String(seller.estado_contacto || '—')}`,
        `${t('generatedAt')}: ${new Date(payload.generated_at).toLocaleString()}`,
      ]
      headerLines.forEach((line) => {
        pdf.text(line, margin, y)
        y += 6
      })
      y += 4

      writeSection(t('contextBrief'), sections.context_brief)
      writeSection(t('callBrief'), sections.call_brief)
      writeSection(t('dossierSection'), sections.dossier)
      writeSection(`${t('emailDraft')} · ${t('subject')}`, sections.email_subject)
      writeSection(`${t('emailDraft')} · ${t('body')}`, sections.email_body)
      writeSection('WhatsApp', sections.whatsapp_body)

      pdf.save(payload.file_name || 'dossier-seller.pdf')
      setSuccess(t('pdfExported'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorExportingPdf'))
    } finally {
      setExportingPdf(false)
    }
  }

  const shareDossier = async () => {
    setSharing(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = await fetchExportPayload()
      if (navigator.share) {
        await navigator.share({
          title: `${t('dossierSection')} · ${String(payload.seller.nombre_propietario || sellerName || '')}`,
          text: payload.share_summary,
        })
      } else {
        await navigator.clipboard.writeText(payload.share_summary)
      }
      setSuccess(t('shareReady'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorSharingDossier'))
    } finally {
      setSharing(false)
    }
  }

  const launchSupervisedSend = async (channel: 'email' | 'whatsapp', transport: 'auto' | 'mailto' | 'native_email' = 'auto') => {
    if (!sellerId) return
    setDispatchingChannel(channel)
    setError(null)
    setSuccess(null)
    try {
      const res = await authFetch(`/api/sellers/${sellerId}/send-supervised/${channel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transport }),
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      const payload = (await res.json()) as SupervisedSendPayload
      if (payload.status === 'ready_for_human_send' && payload.launch_url) {
        setPendingSend((prev) => ({ ...prev, [channel]: payload }))
        window.open(payload.launch_url, '_blank', 'noopener,noreferrer')
        setSuccess(channel === 'email' ? t('emailClientOpened') : t('whatsappOpened'))
      } else if (channel === 'email' && payload.status === 'sent_natively') {
        setPendingSend((prev) => ({ ...prev, email: undefined }))
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
    if (!sellerId || !payload?.interaction_id) return
    setDispatchingChannel(channel)
    setError(null)
    setSuccess(null)
    try {
      const res = await authFetch(`/api/sellers/${sellerId}/interactions/${payload.interaction_id}/confirm-send`, {
        method: 'POST',
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
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
  const callBrief = workbench?.latest_artifacts.call_brief
  const contextBrief = workbench?.latest_artifacts.context_brief
  const dossier = workbench?.latest_artifacts.dossier
  const latestEmailDelivery = workbench?.snapshot?.latest_email_delivery

  const emailSubject = String(emailDraft?.metadata?.subject || '')
  const emailBody = emailDraft?.contenido || ''
  const whatsappBody = whatsappDraft?.contenido || ''

  const emailHref = useMemo(() => {
    if (!emailBody) return '#'
    return `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
  }, [emailSubject, emailBody])

  const whatsappHref = useMemo(() => {
    if (!whatsappBody) return '#'
    return `https://wa.me/?text=${encodeURIComponent(whatsappBody)}`
  }, [whatsappBody])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="h-full w-full max-w-3xl overflow-y-auto border-l border-soft-subtle/40 bg-navy-darker/95 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-soft-white">{t('sellerRecordTitle')}</h2>
            <p className="text-sm text-soft-muted">{sellerName || t('selectedSeller')}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-soft-subtle/70 bg-navy-surface/40 p-2 text-soft-white hover:border-gold/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {(error || success) && (
          <div className="mb-4 space-y-2">
            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                {success}
              </div>
            )}
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-gold/20 bg-gradient-to-br from-navy-deep/80 via-navy-surface/45 to-navy-deep/70 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-soft-white">{t('gravityClawWorkbench')}</h3>
              <p className="max-w-xl text-sm text-soft-muted">{t('gravityClawWorkbenchHint')}</p>
              {workbench?.snapshot && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full border border-soft-subtle/40 bg-navy-surface/40 px-3 py-1 text-xs text-soft-muted">
                    {t('interactions')}: {workbench.snapshot.interactions_count}
                  </span>
                  <span className="rounded-full border border-soft-subtle/40 bg-navy-surface/40 px-3 py-1 text-xs text-soft-muted">
                    {t('status')}: {workbench.seller.estado_contacto || '—'}
                  </span>
                  <span className="rounded-full border border-soft-subtle/40 bg-navy-surface/40 px-3 py-1 text-xs text-soft-muted">
                    {t('priority')}: P{workbench.seller.prioridad ?? 0}
                  </span>
                  <span className="rounded-full border border-soft-subtle/40 bg-navy-surface/40 px-3 py-1 text-xs text-soft-muted">
                    {t('semanticMemory')}: {workbench.snapshot.semantic_memory_count}
                  </span>
                  <span className="rounded-full border border-soft-subtle/40 bg-navy-surface/40 px-3 py-1 text-xs text-soft-muted">
                    {t('status')}: {formatConsoleLabel(workbench.snapshot.readiness)}
                  </span>
                </div>
              )}
            </div>
            <button onClick={generateWorkbench} disabled={generating || !sellerId} className="btn-action">
              <Sparkles className="h-4 w-4" />
              {generating ? t('generatingDossier') : t('generateWorkbench')}
            </button>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-soft-subtle/30 bg-navy-surface/30 p-5">
          <h3 className="mb-3 text-sm font-semibold text-soft-white">{t('supervisedChannels')}</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={emailContacto}
              onChange={(e) => setEmailContacto(e.target.value)}
              placeholder={t('sellerEmailPlaceholder')}
              className="ui-input"
            />
            <input
              value={telefonoContacto}
              onChange={(e) => setTelefonoContacto(e.target.value)}
              placeholder={t('sellerPhonePlaceholder')}
              className="ui-input"
            />
            <input
              value={whatsappContacto}
              onChange={(e) => setWhatsappContacto(e.target.value)}
              placeholder={t('sellerWhatsAppPlaceholder')}
              className="ui-input"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={saveContactChannels}
              disabled={savingContact}
              className="rounded-lg border border-soft-subtle/40 bg-navy-surface/50 px-4 py-2 text-sm font-semibold text-soft-white hover:border-gold/40 transition-colors disabled:opacity-50"
            >
              <Save className="mr-2 inline h-4 w-4" />
              {savingContact ? t('savingContactChannels') : t('saveContactChannels')}
            </button>
          </div>
        </section>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5 md:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-soft-white">{t('workbenchConsole')}</h3>
                <p className="text-sm text-soft-white">{workbench?.console?.next_action || '—'}</p>
                <p className="text-xs text-soft-muted">
                  {t('recommendedChannel')}: {formatConsoleLabel(workbench?.console?.recommended_channel)}
                  {workbench?.console?.last_touch_at ? ` · ${t('generatedAt')}: ${formatDate(workbench.console.last_touch_at)}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(workbench?.console?.memory_focus_terms || []).map((term) => (
                  <span key={term} className="rounded-full border border-gold/20 bg-gold/10 px-2 py-1 text-[11px] text-gold">
                    {term}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-soft-subtle/30 bg-navy-surface/35 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">{t('recommendedChannel')}</p>
                <p className="mt-2 text-lg font-semibold text-soft-white">{formatConsoleLabel(workbench?.console?.recommended_channel)}</p>
              </div>
              <div className="rounded-xl border border-soft-subtle/30 bg-navy-surface/35 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">{t('nextStep')}</p>
                <p className="mt-2 text-lg font-semibold text-soft-white">{workbench?.console?.next_action || '—'}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {(workbench?.console?.reasons || []).map((reason, index) => (
                <p key={`${reason}-${index}`} className="text-sm text-soft-muted">
                  {reason}
                </p>
              ))}
            </div>
            {(workbench?.console?.memory_highlights || []).length > 0 && (
              <div className="mt-4 space-y-2">
                {(workbench?.console?.memory_highlights || []).map((item, index) => (
                  <div key={`${item.summary}-${index}`} className="rounded-xl border border-soft-subtle/30 bg-navy-deep/30 p-3">
                    <p className="text-sm text-soft-white">{item.summary}</p>
                    <p className="mt-1 text-[11px] text-soft-muted">Score: {item.score}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-soft-subtle/30 bg-navy-surface/35 p-5 md:col-span-2">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-soft-white">{t('semanticMemory')}</h3>
                <p className="mt-1 text-xs text-soft-muted">
                  {workbench?.memory?.retrieval_summary || t('sellerMemoryEmpty')}
                </p>
                <p className="mt-1 text-[11px] text-soft-muted">
                  {t('status')}: {workbench?.memory?.retrieval_mode || 'lexical'} · vectors: {workbench?.memory?.vector_ready_records || 0}
                </p>
              </div>
              <button
                type="button"
                onClick={rebuildMemory}
                disabled={loadingMemory}
                className="rounded-lg border border-soft-subtle/40 bg-navy-surface/50 px-3 py-2 text-xs text-soft-white hover:border-gold/40 transition-colors disabled:opacity-50"
              >
                {loadingMemory ? t('loading') : t('rebuildSellerMemory')}
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  value={memoryQuery}
                  onChange={(e) => setMemoryQuery(e.target.value)}
                  placeholder={t('sellerMemoryQueryPlaceholder')}
                  className="ui-input flex-1"
                />
                <button
                  type="button"
                  onClick={refreshMemory}
                  disabled={loadingMemory || !memoryQuery.trim()}
                  className="rounded-lg border border-gold/40 bg-gold px-4 py-2 text-sm font-semibold text-navy-deep transition-opacity disabled:opacity-50"
                >
                  {t('searchSellerMemory')}
                </button>
              </div>
              {workbench?.memory?.status === 'migration_missing' ? (
                <p className="text-xs text-amber-200">{t('sellerMemoryMigrationMissing')}</p>
              ) : !workbench?.memory?.matches?.length ? (
                <p className="text-sm text-soft-muted">{t('sellerMemoryEmpty')}</p>
              ) : (
                <div className="space-y-3">
                  {workbench.memory.matches.map((match) => (
                    <div key={match.record.id} className="rounded-xl border border-soft-subtle/30 bg-navy-deep/30 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-soft-white">{match.record.summary}</p>
                          <p className="mt-1 text-xs text-soft-muted">
                            {(match.record.source_artifact || match.record.source_type)} · {formatDate(match.record.source_created_at)}
                          </p>
                        </div>
                        <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-1 text-[11px] text-gold">
                          Score: {match.score}
                        </span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm text-soft-white">{match.record.redacted_content}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {match.matched_keywords.map((keyword) => (
                          <span key={keyword} className="rounded-full border border-blue-light/30 bg-blue-light/10 px-2 py-1 text-[11px] text-blue-light">
                            {keyword}
                          </span>
                        ))}
                        {match.reasons.map((reason, index) => (
                          <span
                            key={`${reason.type}-${index}`}
                            className="rounded-full border border-soft-subtle/30 bg-navy-surface/40 px-2 py-1 text-[11px] text-soft-muted"
                          >
                            {reason.type}: {reason.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ArtifactCard
            title={t('contextBrief')}
            icon={StickyNote}
            content={contextBrief?.contenido}
            meta={contextBrief?.created_at ? formatDate(contextBrief.created_at) : undefined}
            onCopy={() => copyText(contextBrief?.contenido)}
            copyLabel={t('copyBrief')}
          />
          <ArtifactCard
            title={t('callBrief')}
            icon={Phone}
            content={callBrief?.contenido}
            meta={callBrief?.created_at ? formatDate(callBrief.created_at) : undefined}
            onCopy={() => copyText(callBrief?.contenido)}
            copyLabel={t('copyCallBrief')}
          />
          <ArtifactCard
            title={t('emailDraft')}
            icon={Mail}
            content={emailBody}
            subtitle={emailSubject ? `${t('subject')}: ${emailSubject}` : undefined}
            meta={[
              emailDraft?.created_at ? formatDate(emailDraft.created_at) : undefined,
              latestEmailDelivery?.resultado ? `${t('result')}: ${latestEmailDelivery.resultado}` : undefined,
            ].filter(Boolean).join(' · ') || undefined}
            onCopy={() => copyText(`${emailSubject}\n\n${emailBody}`.trim())}
            copyLabel={t('copyEmail')}
            actionHref={emailBody ? emailHref : undefined}
            actionLabel={t('openEmailClient')}
            primaryAction={() => launchSupervisedSend('email', workbench?.snapshot?.email_native_available ? 'native_email' : 'mailto')}
            primaryActionLabel={
              dispatchingChannel === 'email'
                ? t('preparingSend')
                : workbench?.snapshot?.email_native_available
                  ? t('sendNativeEmail')
                  : t('sendSupervisedEmail')
            }
            secondaryAction={pendingSend.email ? () => confirmSend('email') : undefined}
            secondaryActionLabel={pendingSend.email ? t('confirmEmailSent') : undefined}
          />
          <ArtifactCard
            title={t('whatsappDraft')}
            icon={MessageCircle}
            content={whatsappBody}
            meta={whatsappDraft?.created_at ? formatDate(whatsappDraft.created_at) : undefined}
            onCopy={() => copyText(whatsappBody)}
            copyLabel={t('copyWhatsApp')}
            actionHref={whatsappBody ? whatsappHref : undefined}
            actionLabel={t('openWhatsApp')}
            primaryAction={() => launchSupervisedSend('whatsapp', 'auto')}
            primaryActionLabel={dispatchingChannel === 'whatsapp' ? t('preparingSend') : t('sendSupervisedWhatsApp')}
            secondaryAction={pendingSend.whatsapp ? () => confirmSend('whatsapp') : undefined}
            secondaryActionLabel={pendingSend.whatsapp ? t('confirmWhatsAppSent') : undefined}
          />
        </div>

        <section className="mb-6 rounded-2xl border border-blue-light/20 bg-navy-surface/35 p-5">
          <div className="mb-3 flex items-center gap-2 text-blue-light">
            <StickyNote className="h-4 w-4" />
            <h3 className="text-sm font-semibold">{t('dossierSection')}</h3>
          </div>
          {dossier?.contenido ? (
            <>
              <pre className="whitespace-pre-wrap text-sm text-soft-white">{dossier.contenido}</pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyText(dossier.contenido)}
                  className="rounded-lg border border-soft-subtle/40 bg-navy-surface/50 px-3 py-2 text-xs text-soft-white hover:border-gold/40 transition-colors"
                >
                  <Clipboard className="mr-1 inline h-3.5 w-3.5" />
                  {t('copyDossier')}
                </button>
                <button
                  type="button"
                  onClick={exportPdf}
                  disabled={exportingPdf}
                  className="rounded-lg border border-soft-subtle/40 bg-navy-surface/50 px-3 py-2 text-xs text-soft-white hover:border-gold/40 transition-colors disabled:opacity-50"
                >
                  <Download className="mr-1 inline h-3.5 w-3.5" />
                  {exportingPdf ? t('exportingPdf') : t('exportPdf')}
                </button>
                <button
                  type="button"
                  onClick={shareDossier}
                  disabled={sharing}
                  className="rounded-lg border border-soft-subtle/40 bg-navy-surface/50 px-3 py-2 text-xs text-soft-white hover:border-gold/40 transition-colors disabled:opacity-50"
                >
                  <Share2 className="mr-1 inline h-3.5 w-3.5" />
                  {sharing ? t('sharing') : t('shareDossier')}
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-soft-muted">{t('noDossierGenerated')}</p>
          )}
        </section>

        <section className="mb-6 rounded-2xl border border-soft-subtle/30 bg-navy-surface/30 p-5">
          <h3 className="mb-3 text-sm font-semibold text-soft-white">{t('logInteraction')}</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as InteractionType)}
              className="ui-select"
            >
              {TYPE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {t(`interactionType_${value}` as never)}
                </option>
              ))}
            </select>
            <select
              value={formState}
              onChange={(e) => setFormState(e.target.value)}
              className="ui-select"
            >
              {STATE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {t(`interactionState_${value}` as never)}
                </option>
              ))}
            </select>
            <input
              value={formResult}
              onChange={(e) => setFormResult(e.target.value)}
              placeholder={t('interactionResultPlaceholder')}
              className="ui-input"
            />
          </div>
          <textarea
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            placeholder={t('interactionContentPlaceholder')}
            rows={5}
            className="ui-textarea mt-3"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={saveInteraction}
              disabled={savingInteraction || !formContent.trim()}
              className="rounded-lg border border-gold/40 bg-gold px-4 py-2 text-sm font-semibold text-navy-deep transition-opacity disabled:opacity-50"
            >
              <Save className="mr-2 inline h-4 w-4" />
              {savingInteraction ? t('savingInteraction') : t('saveInteraction')}
            </button>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-soft-white">{t('interactionHistory')}</h3>
          {loading ? (
            <p className="text-sm text-soft-muted">{t('loading')}</p>
          ) : !workbench?.interactions?.length ? (
            <p className="text-sm text-soft-muted">{t('noInteractionsYet')}</p>
          ) : (
            <div className="space-y-3">
              {workbench.interactions.map((item) => {
                const artifact = String(item.metadata?.artifact || '')
                const Icon = getTypeIcon(item.tipo)
                return (
                  <div key={item.id} className="rounded-xl border border-soft-subtle/30 bg-navy-surface/30 p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gold" />
                        <span className="text-xs text-gold">{getTypeLabel(item.tipo, artifact, t)}</span>
                        <span className="rounded-full border border-soft-subtle/30 bg-navy-surface/50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-soft-muted">
                          {t(`interactionState_${item.estado}` as never)}
                        </span>
                      </div>
                      <span className="text-[11px] text-soft-muted">{formatDate(item.created_at)}</span>
                    </div>
                    {!!item.resultado && (
                      <p className="mb-2 text-xs text-blue-light">
                        {t('result')}: {item.resultado}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap text-sm text-soft-white">{item.contenido}</p>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ArtifactCard({
  title,
  icon: Icon,
  content,
  subtitle,
  meta,
  onCopy,
  copyLabel,
  actionHref,
  actionLabel,
  primaryAction,
  primaryActionLabel,
  secondaryAction,
  secondaryActionLabel,
}: {
  title: string
  icon: typeof Mail
  content?: string
  subtitle?: string
  meta?: string
  onCopy: () => void
  copyLabel: string
  actionHref?: string
  actionLabel?: string
  primaryAction?: () => void
  primaryActionLabel?: string
  secondaryAction?: () => void
  secondaryActionLabel?: string
}) {
  return (
    <div className="rounded-2xl border border-soft-subtle/30 bg-navy-surface/35 p-5">
      <div className="mb-3 flex items-center gap-2 text-soft-white">
        <Icon className="h-4 w-4 text-gold" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {subtitle && <p className="mb-2 text-xs text-soft-muted">{subtitle}</p>}
      {meta && <p className="mb-2 text-[11px] text-soft-muted">{meta}</p>}
      {content ? (
        <>
          <pre className="whitespace-pre-wrap text-sm text-soft-white">{content}</pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="rounded-lg border border-soft-subtle/40 bg-navy-surface/50 px-3 py-2 text-xs text-soft-white hover:border-gold/40 transition-colors"
            >
              <Clipboard className="mr-1 inline h-3.5 w-3.5" />
              {copyLabel}
            </button>
            {actionHref && actionLabel && (
              <a
                href={actionHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-blue-light/30 bg-blue-light/10 px-3 py-2 text-xs text-blue-light hover:border-blue-light/50 transition-colors"
              >
                {actionLabel}
              </a>
            )}
            {primaryAction && primaryActionLabel && (
              <button
                type="button"
                onClick={primaryAction}
                className="rounded-lg border border-gold/40 bg-gold px-3 py-2 text-xs font-semibold text-navy-deep transition-colors"
              >
                {primaryActionLabel}
              </button>
            )}
            {secondaryAction && secondaryActionLabel && (
              <button
                type="button"
                onClick={secondaryAction}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition-colors"
              >
                {secondaryActionLabel}
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-soft-muted">—</p>
      )}
    </div>
  )
}
