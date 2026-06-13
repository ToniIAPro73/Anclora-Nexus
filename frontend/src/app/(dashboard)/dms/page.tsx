'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FilePlus2,
  FolderOpen,
  RefreshCw,
  Search,
  Send,
  UserPlus,
  X,
} from 'lucide-react'

import {
  createDealFolder,
  createGeneratedSignatureFlow,
  createManualReviewDecision,
  createParty,
  generateDocument,
  listAvailableTemplates,
  listDealFolders,
  listGeneratedDocuments,
  listParties,
  triggerAutoReview,
  type DealFolder,
  type DocumentTemplate,
  type FolderParty,
  type GeneratedDocument,
  type OperationType,
  type PartyRole,
  type TemplateVersion,
} from '@/lib/dms-api'
import { useI18n } from '@/lib/i18n'
import { useStore, type Lead } from '@/lib/store'

type TemplateRow = DocumentTemplate & { latest_version?: TemplateVersion }
type Tab = 'parties' | 'templates' | 'documents'
type FilterType = OperationType | 'all'

function docStatusClass(status: string): string {
  if (status === 'approved') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  if (status === 'rejected') return 'border-red-500/30 bg-red-500/10 text-red-300'
  if (status === 'review_required') return 'border-amber-500/30 bg-amber-500/10 text-amber-200'
  if (status === 'signed') return 'border-blue-light/30 bg-blue-light/10 text-blue-light'
  return 'border-soft-subtle bg-navy-darker text-soft-muted'
}

const OPERATION_BADGE: Record<OperationType, string> = {
  compraventa: 'border-gold/30 bg-gold/10 text-gold',
  alquiler_temporada: 'border-blue-light/30 bg-blue-light/10 text-blue-light',
  alquiler_turistico: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-soft-muted">
      {label}
      {required ? (
        <span className="text-amber-400" title="Obligatori / Required">*</span>
      ) : (
        <span className="font-normal normal-case tracking-normal text-soft-muted/40">(opt)</span>
      )}
    </label>
  )
}

function LeadCombobox({
  leads,
  selectedLeadId,
  onSelect,
  disabled,
}: {
  leads: Lead[]
  selectedLeadId: string
  onSelect: (id: string) => void
  disabled?: boolean
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedLead = leads.find((l) => l.id === selectedLeadId)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return leads.slice(0, 20)
    return leads
      .filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.budget?.toLowerCase().includes(q),
      )
      .slice(0, 20)
  }, [leads, query])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      {selectedLead ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-blue-light/30 bg-blue-light/5 px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-soft-white">{selectedLead.name}</p>
            <p className="truncate text-xs text-soft-muted">{selectedLead.email || '—'} · {selectedLead.budget || '—'}</p>
          </div>
          {!disabled && (
            <button type="button" onClick={() => { onSelect(''); setQuery('') }} aria-label="Deseleccionar" className="shrink-0 text-soft-muted hover:text-soft-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft-muted/60" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder="Buscar por nombre, email o presupuesto..."
            disabled={disabled}
            className="w-full rounded-xl border border-soft-subtle bg-navy-darker py-2.5 pl-9 pr-3 text-sm text-soft-white placeholder:text-soft-muted/40 disabled:opacity-40 focus:border-blue-light/60 focus:outline-none"
          />
        </div>
      )}
      {open && !selectedLead && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-soft-subtle bg-navy-deep shadow-xl">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-soft-muted">Sin resultados</p>
          ) : (
            <ul className="max-h-56 overflow-y-auto py-1">
              {filtered.map((lead) => (
                <li key={lead.id}>
                  <button
                    type="button"
                    onClick={() => { onSelect(lead.id); setQuery(''); setOpen(false) }}
                    className="w-full px-4 py-2.5 text-left hover:bg-navy-surface/60"
                  >
                    <p className="text-sm font-semibold text-soft-white">{lead.name}</p>
                    <p className="text-xs text-soft-muted">
                      {lead.email || '—'} · {lead.budget || '—'} · <span className="capitalize">{lead.status}</span>
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function GhostBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex h-9 items-center gap-1.5 rounded-xl border border-soft-subtle px-3 text-xs text-soft-muted transition-all hover:border-blue-light/40 hover:text-soft-white"
    >
      {children}
    </a>
  )
}

export default function DmsPage() {
  const { t } = useI18n()
  const leads = useStore((state) => state.leads)
  const initialize = useStore((state) => state.initialize)

  useEffect(() => { void initialize() }, [initialize])

  const OPERATION_LABELS: Record<OperationType, string> = useMemo(() => ({
    compraventa: t('dmsOpCompraventa'),
    alquiler_temporada: t('dmsOpAlquilerTemporada'),
    alquiler_turistico: t('dmsOpAlquilerTuristico'),
  }), [t])

  const ROLE_LABELS: Record<PartyRole, string> = useMemo(() => ({
    buyer: t('dmsRoleBuyer'),
    seller: t('dmsRoleSeller'),
    agent: t('dmsRoleAgent'),
    guarantor: t('dmsRoleGuarantor'),
    co_buyer: t('dmsRoleCoBuyer'),
    co_seller: t('dmsRoleCoSeller'),
    notary: t('dmsRoleNotary'),
  }), [t])

  const ROLES_BY_OPERATION: Record<OperationType, PartyRole[]> = {
    compraventa: ['buyer', 'co_buyer', 'seller', 'co_seller', 'agent', 'guarantor', 'notary'],
    alquiler_temporada: ['buyer', 'co_buyer', 'seller', 'agent', 'guarantor'],
    alquiler_turistico: ['buyer', 'seller', 'agent'],
  }

  const STATUS_LABELS: Record<string, string> = useMemo(() => ({
    approved: t('dmsStatusApproved'),
    rejected: t('dmsStatusRejected'),
    review_required: t('dmsStatusReviewRequired'),
    signed: t('dmsStatusSigned'),
    pending: t('dmsStatusPending'),
  }), [t])

  const FOLDER_STATUS_LABELS: Record<string, string> = useMemo(() => ({
    active: t('dmsFolderStatusActive'),
    completed: t('dmsFolderStatusCompleted'),
    archived: t('dmsFolderStatusArchived'),
  }), [t])

  const activeLeads = useMemo(
    () =>
      leads
        .filter((l) => l.status !== 'closed')
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || (a.name ?? '').localeCompare(b.name ?? '')),
    [leads],
  )

  // ── Data state ─────────────────────────────────────────────────────────────
  const [folders, setFolders] = useState<DealFolder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [parties, setParties] = useState<FolderParty[]>([])
  const [templates, setTemplates] = useState<TemplateRow[]>([])
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // ── Sidebar UI state ───────────────────────────────────────────────────────
  const [folderSearch, setFolderSearch] = useState('')
  const [folderFilter, setFolderFilter] = useState<FilterType>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [operationType, setOperationType] = useState<OperationType>('compraventa')
  const [clientLeadId, setClientLeadId] = useState('')

  // ── Detail panel UI state ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>('parties')
  const [showAddParty, setShowAddParty] = useState(false)
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [partyName, setPartyName] = useState('')
  const [partyEmail, setPartyEmail] = useState('')
  const [partyRole, setPartyRole] = useState<PartyRole>('buyer')
  const [selectedTemplateVersionId, setSelectedTemplateVersionId] = useState('')
  const [generatedTitle, setGeneratedTitle] = useState('')

  const selectedFolder = useMemo(
    () => folders.find((f) => f.id === selectedFolderId) ?? null,
    [folders, selectedFolderId],
  )

  const filteredFolders = useMemo(() => {
    let result = folders
    if (folderFilter !== 'all') result = result.filter((f) => f.operation_type === folderFilter)
    const q = folderSearch.toLowerCase().trim()
    if (q) {
      result = result.filter((f) => {
        const lead = leads.find((l) => l.id === f.client_lead_id)
        return (
          lead?.name?.toLowerCase().includes(q) ||
          lead?.email?.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q)
        )
      })
    }
    return result
  }, [folders, folderFilter, folderSearch, leads])

  // ── Data loading ───────────────────────────────────────────────────────────
  const runAction = useCallback(async (key: string, fn: () => Promise<void>) => {
    setBusy(key)
    setError(null)
    setMessage(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dmsErrorAction'))
    } finally {
      setBusy(null)
    }
  }, [t])

  const loadFolders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listDealFolders()
      setFolders(data)
      setSelectedFolderId((current) => current ?? data[0]?.id ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dmsErrorLoadFolders'))
    } finally {
      setLoading(false)
    }
  }, [t])

  const loadFolderContext = useCallback(async (folderId: string | null) => {
    if (!folderId) { setParties([]); setTemplates([]); setGeneratedDocs([]); return }
    try {
      const [nextParties, nextTemplates, nextGenerated] = await Promise.all([
        listParties(folderId),
        listAvailableTemplates(folderId),
        listGeneratedDocuments(folderId),
      ])
      setParties(nextParties)
      setTemplates(nextTemplates)
      setGeneratedDocs(nextGenerated)
      setSelectedTemplateVersionId((current) => current || nextTemplates[0]?.latest_version?.id || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dmsErrorLoadFolder'))
    }
  }, [t])

  useEffect(() => { void loadFolders() }, [loadFolders])
  useEffect(() => { void loadFolderContext(selectedFolderId) }, [loadFolderContext, selectedFolderId])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCreateFolder = () => runAction('create-folder', async () => {
    if (!clientLeadId.trim()) throw new Error(t('dmsErrorClientLeadId'))
    const folder = await createDealFolder({ operation_type: operationType, property_id: null, client_lead_id: clientLeadId.trim(), seller_id: null })
    setFolders((current) => [folder, ...current])
    setSelectedFolderId(folder.id)
    setShowCreateForm(false)
    setClientLeadId('')
    setMessage(t('dmsMsgFolderCreated'))
  })

  const handleCreateParty = () => runAction('create-party', async () => {
    if (!selectedFolderId) throw new Error(t('dmsErrorNoFolder'))
    if (!partyName.trim()) throw new Error(t('dmsErrorPartyName'))
    const party = await createParty(selectedFolderId, {
      party_role: partyRole,
      full_name: partyName.trim(),
      email: partyEmail.trim() || undefined,
      is_primary: partyRole === 'buyer' && parties.every((p) => !p.is_primary),
    })
    setParties((current) => [...current, party])
    setPartyName('')
    setPartyEmail('')
    setShowAddParty(false)
    setMessage(t('dmsMsgPartyAdded'))
  })

  const handleGenerate = () => runAction('generate-document', async () => {
    if (!selectedFolderId) throw new Error(t('dmsErrorNoFolder'))
    if (!selectedTemplateVersionId) throw new Error(t('dmsErrorNoTemplate'))
    const selectedTemplate = templates.find((tpl) => tpl.latest_version?.id === selectedTemplateVersionId)
    const result = await generateDocument(selectedFolderId, {
      template_version_id: selectedTemplateVersionId,
      title: generatedTitle.trim() || selectedTemplate?.name || 'Document',
      generation_payload: {},
    })
    setGeneratedDocs((current) => [result.document, ...current])
    setGeneratedTitle('')
    setShowGenerateForm(false)
    setActiveTab('documents')
    setMessage(t('dmsMsgDocGenerated'))
  })

  const handleValidate = (documentId: string) => runAction(`validate-${documentId}`, async () => {
    const result = await triggerAutoReview(documentId, { jurisdiction: 'España', language: 'es' })
    const status = String(result.status || 'review_required')
    setGeneratedDocs((current) => current.map((doc) => doc.id === documentId ? { ...doc, status: status as GeneratedDocument['status'] } : doc))
    setMessage(t('dmsMsgValidated'))
  })

  const handleApprove = (documentId: string) => runAction(`approve-${documentId}`, async () => {
    await createManualReviewDecision(documentId, { decision: 'approved', notes: 'Aprobación manual desde DMS', block_signing: false })
    setGeneratedDocs((current) => current.map((doc) => doc.id === documentId ? { ...doc, status: 'approved' } : doc))
    setMessage(t('dmsMsgApproved'))
  })

  const handleSign = (documentId: string) => runAction(`sign-${documentId}`, async () => {
    await createGeneratedSignatureFlow(documentId, { signer_email: 'firmante@example.invalid', signer_name: 'Firmante pendiente', signer_role: 'buyer' })
    setMessage(t('dmsMsgSigned'))
  })

  const operationRoles = selectedFolder
    ? ROLES_BY_OPERATION[selectedFolder.operation_type as OperationType] ?? (Object.keys(ROLE_LABELS) as PartyRole[])
    : Object.keys(ROLE_LABELS) as PartyRole[]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-soft-subtle/50 px-6 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="page-title">{t('dmsPageTitle')}</h1>
            <p className="page-subtitle mt-1">{t('dmsPageSubtitle')}</p>
          </div>
          <Link href="/dms/templates" className="btn-action shrink-0">{t('dmsTemplateLibraryLink')}</Link>
        </div>
      </header>

      {/* ── Feedback banners ────────────────────────────────────────────────── */}
      {(error ?? message) && (
        <div className="shrink-0 space-y-2 px-6 pt-4">
          {error && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="shrink-0 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
            </div>
          )}
          {message && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              <span>{message}</span>
              <button type="button" onClick={() => setMessage(null)} className="shrink-0 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      )}

      {/* ── Main split layout ────────────────────────────────────────────────── */}
      <div className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[320px_minmax(0,1fr)]">

        {/* ══ LEFT SIDEBAR — Expedientes ════════════════════════════════════ */}
        <aside className="flex flex-col gap-0 overflow-hidden border-r border-soft-subtle/40">

          {/* Search + filter — sticky */}
          <div className="shrink-0 border-b border-soft-subtle/30 p-4 pb-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-soft-muted">{t('dmsExpedientesTitle')}</span>
              <button
                type="button"
                onClick={() => void loadFolders()}
                aria-label={t('refresh')}
                className="rounded-lg p-1.5 text-soft-muted transition-colors hover:text-soft-white"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soft-muted/50" />
              <input
                value={folderSearch}
                onChange={(e) => setFolderSearch(e.target.value)}
                placeholder={t('dmsSearchPlaceholder')}
                className="w-full rounded-xl border border-soft-subtle bg-navy-darker py-2 pl-9 pr-3 text-sm text-soft-white placeholder:text-soft-muted/40 focus:border-blue-light/60 focus:outline-none"
              />
              {folderSearch && (
                <button type="button" onClick={() => setFolderSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-soft-muted/60 hover:text-soft-muted">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'compraventa', 'alquiler_temporada', 'alquiler_turistico'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFolderFilter(f)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                    folderFilter === f
                      ? 'border-gold/40 bg-gold/10 text-gold'
                      : 'border-soft-subtle text-soft-muted hover:border-soft-subtle/80 hover:text-soft-white'
                  }`}
                >
                  {f === 'all' ? t('dmsFilterAll') : OPERATION_LABELS[f as OperationType]}
                </button>
              ))}
            </div>
          </div>

          {/* Create folder toggle */}
          <div className="shrink-0 border-b border-soft-subtle/30 p-4">
            <button
              type="button"
              onClick={() => setShowCreateForm((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-soft-subtle/60 px-3 py-2.5 text-sm font-medium text-soft-white transition-all hover:border-gold/30 hover:bg-gold/5"
            >
              <span className="flex items-center gap-2">
                <FilePlus2 className="h-4 w-4 text-gold" />
                {t('dmsNewFolderSection')}
              </span>
              {showCreateForm ? <ChevronUp className="h-4 w-4 text-soft-muted" /> : <ChevronDown className="h-4 w-4 text-soft-muted" />}
            </button>

            {showCreateForm && (
              <div className="mt-3 grid gap-3">
                <div className="grid gap-1.5">
                  <FieldLabel label={t('dmsOperationTypeLabel')} required />
                  <select
                    value={operationType}
                    onChange={(e) => setOperationType(e.target.value as OperationType)}
                    className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2.5 text-sm text-soft-white focus:border-blue-light/60 focus:outline-none"
                  >
                    {Object.entries(OPERATION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <FieldLabel label={t('dmsClientLeadIdLabel')} required />
                  <LeadCombobox leads={activeLeads} selectedLeadId={clientLeadId} onSelect={setClientLeadId} />
                </div>
                <button
                  type="button"
                  onClick={() => void handleCreateFolder()}
                  disabled={busy === 'create-folder' || !clientLeadId}
                  className="btn-action justify-center py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FilePlus2 className="h-4 w-4" />
                  {t('dmsCreateFolderBtn')}
                </button>
              </div>
            )}
          </div>

          {/* Folder list — scrollable */}
          <div className="flex-1 overflow-y-auto p-3">
            {filteredFolders.length === 0 && !loading && (
              <p className="py-6 text-center text-sm text-soft-muted">
                {folderSearch || folderFilter !== 'all' ? 'Sin resultados' : t('dmsNoFolders')}
              </p>
            )}
            <div className="space-y-1.5">
              {filteredFolders.map((folder) => {
                const lead = leads.find((l) => l.id === folder.client_lead_id)
                const isSelected = folder.id === selectedFolderId
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => { setSelectedFolderId(folder.id); setActiveTab('parties') }}
                    className={`w-full rounded-xl border px-3.5 py-3 text-left transition-all ${
                      isSelected
                        ? 'border-gold/40 bg-gold/8 shadow-[0_0_0_1px_rgba(212,175,55,0.15)]'
                        : 'border-soft-subtle/60 bg-navy-darker/20 hover:border-soft-subtle hover:bg-navy-darker/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-tight ${isSelected ? 'text-gold' : 'text-soft-white'}`}>
                        {lead?.name ?? '—'}
                      </p>
                      <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${OPERATION_BADGE[folder.operation_type as OperationType] ?? 'border-soft-subtle text-soft-muted'}`}>
                        {OPERATION_LABELS[folder.operation_type as OperationType] ?? folder.operation_type}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-soft-muted/70">
                      #{folder.id.slice(0, 8)} · {FOLDER_STATUS_LABELS[folder.folder_status] ?? folder.folder_status}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* ══ RIGHT — Detail panel ══════════════════════════════════════════ */}
        <main className="flex flex-col overflow-hidden">

          {/* Empty state */}
          {!selectedFolder ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-soft-subtle bg-navy-surface/40">
                <FolderOpen className="h-7 w-7 text-soft-muted" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-soft-white">{t('dmsEmptyStateTitle')}</p>
                <p className="mt-1 max-w-xs text-sm text-soft-muted">{t('dmsEmptyStateSubtitle')}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Folder detail header */}
              <div className="shrink-0 border-b border-soft-subtle/40 px-6 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${OPERATION_BADGE[selectedFolder.operation_type as OperationType] ?? ''}`}>
                    {OPERATION_LABELS[selectedFolder.operation_type as OperationType]}
                  </span>
                  <h2 className="font-display text-lg font-semibold text-soft-white">
                    {leads.find((l) => l.id === selectedFolder.client_lead_id)?.name ?? '—'}
                  </h2>
                  <span className="rounded-lg border border-soft-subtle px-2 py-0.5 font-mono text-xs text-soft-muted">
                    #{selectedFolder.id.slice(0, 8)}
                  </span>
                  <span className="rounded-lg border border-soft-subtle/50 bg-navy-darker/30 px-2 py-0.5 text-xs text-soft-muted">
                    {FOLDER_STATUS_LABELS[selectedFolder.folder_status] ?? selectedFolder.folder_status}
                  </span>
                </div>
              </div>

              {/* Tab bar */}
              <div className="shrink-0 flex border-b border-soft-subtle/40 px-6">
                {(
                  [
                    { key: 'parties' as Tab, label: t('dmsTabParties'), count: parties.length },
                    { key: 'templates' as Tab, label: t('dmsTabTemplates'), count: templates.length },
                    { key: 'documents' as Tab, label: t('dmsTabDocuments'), count: generatedDocs.length },
                  ] as const
                ).map(({ key, label, count }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                      activeTab === key
                        ? 'text-gold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-gold'
                        : 'text-soft-muted hover:text-soft-white'
                    }`}
                  >
                    {label}
                    {count > 0 && (
                      <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${activeTab === key ? 'bg-gold/15 text-gold' : 'bg-navy-darker text-soft-muted'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content — scrollable */}
              <div className="flex-1 overflow-y-auto p-6">

                {/* ── Partes tab ──────────────────────────────────────────── */}
                {activeTab === 'parties' && (
                  <div className="mx-auto max-w-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-base font-semibold text-soft-white">{t('dmsPartiesTitle')}</h3>
                        <p className="mt-0.5 text-xs text-soft-muted">{t('dmsPartiesHelperText')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddParty((v) => !v)}
                        className="btn-action"
                      >
                        <UserPlus className="h-4 w-4" />
                        {showAddParty ? t('dmsPartiesTitle') : t('dmsAddPartySection')}
                        {showAddParty ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {showAddParty && (
                      <div className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="grid gap-1.5">
                            <FieldLabel label={t('dmsPartyRoleLabel')} required />
                            <select
                              value={partyRole}
                              onChange={(e) => setPartyRole(e.target.value as PartyRole)}
                              className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2.5 text-sm text-soft-white focus:border-blue-light/60 focus:outline-none"
                            >
                              {operationRoles.map((role) => (
                                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid gap-1.5">
                            <FieldLabel label={t('dmsPartyNameLabel')} required />
                            <input
                              value={partyName}
                              onChange={(e) => setPartyName(e.target.value)}
                              placeholder="—"
                              className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2.5 text-sm text-soft-white placeholder:text-soft-muted/40 focus:border-blue-light/60 focus:outline-none"
                            />
                          </div>
                          <div className="grid gap-1.5 sm:col-span-2">
                            <FieldLabel label={t('dmsPartyEmailLabel')} />
                            <input
                              value={partyEmail}
                              onChange={(e) => setPartyEmail(e.target.value)}
                              placeholder="—"
                              type="email"
                              className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2.5 text-sm text-soft-white placeholder:text-soft-muted/40 focus:border-blue-light/60 focus:outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleCreateParty()}
                          disabled={busy === 'create-party'}
                          className="btn-action mt-4 justify-center py-2.5"
                        >
                          <UserPlus className="h-4 w-4" />
                          {t('dmsAddPartyBtn')}
                        </button>
                      </div>
                    )}

                    {parties.length === 0 ? (
                      <p className="rounded-xl border border-soft-subtle/40 bg-navy-surface/20 px-5 py-8 text-center text-sm text-soft-muted">
                        {t('dmsNoParties')}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {parties.map((party) => (
                          <article key={party.id} className="flex items-center justify-between gap-3 rounded-xl border border-soft-subtle bg-navy-darker/30 px-4 py-3.5">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-soft-white">{party.full_name}</p>
                                <span className="rounded-full border border-soft-subtle px-2 py-0.5 text-xs text-soft-muted">
                                  {ROLE_LABELS[party.party_role as PartyRole] ?? party.party_role}
                                </span>
                                {party.is_primary && (
                                  <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-xs text-gold">
                                    {t('dmsPrimaryBadge')}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-soft-muted">{party.email || t('dmsNoEmail')}</p>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Plantillas tab ──────────────────────────────────────── */}
                {activeTab === 'templates' && (
                  <div className="mx-auto max-w-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-base font-semibold text-soft-white">{t('dmsTemplatesTitle')}</h3>
                      </div>
                      {templates.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowGenerateForm((v) => !v)}
                          className="btn-action"
                        >
                          <FilePlus2 className="h-4 w-4" />
                          {t('dmsGenerateSection')}
                          {showGenerateForm ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>

                    {showGenerateForm && templates.length > 0 && (
                      <div className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="grid gap-1.5">
                            <FieldLabel label={t('dmsTemplateLabel')} required />
                            <select
                              value={selectedTemplateVersionId}
                              onChange={(e) => setSelectedTemplateVersionId(e.target.value)}
                              className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2.5 text-sm text-soft-white focus:border-blue-light/60 focus:outline-none"
                            >
                              {templates.map((tpl) => (
                                <option key={tpl.id} value={tpl.latest_version?.id || ''}>{tpl.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid gap-1.5">
                            <FieldLabel label={t('dmsDocTitleLabel')} />
                            <input
                              value={generatedTitle}
                              onChange={(e) => setGeneratedTitle(e.target.value)}
                              placeholder="—"
                              className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2.5 text-sm text-soft-white placeholder:text-soft-muted/40 focus:border-blue-light/60 focus:outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleGenerate()}
                          disabled={!selectedTemplateVersionId || busy === 'generate-document'}
                          className="btn-action mt-4 justify-center py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <FilePlus2 className="h-4 w-4" />
                          {t('dmsGenerateBtn')}
                        </button>
                      </div>
                    )}

                    {templates.length === 0 ? (
                      <div className="rounded-xl border border-soft-subtle/40 bg-navy-surface/20 px-5 py-8 text-center">
                        <p className="text-sm text-soft-muted">{t('dmsNoTemplatesHint')}</p>
                        <Link href="/dms/templates" className="mt-3 inline-block text-xs text-blue-light underline underline-offset-2 hover:text-blue-light/80">
                          {t('dmsTemplateLibraryLink')} →
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {templates.map((tpl) => (
                          <article key={tpl.id} className="flex items-center justify-between gap-4 rounded-xl border border-soft-subtle bg-navy-darker/30 px-4 py-3.5">
                            <div className="min-w-0">
                              <p className="font-semibold text-soft-white">{tpl.name}</p>
                              <p className="mt-0.5 text-xs text-soft-muted">
                                {tpl.template_document_type} · {t('dmsVersionLabel')} {tpl.latest_version?.version_number ?? '-'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setSelectedTemplateVersionId(tpl.latest_version?.id || ''); setShowGenerateForm(true) }}
                              className="shrink-0 rounded-xl border border-soft-subtle px-3 py-1.5 text-xs text-soft-muted transition-all hover:border-gold/40 hover:text-gold"
                            >
                              {t('dmsGenerateBtn')}
                            </button>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Documentos tab ──────────────────────────────────────── */}
                {activeTab === 'documents' && (
                  <div className="mx-auto max-w-3xl space-y-4">
                    <h3 className="font-display text-base font-semibold text-soft-white">{t('dmsDocsTitle')}</h3>

                    {generatedDocs.length === 0 ? (
                      <p className="rounded-xl border border-soft-subtle/40 bg-navy-surface/20 px-5 py-8 text-center text-sm text-soft-muted">
                        {t('dmsNoDocs')}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {generatedDocs.map((doc) => (
                          <article key={doc.id} className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-semibold text-soft-white">{doc.title}</h4>
                                  <span className={`rounded-full border px-2 py-0.5 text-xs ${docStatusClass(doc.status)}`}>
                                    {STATUS_LABELS[doc.status] ?? doc.status}
                                  </span>
                                </div>
                                <p className="mt-1 font-mono text-[11px] text-soft-muted/60">#{doc.id.slice(0, 8)}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <GhostBtn href={`/api/dms/generated-documents/${doc.id}/download?format=docx`}>
                                <Download className="h-3.5 w-3.5" />DOCX
                              </GhostBtn>
                              <GhostBtn href={`/api/dms/generated-documents/${doc.id}/download?format=pdf`}>
                                <Download className="h-3.5 w-3.5" />PDF
                              </GhostBtn>
                              <button
                                type="button"
                                onClick={() => void handleValidate(doc.id)}
                                disabled={busy === `validate-${doc.id}`}
                                className="btn-action h-9!"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                {t('dmsValidateBtn')}
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleApprove(doc.id)}
                                disabled={busy === `approve-${doc.id}`}
                                className="btn-action h-9!"
                              >
                                {t('dmsApproveBtn')}
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleSign(doc.id)}
                                disabled={doc.status !== 'approved' || busy === `sign-${doc.id}`}
                                className="btn-action h-9! disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Send className="h-4 w-4" />
                                {t('dmsSignBtn')}
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </>
          )}
        </main>

      </div>
    </div>
  )
}
