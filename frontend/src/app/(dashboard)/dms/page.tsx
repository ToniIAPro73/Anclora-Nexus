'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileCheck2, FileUp, RefreshCw, Send, ShieldAlert } from 'lucide-react'

import {
  createDealFolder,
  createSignatureFlow,
  listDealFolders,
  listDocuments,
  uploadDocument,
  validateDocument,
  type DealDocument,
  type DealFolder,
  type OperationType,
} from '@/lib/dms-api'

const categories = [
  'nota_simple',
  'escritura_propiedad',
  'contrato_compraventa',
  'arras_penitenciales',
  'contrato_temporada',
  'driat_etv',
  'dni_nie_pasaporte',
  'certificado_energetico',
]

function statusClass(status: string): string {
  if (status === 'approved') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  if (status === 'rejected') return 'border-red-500/30 bg-red-500/10 text-red-300'
  return 'border-amber-500/30 bg-amber-500/10 text-amber-200'
}

export default function DmsPage() {
  const [folders, setFolders] = useState<DealFolder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<DealDocument[]>([])
  const [operationType, setOperationType] = useState<OperationType>('compraventa')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === selectedFolderId) ?? null,
    [folders, selectedFolderId],
  )

  const loadFolders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listDealFolders()
      setFolders(data)
      setSelectedFolderId((current) => current ?? data[0]?.id ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar expedientes DMS')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDocuments = useCallback(async (folderId: string | null) => {
    if (!folderId) {
      setDocuments([])
      return
    }
    try {
      setDocuments(await listDocuments(folderId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar documentos')
    }
  }, [])

  useEffect(() => {
    void loadFolders()
  }, [loadFolders])

  useEffect(() => {
    void loadDocuments(selectedFolderId)
  }, [loadDocuments, selectedFolderId])

  const runAction = useCallback(async (key: string, fn: () => Promise<void>) => {
    setBusy(key)
    setMessage(null)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Accion DMS fallida')
    } finally {
      setBusy(null)
    }
  }, [])

  const handleCreateFolder = () => runAction('create-folder', async () => {
    const folder = await createDealFolder({
      operation_type: operationType,
      property_id: null,
      client_lead_id: null,
      seller_id: null,
    })
    setFolders((current) => [folder, ...current])
    setSelectedFolderId(folder.id)
    setMessage('Expediente creado')
  })

  const handleUpload = () => runAction('upload', async () => {
    if (!selectedFolderId || !file || !title.trim()) {
      throw new Error('Selecciona expediente, titulo y archivo')
    }
    const document = await uploadDocument({
      folderId: selectedFolderId,
      title: title.trim(),
      documentCategory: category,
      file,
    })
    setDocuments((current) => [document, ...current])
    setTitle('')
    setFile(null)
    setMessage('Documento cifrado y subido')
  })

  const handleValidate = (documentId: string) => runAction(`validate-${documentId}`, async () => {
    const result = await validateDocument(documentId)
    setDocuments((current) => current.map((doc) => (doc.id === documentId ? result.document : doc)))
    setMessage('Validacion Advisor AI registrada')
  })

  const handleSendToSignature = (document: DealDocument) => runAction(`sign-${document.id}`, async () => {
    await createSignatureFlow(document.id, {
      signer_email: 'signer@example.invalid',
      signer_name: 'Firmante pendiente',
      signer_role: 'buyer',
    })
    setDocuments((current) => current.map((doc) => (
      doc.id === document.id
        ? { ...doc, legal_metadata: { ...(doc.legal_metadata || {}), immutable: true } }
        : doc
    )))
    setMessage('Flujo de firma creado en estado sent')
  })

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-5">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-soft-subtle/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard" className="p-2 rounded-xl border border-soft-subtle bg-navy-surface/40 text-soft-muted hover:text-soft-white hover:border-blue-light/50 transition-all group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <h1 className="page-title">Documentos DMS</h1>
            </div>
            <p className="page-subtitle">Expedientes inmobiliarios, compliance pre-firma y flujos DocuSeal.</p>
          </div>
          <button type="button" onClick={() => void loadFolders()} className="btn-action">
            <RefreshCw className="h-4 w-4" />
            Refrescar
          </button>
        </section>

        {error ? <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</section> : null}
        {message ? <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{message}</section> : null}

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck2 className="w-5 h-5 text-gold" />
              <h2 className="font-display text-lg text-soft-white">Expedientes</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <select value={operationType} onChange={(event) => setOperationType(event.target.value as OperationType)} className="min-w-0 flex-1 rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-white">
                <option value="compraventa">Compraventa</option>
                <option value="alquiler_temporada">Alquiler temporada</option>
                <option value="alquiler_turistico">Alquiler turistico</option>
              </select>
              <button type="button" onClick={() => void handleCreateFolder()} disabled={busy === 'create-folder'} className="btn-action !h-10">
                Crear
              </button>
            </div>
            <div className="space-y-2">
              {loading ? <div className="h-24 rounded-xl bg-navy-darker/50 animate-pulse" /> : null}
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition-all ${
                    folder.id === selectedFolderId
                      ? 'border-gold/40 bg-gold/10 text-gold'
                      : 'border-soft-subtle bg-navy-darker/30 text-soft-white hover:border-blue-light/30'
                  }`}
                >
                  <p className="text-sm font-semibold">{folder.operation_type}</p>
                  <p className="text-xs text-soft-muted">{folder.id.slice(0, 8)}</p>
                </button>
              ))}
              {!loading && folders.length === 0 ? <p className="text-sm text-soft-muted">No hay expedientes DMS.</p> : null}
            </div>
          </aside>

          <main className="flex flex-col gap-4 min-w-0">
            <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
              <div className="flex items-center gap-2 mb-4">
                <FileUp className="w-5 h-5 text-gold" />
                <h2 className="font-display text-lg text-soft-white">Subir documento cifrado</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)_auto]">
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titulo documental" className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-white placeholder:text-soft-muted" />
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-white">
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-muted" />
                <button type="button" onClick={() => void handleUpload()} disabled={!selectedFolder || busy === 'upload'} className="btn-action">
                  Subir
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-soft-subtle/50">
                <div>
                  <h2 className="font-display text-lg text-soft-white">Documentos del expediente</h2>
                  <p className="text-xs text-soft-muted">{selectedFolder?.operation_type ?? 'Selecciona o crea expediente'}</p>
                </div>
              </div>
              <div className="divide-y divide-soft-subtle/40">
                {documents.map((document) => {
                  const rejected = document.compliance_status === 'rejected'
                  const immutable = document.legal_metadata?.immutable === true
                  return (
                    <article key={document.id} className="p-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-soft-white truncate">{document.title}</h3>
                          <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClass(document.compliance_status)}`}>
                            {document.compliance_status}
                          </span>
                          {immutable ? <span className="rounded-full border border-blue-light/30 bg-blue-light/10 px-2 py-0.5 text-xs text-blue-light">inmutable</span> : null}
                        </div>
                        <p className="text-xs text-soft-muted mt-1">{document.document_category} · {Math.round(document.file_size_bytes / 1024)} KB</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => void handleValidate(document.id)} disabled={immutable || busy === `validate-${document.id}`} className="btn-action !h-10">
                          <ShieldAlert className="w-4 h-4" />
                          Validar con Advisor AI
                        </button>
                        <button type="button" onClick={() => void handleSendToSignature(document)} disabled={rejected || immutable || busy === `sign-${document.id}`} className="btn-action !h-10 disabled:opacity-40 disabled:cursor-not-allowed">
                          <Send className="w-4 h-4" />
                          Enviar a firma
                        </button>
                      </div>
                    </article>
                  )
                })}
                {documents.length === 0 ? <p className="p-6 text-sm text-soft-muted">No hay documentos en este expediente.</p> : null}
              </div>
            </section>
          </main>
        </section>
      </div>
    </div>
  )
}
