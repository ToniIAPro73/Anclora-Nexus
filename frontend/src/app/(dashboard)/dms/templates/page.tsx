'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Filter,
  Globe,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Tag,
  UploadCloud,
  X,
  XCircle,
} from 'lucide-react'

import {
  createTemplate,
  listTemplates,
  publishTemplate,
  uploadTemplateVersion,
  type DocumentTemplate,
  type TemplateDocumentType,
} from '@/lib/dms-api'

// ── Constants ──────────────────────────────────────────────────────────────────

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
  { value: 'inventario_estado', label: 'Inventario / estado del inmueble' },
  { value: 'hoja_visita', label: 'Hoja de visita' },
  { value: 'declaracion_fondos', label: 'Declaración de origen de fondos' },
  { value: 'informacion_privacidad', label: 'Información de privacidad' },
  { value: 'generico', label: 'Genérico' },
]

const LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'ca', label: 'Català' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'sv', label: 'Svenska' },
  { code: 'da', label: 'Dansk' },
  { code: 'no', label: 'Norsk' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function statusClass(status: string): string {
  if (status === 'published') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  if (status === 'deprecated') return 'border-red-500/30 bg-red-500/10 text-red-300'
  return 'border-amber-500/30 bg-amber-500/10 text-amber-200'
}

function statusIcon(status: string) {
  if (status === 'published') return <CheckCircle className="h-3.5 w-3.5" />
  if (status === 'deprecated') return <XCircle className="h-3.5 w-3.5" />
  return <Lock className="h-3.5 w-3.5" />
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="text-[10px] font-semibold uppercase tracking-wider text-soft-muted">
      {label}{required && <span className="ml-0.5 text-gold">*</span>}
    </label>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────────

type TemplateVersion = {
  id: string
  version_number: number
  validation_status?: string
  content_hash?: string
  change_summary?: string
  created_at?: string
  language?: string
}

type TemplateWithVersions = DocumentTemplate & {
  versions?: TemplateVersion[]
}

// ── Template detail panel ──────────────────────────────────────────────────────

function TemplatePlaceholders({ placeholders }: { placeholders?: string[] }) {
  if (!placeholders || placeholders.length === 0) return null
  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-soft-muted flex items-center gap-1.5">
        <Tag className="h-3 w-3" /> Placeholders ({placeholders.length})
      </p>
      <div className="flex flex-wrap gap-1.5">
        {placeholders.map((p) => (
          <span key={p} className="rounded-md border border-blue-light/20 bg-blue-light/5 px-2 py-0.5 font-mono text-[10px] text-blue-light/80">
            {`{{${p}}}`}
          </span>
        ))}
      </div>
    </div>
  )
}

function VersionRow({ version }: { version: TemplateVersion }) {
  const vStatus = version.validation_status ?? 'draft'
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-base px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-mono text-soft-muted">v{version.version_number}</span>
        <span className="text-xs text-soft-muted truncate">{version.change_summary ?? 'Sin descripción'}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {version.language && (
          <span className="rounded border border-border-subtle px-1.5 py-0.5 text-[10px] text-soft-subtle">
            {version.language}
          </span>
        )}
        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${statusClass(vStatus)}`}>
          {vStatus}
        </span>
        {version.content_hash && (
          <span className="hidden font-mono text-[9px] text-soft-subtle xl:block" title={version.content_hash}>
            #{version.content_hash.slice(0, 8)}
          </span>
        )}
      </div>
    </div>
  )
}

function TemplateDetailPanel({
  template,
  onPublish,
  onRetire,
  busy,
}: {
  template: TemplateWithVersions
  onPublish: (id: string) => void
  onRetire: (id: string) => void
  busy: string | null
}) {
  const [versionsOpen, setVersionsOpen] = useState(true)
  const versions: TemplateVersion[] = template.versions ?? []
  const canPublish = template.status === 'draft' || template.status === 'review_required'
  const canRetire = template.status === 'published'
  const typeLabel = TEMPLATE_TYPES.find((t) => t.value === template.template_document_type)?.label ?? template.template_document_type
  const langLabel = LANGUAGES.find((l) => l.code === template.language)?.label ?? template.language

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-soft-white truncate">{template.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-soft-muted">
            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{typeLabel}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{langLabel}</span>
            {template.jurisdiction && (
              <>
                <span>·</span>
                <span>{template.jurisdiction}</span>
              </>
            )}
          </div>
        </div>
        <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs shrink-0 ${statusClass(template.status)}`}>
          {statusIcon(template.status)}
          {template.status}
        </span>
      </div>

      {/* Publish guards */}
      {canPublish && (
        <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-3 text-xs text-yellow-300 space-y-1">
          <p className="font-semibold">Checklist antes de publicar:</p>
          <ul className="ml-3 space-y-0.5 text-yellow-200/80">
            <li>• La plantilla tiene al menos una versión subida</li>
            <li>• Los placeholders están en snake_case y son consistentes</li>
            <li>• Ha sido revisada por asesor jurídico</li>
            <li>• El hash SHA-256 coincide con el fichero canónico</li>
          </ul>
        </div>
      )}

      {/* Retire warning */}
      {canRetire && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">
          <p className="font-semibold">Efecto de retirar:</p>
          <p className="mt-0.5 text-red-200/80">
            La plantilla pasará a estado <em>deprecated</em>. Los documentos ya generados no se ven afectados,
            pero no se podrán generar nuevos documentos a partir de ella.
          </p>
        </div>
      )}

      {/* Placeholders */}
      <TemplatePlaceholders
        placeholders={(template as unknown as { placeholders?: string[] }).placeholders}
      />

      {/* Versions */}
      <div>
        <button
          onClick={() => setVersionsOpen((v) => !v)}
          className="flex items-center gap-2 text-xs font-semibold text-soft-muted hover:text-soft-white"
        >
          {versionsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          Versiones ({versions.length})
        </button>
        {versionsOpen && (
          <div className="mt-2 space-y-1.5">
            {versions.length === 0 ? (
              <p className="text-xs text-soft-muted italic">Ninguna versión subida aún.</p>
            ) : (
              versions.map((v) => <VersionRow key={v.id} version={v} />)
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {canPublish && (
          <button
            onClick={() => onPublish(template.id)}
            disabled={!!busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/15 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40"
          >
            {busy === `publish-${template.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Publicar
          </button>
        )}
        {canRetire && (
          <button
            onClick={() => onRetire(template.id)}
            disabled={!!busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-40"
          >
            {busy === `retire-${template.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Retirar
          </button>
        )}
      </div>
    </div>
  )
}

// ── Translation coverage matrix ────────────────────────────────────────────────

function TranslationMatrix({ templates }: { templates: DocumentTemplate[] }) {
  const byKey = new Map<string, Set<string>>()
  for (const tpl of templates) {
    const key = tpl.template_document_type ?? 'generico'
    if (!byKey.has(key)) byKey.set(key, new Set())
    byKey.get(key)!.add(tpl.language ?? 'es')
  }
  if (byKey.size === 0) return null
  const types = [...byKey.keys()]
  const langs = LANGUAGES.map((l) => l.code)

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface-elevated">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="p-3 text-left text-soft-muted font-medium">Tipo</th>
            {LANGUAGES.map((l) => (
              <th key={l.code} className="p-3 text-center text-soft-muted font-medium uppercase tracking-wider">{l.code}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle/40">
          {types.map((type) => {
            const available = byKey.get(type)!
            const label = TEMPLATE_TYPES.find((t) => t.value === type)?.label ?? type
            return (
              <tr key={type}>
                <td className="p-3 font-medium text-soft-white truncate max-w-[200px]">{label}</td>
                {langs.map((lang) => (
                  <td key={lang} className="p-3 text-center">
                    {available.has(lang)
                      ? <CheckCircle className="mx-auto h-3.5 w-3.5 text-emerald-400" />
                      : <span className="text-soft-subtle/30">·</span>
                    }
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function DmsTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateWithVersions[]>([])
  const [filterType, setFilterType] = useState<string>('')
  const [filterLang, setFilterLang] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [selected, setSelected] = useState<TemplateWithVersions | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showMatrix, setShowMatrix] = useState(false)
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
      setTemplates(data as TemplateWithVersions[])
      if (!uploadTemplateId && data[0]) setUploadTemplateId(data[0].id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar plantillas')
    } finally {
      setBusy(null)
    }
  }, [uploadTemplateId])

  useEffect(() => { void loadTemplates() }, [loadTemplates])

  const runAction = async (key: string, fn: () => Promise<void>) => {
    setBusy(key)
    setError(null)
    setMessage(null)
    try { await fn() } catch (err) {
      setError(err instanceof Error ? err.message : 'Acción fallida')
    } finally { setBusy(null) }
  }

  const handleCreate = () => runAction('create', async () => {
    if (!name.trim()) throw new Error('Indica el nombre de la plantilla')
    const template = await createTemplate({ name: name.trim(), template_document_type: templateType })
    setTemplates((current) => [template as TemplateWithVersions, ...current])
    setUploadTemplateId(template.id)
    setName('')
    setShowCreate(false)
    setMessage('Plantilla creada en borrador')
  })

  const handleUpload = () => runAction('upload', async () => {
    if (!uploadTemplateId || !file) throw new Error('Selecciona plantilla y archivo')
    await uploadTemplateVersion(uploadTemplateId, file, 'Nueva versión cargada')
    setFile(null)
    setMessage('Versión cargada. Revisa y publica cuando esté lista.')
    void loadTemplates()
  })

  const handlePublish = (templateId: string) => runAction(`publish-${templateId}`, async () => {
    const updated = await publishTemplate(templateId)
    setTemplates((current) => current.map((t) => t.id === updated.id ? { ...t, ...updated } : t))
    setSelected((prev) => prev?.id === updated.id ? { ...prev, ...updated } : prev)
    setMessage('Plantilla publicada correctamente')
  })

  const handleRetire = async (templateId: string) => {
    await runAction(`retire-${templateId}`, async () => {
      await fetch(`/api/dms/templates/${templateId}/retire`, { method: 'POST', credentials: 'include' })
      setTemplates((current) =>
        current.map((t) => t.id === templateId ? { ...t, status: 'deprecated' } : t),
      )
      setSelected((prev) => prev?.id === templateId ? { ...prev, status: 'deprecated' } : prev)
      setMessage('Plantilla retirada. Ya no aparecerá para nuevos expedientes.')
    })
  }

  // Filtered list
  const filtered = templates.filter((t) => {
    if (filterType && t.template_document_type !== filterType) return false
    if (filterLang && t.language !== filterLang) return false
    if (filterStatus && t.status !== filterStatus) return false
    return true
  })

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-5">

        {/* Header */}
        <section className="flex flex-col gap-4 border-b border-soft-subtle/50 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <Link href="/dms" className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-2 text-soft-muted transition-all hover:border-blue-light/50 hover:text-soft-white">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="page-title">Biblioteca de plantillas</h1>
            </div>
            <p className="page-subtitle">18 familias canónicas · 11 idiomas · 198 variantes</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowMatrix((v) => !v)} className="btn-action">
              <Globe className="h-4 w-4" />
              {showMatrix ? 'Ocultar' : 'Cobertura'} multilingüe
            </button>
            <button onClick={() => setShowCreate((v) => !v)} className="btn-action">
              <Plus className="h-4 w-4" />
              Nueva plantilla
            </button>
            <button onClick={() => void loadTemplates()} className="btn-action">
              <RefreshCw className={`h-4 w-4 ${busy === 'load' ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </section>

        {error && (
          <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300 flex items-start gap-2">
            <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </section>
        )}
        {message && (
          <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300 flex items-start gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{message}</span>
          </section>
        )}

        {/* Translation coverage matrix */}
        {showMatrix && <TranslationMatrix templates={templates} />}

        {/* Create form (collapsible) */}
        {showCreate && (
          <section className="rounded-2xl border border-border-subtle bg-surface-elevated p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-soft-white">Nueva plantilla en borrador</h2>
              <button onClick={() => setShowCreate(false)} className="text-soft-muted hover:text-soft-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5 sm:col-span-2">
                <FieldLabel label="Nombre" required />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre descriptivo..."
                  className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2.5 text-sm text-soft-white placeholder:text-soft-muted/40 focus:border-blue-light/60 focus:outline-none"
                />
              </div>
              <div className="grid gap-1.5">
                <FieldLabel label="Tipo" required />
                <select
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value as TemplateDocumentType)}
                  className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2.5 text-sm text-soft-white focus:border-blue-light/60 focus:outline-none"
                >
                  {TEMPLATE_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <button
                onClick={() => void handleCreate()}
                disabled={busy === 'create'}
                className="flex items-center justify-center gap-2 rounded-xl bg-gold-light/15 py-2.5 text-sm font-medium text-gold-light hover:bg-gold-light/25 disabled:opacity-40 sm:col-span-3"
              >
                {busy === 'create' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Crear borrador
              </button>
            </div>

            <div className="mt-5 border-t border-border-subtle pt-4 grid gap-3 sm:grid-cols-3">
              <h3 className="text-sm font-semibold text-soft-muted sm:col-span-3">Subir versión a una plantilla existente</h3>
              <div className="grid gap-1.5 sm:col-span-2">
                <FieldLabel label="Plantilla destino" required />
                <select
                  value={uploadTemplateId}
                  onChange={(e) => setUploadTemplateId(e.target.value)}
                  className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2.5 text-sm text-soft-white focus:border-blue-light/60 focus:outline-none"
                >
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="grid gap-1.5">
                <FieldLabel label="Archivo" required />
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="rounded-xl border border-soft-subtle bg-navy-darker px-3 py-2 text-sm text-soft-muted file:mr-3 file:rounded-lg file:border-0 file:bg-navy-deep file:px-3 file:py-1 file:text-xs file:text-soft-muted"
                />
              </div>
              <button
                onClick={() => void handleUpload()}
                disabled={busy === 'upload'}
                className="flex items-center justify-center gap-2 rounded-xl border border-border-subtle py-2.5 text-sm text-soft-muted hover:text-soft-white disabled:opacity-40 sm:col-span-3"
              >
                {busy === 'upload' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                Subir versión
              </button>
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-soft-muted" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-border-subtle bg-surface-base px-2 py-1.5 text-xs text-soft-white focus:outline-none"
          >
            <option value="">Todos los tipos</option>
            {TEMPLATE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="rounded-lg border border-border-subtle bg-surface-base px-2 py-1.5 text-xs text-soft-white focus:outline-none"
          >
            <option value="">Todos los idiomas</option>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-border-subtle bg-surface-base px-2 py-1.5 text-xs text-soft-white focus:outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicada</option>
            <option value="deprecated">Retirada</option>
          </select>
          {(filterType || filterLang || filterStatus) && (
            <button
              onClick={() => { setFilterType(''); setFilterLang(''); setFilterStatus('') }}
              className="flex items-center gap-1 text-xs text-soft-muted hover:text-soft-white"
            >
              <X className="h-3 w-3" /> Limpiar filtros
            </button>
          )}
          <span className="ml-auto text-xs text-soft-muted">{filtered.length} de {templates.length} plantillas</span>
        </section>

        {/* Two-column layout: list + detail */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
          {/* Template list */}
          <div className="rounded-2xl border border-border-subtle bg-surface-elevated overflow-hidden">
            <div className="divide-y divide-border-subtle/40">
              {filtered.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelected(tpl)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition hover:bg-surface-base ${selected?.id === tpl.id ? 'bg-surface-base border-l-2 border-gold-light' : ''}`}
                >
                  <FileText className={`h-4 w-4 shrink-0 ${selected?.id === tpl.id ? 'text-gold-light' : 'text-soft-subtle'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-soft-white">{tpl.name}</p>
                    <p className="text-xs text-soft-muted">
                      {TEMPLATE_TYPES.find((t) => t.value === tpl.template_document_type)?.label ?? tpl.template_document_type}
                      {tpl.language && ` · ${tpl.language.toUpperCase()}`}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] shrink-0 ${statusClass(tpl.status)}`}>
                    {statusIcon(tpl.status)}
                    {tpl.status}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center gap-2 p-8 text-center">
                  <FileText className="h-8 w-8 text-soft-subtle/30" />
                  <p className="text-sm text-soft-muted">No hay plantillas con estos filtros.</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail panel */}
          {selected ? (
            <TemplateDetailPanel
              template={selected}
              onPublish={handlePublish}
              onRetire={handleRetire}
              busy={busy}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border-subtle bg-surface-elevated py-16 text-center">
              <FileText className="h-10 w-10 text-soft-subtle/20" />
              <p className="text-sm text-soft-muted">Selecciona una plantilla para ver sus detalles, versiones y opciones de publicación.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
