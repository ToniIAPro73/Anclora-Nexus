'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Download, FilePlus2, RefreshCw, Send, UserPlus } from 'lucide-react'

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

const OPERATION_LABELS: Record<OperationType, string> = {
  compraventa: 'Compraventa',
  alquiler_temporada: 'Alquiler temporada',
  alquiler_turistico: 'Alquiler turístico',
}

const ROLE_LABELS: Record<PartyRole, string> = {
  buyer: 'Comprador / cliente',
  seller: 'Vendedor / arrendador',
  agent: 'Agente',
  guarantor: 'Avalista',
  co_buyer: 'Co-comprador',
  co_seller: 'Co-vendedor',
  notary: 'Notaría',
}

type TemplateRow = DocumentTemplate & { latest_version?: TemplateVersion }

function statusClass(status: string): string {
  if (status === 'approved') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  if (status === 'rejected') return 'border-red-500/30 bg-red-500/10 text-red-300'
  if (status === 'review_required') return 'border-amber-500/30 bg-amber-500/10 text-amber-200'
  if (status === 'signed') return 'border-blue-light/30 bg-blue-light/10 text-blue-light'
  return 'border-soft-subtle bg-navy-darker text-soft-muted'
}

export default function DmsPage() {
  const [folders, setFolders] = useState<DealFolder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [operationType, setOperationType] = useState<OperationType>('compraventa')
  const [clientLeadId, setClientLeadId] = useState('')
  const [parties, setParties] = useState<FolderParty[]>([])
  const [partyName, setPartyName] = useState('')
  const [partyEmail, setPartyEmail] = useState('')
  const [partyRole, setPartyRole] = useState<PartyRole>('buyer')
  const [templates, setTemplates] = useState<TemplateRow[]>([])
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([])
  const [selectedTemplateVersionId, setSelectedTemplateVersionId] = useState('')
  const [generatedTitle, setGeneratedTitle] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === selectedFolderId) ?? null,
    [folders, selectedFolderId],
  )

  const runAction = useCallback(async (key: string, fn: () => Promise<void>) => {
    setBusy(key)
    setError(null)
    setMessage(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Acción DMS fallida')
    } finally {
      setBusy(null)
    }
  }, [])

  const loadFolders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listDealFolders()
      setFolders(data)
      setSelectedFolderId((current) => current ?? data[0]?.id ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar expedientes')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadFolderContext = useCallback(async (folderId: string | null) => {
    if (!folderId) {
      setParties([])
      setTemplates([])
      setGeneratedDocs([])
      return
    }
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
      setError(err instanceof Error ? err.message : 'No se pudo cargar el expediente')
    }
  }, [])

  useEffect(() => { void loadFolders() }, [loadFolders])
  useEffect(() => { void loadFolderContext(selectedFolderId) }, [loadFolderContext, selectedFolderId])

  const handleCreateFolder = () => runAction('create-folder', async () => {
    if (!clientLeadId.trim()) throw new Error('Introduce el ID del cliente principal')
    const folder = await createDealFolder({
      operation_type: operationType,
      property_id: null,
      client_lead_id: clientLeadId.trim(),
      seller_id: null,
    })
    setFolders((current) => [folder, ...current])
    setSelectedFolderId(folder.id)
    setMessage('Expediente creado con cliente principal')
  })

  const handleCreateParty = () => runAction('create-party', async () => {
    if (!selectedFolderId) throw new Error('Selecciona un expediente')
    if (!partyName.trim()) throw new Error('Indica el nombre de la parte')
    const party = await createParty(selectedFolderId, {
      party_role: partyRole,
      full_name: partyName.trim(),
      email: partyEmail.trim() || undefined,
      is_primary: partyRole === 'buyer' && parties.every((item) => !item.is_primary),
    })
    setParties((current) => [...current, party])
    setPartyName('')
    setPartyEmail('')
    setMessage('Parte añadida al expediente')
  })

  const handleGenerate = () => runAction('generate-document', async () => {
    if (!selectedFolderId) throw new Error('Selecciona un expediente')
    if (!selectedTemplateVersionId) throw new Error('Selecciona una plantilla publicada')
    const selectedTemplate = templates.find((template) => template.latest_version?.id === selectedTemplateVersionId)
    const result = await generateDocument(selectedFolderId, {
      template_version_id: selectedTemplateVersionId,
      title: generatedTitle.trim() || selectedTemplate?.name || 'Documento generado',
      generation_payload: {},
    })
    setGeneratedDocs((current) => [result.document, ...current])
    setGeneratedTitle('')
    setMessage('Documento generado y listo para previsualizar')
  })

  const handleValidate = (documentId: string) => runAction(`validate-${documentId}`, async () => {
    const result = await triggerAutoReview(documentId, { jurisdiction: 'España', language: 'es' })
    const status = String(result.status || 'review_required')
    setGeneratedDocs((current) => current.map((doc) => doc.id === documentId ? { ...doc, status: status as GeneratedDocument['status'] } : doc))
    setMessage('Validación legal registrada')
  })

  const handleApprove = (documentId: string) => runAction(`approve-${documentId}`, async () => {
    await createManualReviewDecision(documentId, { decision: 'approved', notes: 'Aprobación manual desde DMS', block_signing: false })
    setGeneratedDocs((current) => current.map((doc) => doc.id === documentId ? { ...doc, status: 'approved' } : doc))
    setMessage('Documento aprobado para firma')
  })

  const handleSign = (documentId: string) => runAction(`sign-${documentId}`, async () => {
    await createGeneratedSignatureFlow(documentId, {
      signer_email: 'firmante@example.invalid',
      signer_name: 'Firmante pendiente',
      signer_role: 'buyer',
    })
    setMessage('Flujo de firma creado')
  })

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-5">
        <section className="flex flex-col gap-4 border-b border-soft-subtle/50 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <Link href="/dashboard" className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-2 text-soft-muted transition-all hover:border-blue-light/50 hover:text-soft-white">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="page-title">Gestión documental</h1>
            </div>
            <p className="page-subtitle">Expediente, partes CRM, plantillas publicadas, revisión legal y firma.</p>
          </div>
          <Link href="/dms/templates" className="btn-secondary">Biblioteca de plantillas</Link>
        </section>

        {error && <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</section>}
        {message && <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{message}</section>}

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg text-soft-white">Expedientes</h2>
              <button type="button" onClick={() => void loadFolders()} className="rounded-lg p-2 text-soft-muted hover:text-soft-white">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="mb-4 grid gap-2">
              <select value={operationType} onChange={(event) => setOperationType(event.target.value as OperationType)} className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-white">
                {Object.entries(OPERATION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <input value={clientLeadId} onChange={(event) => setClientLeadId(event.target.value)} placeholder="UUID del cliente principal" className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-white placeholder:text-soft-muted/50" />
              <button type="button" onClick={() => void handleCreateFolder()} disabled={busy === 'create-folder'} className="btn-action justify-center">
                <FilePlus2 className="h-4 w-4" />
                Crear expediente
              </button>
            </div>

            <div className="space-y-2">
              {folders.map((folder) => (
                <button key={folder.id} type="button" onClick={() => setSelectedFolderId(folder.id)} className={`w-full rounded-xl border px-3 py-3 text-left transition-all ${folder.id === selectedFolderId ? 'border-gold/40 bg-gold/10 text-gold' : 'border-soft-subtle bg-navy-darker/30 text-soft-white hover:border-blue-light/30'}`}>
                  <p className="text-sm font-semibold">{OPERATION_LABELS[folder.operation_type as OperationType] ?? folder.operation_type}</p>
                  <p className="text-xs text-soft-muted">Cliente {folder.client_lead_id?.slice(0, 8) ?? folder.seller_id?.slice(0, 8) ?? 'sin asignar'} · #{folder.id.slice(0, 8)}</p>
                </button>
              ))}
              {!loading && folders.length === 0 && <p className="text-sm text-soft-muted">No hay expedientes activos.</p>}
            </div>
          </aside>

          <main className="grid min-w-0 gap-4">
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <h2 className="mb-4 font-display text-lg text-soft-white">Partes del expediente</h2>
                <div className="mb-4 grid gap-2 md:grid-cols-[160px_minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <select value={partyRole} onChange={(event) => setPartyRole(event.target.value as PartyRole)} disabled={!selectedFolder} className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-white disabled:opacity-40">
                    {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <input value={partyName} onChange={(event) => setPartyName(event.target.value)} placeholder="Nombre" disabled={!selectedFolder} className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-white placeholder:text-soft-muted/50 disabled:opacity-40" />
                  <input value={partyEmail} onChange={(event) => setPartyEmail(event.target.value)} placeholder="Email" disabled={!selectedFolder} className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-white placeholder:text-soft-muted/50 disabled:opacity-40" />
                  <button type="button" onClick={() => void handleCreateParty()} disabled={!selectedFolder || busy === 'create-party'} className="btn-action">
                    <UserPlus className="h-4 w-4" />
                    Añadir
                  </button>
                </div>
                <div className="space-y-2">
                  {parties.map((party) => (
                    <article key={party.id} className="rounded-xl border border-soft-subtle bg-navy-darker/30 px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-soft-white">{party.full_name}</p>
                        <span className="rounded-full border border-soft-subtle px-2 py-0.5 text-xs text-soft-muted">{ROLE_LABELS[party.party_role]}</span>
                        {party.is_primary && <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-xs text-gold">principal</span>}
                      </div>
                      <p className="mt-1 text-xs text-soft-muted">{party.email || 'Sin email'}</p>
                    </article>
                  ))}
                  {parties.length === 0 && <p className="text-sm text-soft-muted">Añade comprador y vendedor para generar documentos.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <h2 className="mb-4 font-display text-lg text-soft-white">Plantillas aplicables</h2>
                <div className="mb-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <select value={selectedTemplateVersionId} onChange={(event) => setSelectedTemplateVersionId(event.target.value)} disabled={!selectedFolder || templates.length === 0} className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-white disabled:opacity-40">
                    {templates.map((template) => <option key={template.id} value={template.latest_version?.id || ''}>{template.name}</option>)}
                  </select>
                  <input value={generatedTitle} onChange={(event) => setGeneratedTitle(event.target.value)} placeholder="Título del documento" disabled={!selectedFolder} className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-white placeholder:text-soft-muted/50 disabled:opacity-40" />
                  <button type="button" onClick={() => void handleGenerate()} disabled={!selectedFolder || !selectedTemplateVersionId || busy === 'generate-document'} className="btn-action">
                    <FilePlus2 className="h-4 w-4" />
                    Generar
                  </button>
                </div>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <article key={template.id} className="rounded-xl border border-soft-subtle bg-navy-darker/30 px-3 py-2">
                      <p className="font-medium text-soft-white">{template.name}</p>
                      <p className="mt-1 text-xs text-soft-muted">{template.template_document_type} · v{template.latest_version?.version_number ?? '-'} · {template.latest_version?.status ?? template.status}</p>
                    </article>
                  ))}
                  {selectedFolder && templates.length === 0 && <p className="text-sm text-soft-muted">No hay plantillas publicadas para esta operación.</p>}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35">
              <div className="border-b border-soft-subtle/50 p-4">
                <h2 className="font-display text-lg text-soft-white">Documentos generados</h2>
                <p className="text-xs text-soft-muted">{selectedFolder ? OPERATION_LABELS[selectedFolder.operation_type as OperationType] : 'Selecciona un expediente'}</p>
              </div>
              <div className="divide-y divide-soft-subtle/40">
                {generatedDocs.map((document) => (
                  <article key={document.id} className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-soft-white">{document.title}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClass(document.status)}`}>{document.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-soft-muted">#{document.id.slice(0, 8)} · versión {document.current_version_id?.slice(0, 8) ?? 'actual'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a href={`/api/dms/generated-documents/${document.id}/download?format=docx`} className="btn-secondary h-10!">
                        <Download className="h-4 w-4" />
                        DOCX
                      </a>
                      <a href={`/api/dms/generated-documents/${document.id}/download?format=pdf`} className="btn-secondary h-10!">
                        <Download className="h-4 w-4" />
                        PDF
                      </a>
                      <button type="button" onClick={() => void handleValidate(document.id)} disabled={busy === `validate-${document.id}`} className="btn-action h-10!">
                        <CheckCircle2 className="h-4 w-4" />
                        Validar
                      </button>
                      <button type="button" onClick={() => void handleApprove(document.id)} disabled={busy === `approve-${document.id}`} className="btn-action h-10!">
                        Aprobar
                      </button>
                      <button type="button" onClick={() => void handleSign(document.id)} disabled={document.status !== 'approved' || busy === `sign-${document.id}`} className="btn-action h-10! disabled:cursor-not-allowed disabled:opacity-40">
                        <Send className="h-4 w-4" />
                        Firma
                      </button>
                    </div>
                  </article>
                ))}
                {generatedDocs.length === 0 && <p className="p-6 text-sm text-soft-muted">Aún no hay documentos generados en este expediente.</p>}
              </div>
            </section>
          </main>
        </section>
      </div>
    </div>
  )
}
