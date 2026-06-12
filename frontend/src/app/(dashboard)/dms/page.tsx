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
  type DealDocument,
  type DealFolder,
  type OperationType,
} from '@/lib/dms-api'

const CATEGORIES_BY_OPERATION: Record<OperationType, { value: string; label: string }[]> = {
  compraventa: [
    { value: 'nota_simple',            label: 'Nota simple' },
    { value: 'escritura_propiedad',    label: 'Escritura de propiedad' },
    { value: 'contrato_compraventa',   label: 'Contrato de compraventa' },
    { value: 'arras_penitenciales',    label: 'Arras penitenciales' },
    { value: 'cedula_habitabilidad',   label: 'Cédula de habitabilidad' },
    { value: 'certificado_energetico', label: 'Certificado energético' },
    { value: 'certificado_ite',        label: 'Certificado ITE' },
    { value: 'certificado_deuda_cero', label: 'Certificado deuda cero' },
    { value: 'certificado_comunidad',  label: 'Certificado comunidad' },
    { value: 'dni_nie_pasaporte',      label: 'DNI / NIE / Pasaporte' },
    { value: 'kyc_cliente',            label: 'KYC cliente' },
    { value: 'documento_firmado',      label: 'Documento firmado' },
  ],
  alquiler_temporada: [
    { value: 'contrato_temporada',     label: 'Contrato de temporada' },
    { value: 'nota_simple',            label: 'Nota simple' },
    { value: 'cedula_habitabilidad',   label: 'Cédula de habitabilidad' },
    { value: 'certificado_energetico', label: 'Certificado energético' },
    { value: 'dni_nie_pasaporte',      label: 'DNI / NIE / Pasaporte' },
    { value: 'kyc_cliente',            label: 'KYC cliente' },
    { value: 'documento_firmado',      label: 'Documento firmado' },
  ],
  alquiler_turistico: [
    { value: 'driat_etv',              label: 'DRIAT / ETV' },
    { value: 'nota_simple',            label: 'Nota simple' },
    { value: 'cedula_habitabilidad',   label: 'Cédula de habitabilidad' },
    { value: 'certificado_energetico', label: 'Certificado energético' },
    { value: 'dni_nie_pasaporte',      label: 'DNI / NIE / Pasaporte' },
    { value: 'kyc_cliente',            label: 'KYC cliente' },
    { value: 'documento_firmado',      label: 'Documento firmado' },
  ],
}

const OPERATION_LABELS: Record<OperationType, string> = {
  compraventa: 'Compraventa',
  alquiler_temporada: 'Alquiler temporada',
  alquiler_turistico: 'Alquiler turístico',
}

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
  const [category, setCategory] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === selectedFolderId) ?? null,
    [folders, selectedFolderId],
  )

  // Categories filtered by the selected folder's operation type
  const availableCategories = useMemo(() => {
    const opType = (selectedFolder?.operation_type as OperationType) ?? 'compraventa'
    return CATEGORIES_BY_OPERATION[opType] ?? CATEGORIES_BY_OPERATION.compraventa
  }, [selectedFolder])

  // Reset category when the available list changes (folder changed)
  useEffect(() => {
    setCategory(availableCategories[0]?.value ?? '')
  }, [availableCategories])

  // Auto-dismiss success messages after 4 seconds
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(t)
  }, [message])

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
    if (!folderId) { setDocuments([]); return }
    try {
      setDocuments(await listDocuments(folderId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar documentos')
    }
  }, [])

  useEffect(() => { void loadFolders() }, [loadFolders])
  useEffect(() => { void loadDocuments(selectedFolderId) }, [loadDocuments, selectedFolderId])

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
    const folder = await createDealFolder({ operation_type: operationType, property_id: null, client_lead_id: null, seller_id: null })
    setFolders((current) => [folder, ...current])
    setSelectedFolderId(folder.id)
    setMessage(`Expediente de ${OPERATION_LABELS[operationType]} creado`)
  })

  const handleUpload = () => runAction('upload', async () => {
    if (!selectedFolderId || !file || !title.trim()) {
      throw new Error('Selecciona expediente, título y archivo')
    }
    const document = await uploadDocument({ folderId: selectedFolderId, title: title.trim(), documentCategory: category, file })
    setDocuments((current) => [document, ...current])
    setTitle('')
    setFile(null)
    setMessage('Documento cifrado y subido correctamente')
  })

  const handleValidate = (documentId: string) => runAction(`validate-${documentId}`, async () => {
    const result = await validateDocument(documentId)
    setDocuments((current) => current.map((doc) => (doc.id === documentId ? result.document : doc)))
    setMessage('Validación Advisor AI registrada')
  })

  const handleSendToSignature = (document: DealDocument) => runAction(`sign-${document.id}`, async () => {
    await createSignatureFlow(document.id, { signer_email: 'signer@example.invalid', signer_name: 'Firmante pendiente', signer_role: 'buyer' })
    setDocuments((current) => current.map((doc) => (
      doc.id === document.id ? { ...doc, legal_metadata: { ...(doc.legal_metadata || {}), immutable: true } } : doc
    )))
    setMessage('Flujo de firma creado')
  })

  const isBusy = busy !== null

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-5">

        {/* Header */}
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
          <button type="button" onClick={() => void loadFolders()} disabled={isBusy} className="btn-action">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refrescar
          </button>
        </section>

        {/* Notifications */}
        {error && (
          <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </section>
        )}
        {message && (
          <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {message}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">

          {/* Expedientes */}
          <aside className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck2 className="w-5 h-5 text-gold" />
              <h2 className="font-display text-lg text-soft-white">Expedientes</h2>
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-soft-muted">Tipo de operación</label>
                <select
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value as OperationType)}
                  className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-white"
                >
                  {(Object.entries(OPERATION_LABELS) as [OperationType, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => void handleCreateFolder()}
                disabled={busy === 'create-folder'}
                className={`btn-action w-full justify-center ${busy === 'create-folder' ? 'cursor-wait opacity-70' : ''}`}
              >
                {busy === 'create-folder' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : null}
                {busy === 'create-folder' ? 'Creando…' : 'Crear expediente'}
              </button>
            </div>

            <div className="space-y-2">
              {loading && <div className="h-24 rounded-xl bg-navy-darker/50 animate-pulse" />}
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
                  <p className="text-sm font-semibold">{OPERATION_LABELS[folder.operation_type as OperationType] ?? folder.operation_type}</p>
                  <p className="text-xs text-soft-muted">#{folder.id.slice(0, 8)}</p>
                </button>
              ))}
              {!loading && folders.length === 0 && (
                <p className="text-sm text-soft-muted">No hay expedientes. Crea el primero.</p>
              )}
            </div>
          </aside>

          <main className="flex flex-col gap-4 min-w-0">

            {/* Upload form */}
            <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
              <div className="flex items-center gap-2 mb-4">
                <FileUp className="w-5 h-5 text-gold" />
                <div>
                  <h2 className="font-display text-lg text-soft-white">Subir documento cifrado</h2>
                  <p className="text-xs text-soft-muted mt-0.5">
                    {selectedFolder
                      ? `Expediente: ${OPERATION_LABELS[selectedFolder.operation_type as OperationType] ?? selectedFolder.operation_type}`
                      : 'Selecciona un expediente de la lista'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)_auto] lg:items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-soft-muted">
                    Nombre del documento <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Nota simple Calle Mayor 5"
                    className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-white placeholder:text-soft-muted/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-soft-muted">
                    Tipo de documento <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={!selectedFolder}
                    className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-white disabled:opacity-40"
                  >
                    {availableCategories.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-soft-muted">
                    Archivo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-muted"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleUpload()}
                  disabled={!selectedFolder || busy === 'upload'}
                  className={`btn-action self-end ${busy === 'upload' ? 'cursor-wait opacity-70' : ''}`}
                >
                  {busy === 'upload' ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                  {busy === 'upload' ? 'Subiendo…' : 'Subir'}
                </button>
              </div>
            </section>

            {/* Document list */}
            <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-soft-subtle/50">
                <div>
                  <h2 className="font-display text-lg text-soft-white">Documentos del expediente</h2>
                  <p className="text-xs text-soft-muted">
                    {selectedFolder
                      ? OPERATION_LABELS[selectedFolder.operation_type as OperationType] ?? selectedFolder.operation_type
                      : 'Selecciona o crea un expediente'}
                  </p>
                </div>
              </div>
              <div className="divide-y divide-soft-subtle/40">
                {documents.map((document) => {
                  const rejected = document.compliance_status === 'rejected'
                  const immutable = document.legal_metadata?.immutable === true
                  const catLabel = availableCategories.find((c) => c.value === document.document_category)?.label ?? document.document_category
                  return (
                    <article key={document.id} className="p-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-soft-white truncate">{document.title}</h3>
                          <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClass(document.compliance_status)}`}>
                            {document.compliance_status}
                          </span>
                          {immutable && (
                            <span className="rounded-full border border-blue-light/30 bg-blue-light/10 px-2 py-0.5 text-xs text-blue-light">
                              inmutable
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-soft-muted mt-1">
                          {catLabel} · {Math.round(document.file_size_bytes / 1024)} KB
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleValidate(document.id)}
                          disabled={immutable || busy === `validate-${document.id}`}
                          className={`btn-action !h-10 ${busy === `validate-${document.id}` ? 'cursor-wait opacity-70' : ''}`}
                        >
                          {busy === `validate-${document.id}`
                            ? <RefreshCw className="w-4 h-4 animate-spin" />
                            : <ShieldAlert className="w-4 h-4" />}
                          Validar con Advisor AI
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleSendToSignature(document)}
                          disabled={rejected || immutable || busy === `sign-${document.id}`}
                          className={`btn-action !h-10 disabled:opacity-40 disabled:cursor-not-allowed ${busy === `sign-${document.id}` ? 'cursor-wait opacity-70' : ''}`}
                        >
                          {busy === `sign-${document.id}`
                            ? <RefreshCw className="w-4 h-4 animate-spin" />
                            : <Send className="w-4 h-4" />}
                          Enviar a firma
                        </button>
                      </div>
                    </article>
                  )
                })}
                {documents.length === 0 && (
                  <p className="p-6 text-sm text-soft-muted">No hay documentos en este expediente.</p>
                )}
              </div>
            </section>
          </main>
        </section>
      </div>
    </div>
  )
}
