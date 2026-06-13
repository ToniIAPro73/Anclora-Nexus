'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Plus, RefreshCw, UploadCloud } from 'lucide-react'

import {
  createTemplate,
  listTemplates,
  publishTemplate,
  uploadTemplateVersion,
  type DocumentTemplate,
  type TemplateDocumentType,
} from '@/lib/dms-api'

const TEMPLATE_TYPES: { value: TemplateDocumentType; label: string }[] = [
  { value: 'arras_penitenciales', label: 'Arras penitenciales' },
  { value: 'contrato_compraventa', label: 'Contrato de compraventa' },
  { value: 'oferta_compra', label: 'Oferta de compra' },
  { value: 'reserva', label: 'Contrato de reserva / señal' },
  { value: 'nota_encargo', label: 'Nota de encargo' },
  { value: 'contrato_temporada', label: 'Contrato de temporada' },
  { value: 'contrato_arrendamiento', label: 'Contrato de arrendamiento' },
  { value: 'contrato_alquiler_turistico', label: 'Contrato de alquiler turístico' },
  { value: 'recibo_fianza', label: 'Recibo de fianza' },
  { value: 'acta_entrega_llaves', label: 'Acta de entrega de llaves' },
  { value: 'mandato_exclusiva', label: 'Mandato de exclusiva' },
  { value: 'kyc_cliente', label: 'KYC — Identificación de cliente' },
  { value: 'acuerdo_confidencialidad', label: 'Acuerdo de confidencialidad' },
  { value: 'generico', label: 'Genérico' },
]

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="text-[10px] font-semibold uppercase tracking-wider text-soft-muted">
      {label}{required && <span className="ml-0.5 text-gold">*</span>}
    </label>
  )
}

function statusClass(status: string): string {
  if (status === 'published') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  if (status === 'deprecated') return 'border-red-500/30 bg-red-500/10 text-red-300'
  return 'border-amber-500/30 bg-amber-500/10 text-amber-200'
}

export default function DmsTemplatesPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [name, setName] = useState('')
  const [templateType, setTemplateType] = useState<TemplateDocumentType>('contrato_compraventa')
  const [uploadTemplateId, setUploadTemplateId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    setBusy('load')
    setError(null)
    try {
      const data = await listTemplates()
      setTemplates(data)
      setUploadTemplateId((current) => current || data[0]?.id || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar plantillas')
    } finally {
      setBusy(null)
    }
  }, [])

  useEffect(() => { void loadTemplates() }, [loadTemplates])

  const runAction = async (key: string, fn: () => Promise<void>) => {
    setBusy(key)
    setError(null)
    setMessage(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Acción de plantilla fallida')
    } finally {
      setBusy(null)
    }
  }

  const handleCreate = () => runAction('create', async () => {
    if (!name.trim()) throw new Error('Indica el nombre de la plantilla')
    const template = await createTemplate({ name: name.trim(), template_document_type: templateType })
    setTemplates((current) => [template, ...current])
    setUploadTemplateId(template.id)
    setName('')
    setMessage('Plantilla creada en borrador')
  })

  const handleUpload = () => runAction('upload', async () => {
    if (!uploadTemplateId || !file) throw new Error('Selecciona plantilla y archivo')
    await uploadTemplateVersion(uploadTemplateId, file, 'Nueva versión cargada desde biblioteca DMS')
    setFile(null)
    setMessage('Versión cargada. Publícala tras revisión legal.')
  })

  const handlePublish = (templateId: string) => runAction(`publish-${templateId}`, async () => {
    const template = await publishTemplate(templateId)
    setTemplates((current) => current.map((item) => item.id === template.id ? template : item))
    setMessage('Plantilla publicada')
  })

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-5">
        <section className="flex flex-col gap-4 border-b border-soft-subtle/50 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <Link href="/dms" className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-2 text-soft-muted transition-all hover:border-blue-light/50 hover:text-soft-white">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="page-title">Biblioteca de plantillas</h1>
            </div>
            <p className="page-subtitle">Control de versiones, publicación y disponibilidad para expedientes.</p>
          </div>
          <button type="button" onClick={() => void loadTemplates()} className="btn-action">
            <RefreshCw className={`h-4 w-4 ${busy === 'load' ? 'animate-spin' : ''}`} />
            Refrescar
          </button>
        </section>

        {error && <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</section>}
        {message && <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{message}</section>}

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
            <h2 className="mb-4 font-display text-lg text-soft-white">Nueva plantilla</h2>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <FieldLabel label="Nombre" required />
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="—" className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2.5 text-sm text-soft-white placeholder:text-soft-muted/40 focus:border-blue-light/60 focus:outline-none" />
              </div>
              <div className="grid gap-1.5">
                <FieldLabel label="Tipo de documento" required />
                <select value={templateType} onChange={(event) => setTemplateType(event.target.value as TemplateDocumentType)} className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2.5 text-sm text-soft-white focus:border-blue-light/60 focus:outline-none">
                  {TEMPLATE_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => void handleCreate()} disabled={busy === 'create'} className="btn-action justify-center">
                <Plus className="h-4 w-4" />
                Crear borrador
              </button>
            </div>

            <h2 className="mb-4 mt-8 font-display text-lg text-soft-white">Subir versión</h2>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <FieldLabel label="Plantilla" required />
                <select value={uploadTemplateId} onChange={(event) => setUploadTemplateId(event.target.value)} className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2.5 text-sm text-soft-white focus:border-blue-light/60 focus:outline-none">
                  {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                </select>
              </div>
              <div className="grid gap-1.5">
                <FieldLabel label="Archivo" required />
                <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-muted file:mr-3 file:rounded-lg file:border-0 file:bg-navy-deep file:px-3 file:py-1 file:text-xs file:text-soft-muted" />
              </div>
              <button type="button" onClick={() => void handleUpload()} disabled={busy === 'upload'} className="btn-action justify-center">
                <UploadCloud className="h-4 w-4" />
                Subir versión
              </button>
            </div>
          </aside>

          <main className="rounded-2xl border border-soft-subtle bg-navy-surface/35">
            <div className="border-b border-soft-subtle/50 p-4">
              <h2 className="font-display text-lg text-soft-white">Plantillas</h2>
            </div>
            <div className="divide-y divide-soft-subtle/40">
              {templates.map((template) => (
                <article key={template.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText className="h-4 w-4 text-gold" />
                      <h3 className="truncate font-semibold text-soft-white">{template.name}</h3>
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClass(template.status)}`}>{template.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-soft-muted">{template.template_document_type} · {template.jurisdiction} · {template.language}</p>
                  </div>
                  <button type="button" onClick={() => void handlePublish(template.id)} disabled={template.status === 'published' || busy === `publish-${template.id}`} className="btn-action h-10! disabled:cursor-not-allowed disabled:opacity-40">
                    Publicar
                  </button>
                </article>
              ))}
              {templates.length === 0 && <p className="p-6 text-sm text-soft-muted">No hay plantillas en la biblioteca.</p>}
            </div>
          </main>
        </section>
      </div>
    </div>
  )
}
