import supabase from './supabase'

async function getJsonHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`,
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Authorization': `Bearer ${session?.access_token || ''}`,
  }
}

// DMS calls use the Next.js rewrite proxy (/api/* → Render backend) to avoid
// CORS issues when NEXT_PUBLIC_API_URL points to an absolute Render URL.
async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getJsonHeaders()
  const res = await fetch(path, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail || `DMS API error: ${res.status}`)
  }
  return res.json()
}

export type OperationType = 'compraventa' | 'alquiler_temporada' | 'alquiler_turistico'
export type ComplianceStatus = 'pending' | 'approved' | 'rejected' | 'expired'

export interface DealFolder {
  id: string
  org_id: string
  operation_type: OperationType
  folder_status: string
  created_at?: string
}

export interface DealDocument {
  id: string
  folder_id: string
  org_id: string
  title: string
  document_category: string
  file_mime_type: string
  file_size_bytes: number
  sha256_hash?: string
  compliance_status: ComplianceStatus
  legal_metadata?: Record<string, unknown>
  created_at?: string
}

export interface SignatureFlow {
  id?: string
  document_id: string
  flow_status: string
  signer_email: string
  signer_name: string
  signer_role: string
  external_envelope_id?: string
}

export async function listDealFolders(): Promise<DealFolder[]> {
  return apiRequest('/api/dms/folders')
}

export async function createDealFolder(payload: {
  operation_type: OperationType
  property_id?: string | null
  client_lead_id?: string | null
  seller_id?: string | null
}): Promise<DealFolder> {
  return apiRequest('/api/dms/folders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listDocuments(folderId: string): Promise<DealDocument[]> {
  return apiRequest(`/api/dms/folders/${folderId}/documents`)
}

export async function uploadDocument(payload: {
  folderId: string
  title: string
  documentCategory: string
  file: File
}): Promise<DealDocument> {
  const headers = await getAuthHeaders()
  const form = new FormData()
  form.append('folder_id', payload.folderId)
  form.append('title', payload.title)
  form.append('document_category', payload.documentCategory)
  form.append('file', payload.file)

  const res = await fetch('/api/dms/documents/upload', {
    method: 'POST',
    headers,
    body: form,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail || `DMS upload error: ${res.status}`)
  }
  return res.json()
}

export async function validateDocument(documentId: string): Promise<{
  document: DealDocument
  validation: Record<string, unknown>
}> {
  return apiRequest(`/api/dms/documents/${documentId}/validate`, {
    method: 'POST',
    body: JSON.stringify({ jurisdiction: 'ES-IB', language: 'es' }),
  })
}

export async function createSignatureFlow(documentId: string, payload: {
  signer_email: string
  signer_name: string
  signer_role: 'buyer' | 'seller' | 'agent' | 'witness'
}): Promise<SignatureFlow> {
  return apiRequest(`/api/dms/documents/${documentId}/signature-flows`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getDocumentWorkspace(documentId: string): Promise<{
  document: DealDocument
  download_url: string
  signature_flow: SignatureFlow | null
}> {
  return apiRequest(`/api/dms/documents/${documentId}/workspace`)
}

// ── Template library ───────────────────────────────────────────────────────────

export type TemplateDocumentType =
  | 'arras_penitenciales'
  | 'contrato_compraventa'
  | 'contrato_temporada'
  | 'contrato_alquiler_turistico'
  | 'kyc_cliente'
  | 'mandato_exclusiva'
  | 'oferta_compra'
  | 'generico'

export type TemplateStatus = 'draft' | 'published' | 'deprecated'

export interface DocumentTemplate {
  id: string
  org_id: string
  name: string
  template_document_type: TemplateDocumentType
  description?: string
  jurisdiction: string
  language: string
  is_global: boolean
  status: TemplateStatus
  created_at?: string
  published_at?: string
}

export interface TemplateVersion {
  id: string
  template_id: string
  version_number: number
  sha256_hash: string
  canonical_text?: string
  change_summary?: string
  immutable: boolean
  created_at?: string
}

export interface TemplateField {
  id: string
  template_version_id: string
  field_key: string
  label: string
  field_type: 'text' | 'number' | 'date' | 'amount' | 'boolean' | 'select'
  required: boolean
  default_value?: string
  validation_rule?: string
  source_path?: string
}

export async function listTemplates(params?: {
  document_type?: TemplateDocumentType
  status?: TemplateStatus
}): Promise<DocumentTemplate[]> {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]).toString()
    : ''
  return apiRequest(`/api/dms/templates/${qs}`)
}

export async function createTemplate(payload: {
  name: string
  template_document_type: TemplateDocumentType
  description?: string
  jurisdiction?: string
  language?: string
}): Promise<DocumentTemplate> {
  return apiRequest('/api/dms/templates/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getTemplate(templateId: string): Promise<DocumentTemplate> {
  return apiRequest(`/api/dms/templates/${templateId}`)
}

export async function publishTemplate(templateId: string): Promise<DocumentTemplate> {
  return apiRequest(`/api/dms/templates/${templateId}/publish`, { method: 'PATCH' })
}

export async function listTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
  return apiRequest(`/api/dms/templates/${templateId}/versions`)
}

export async function uploadTemplateVersion(templateId: string, file: File, changeSummary?: string): Promise<TemplateVersion> {
  const headers = await getAuthHeaders()
  const form = new FormData()
  form.append('file', file)
  if (changeSummary) form.append('change_summary', changeSummary)
  const res = await fetch(`/api/dms/templates/${templateId}/versions`, {
    method: 'POST',
    headers,
    body: form,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail || `Template version upload error: ${res.status}`)
  }
  return res.json()
}

export async function listTemplateFields(templateId: string, versionId: string): Promise<TemplateField[]> {
  return apiRequest(`/api/dms/templates/${templateId}/versions/${versionId}/fields`)
}

// ── Parties ────────────────────────────────────────────────────────────────────

export type PartyRole = 'buyer' | 'seller' | 'agent' | 'guarantor' | 'co_buyer' | 'co_seller' | 'notary'

export interface FolderParty {
  id: string
  folder_id: string
  org_id: string
  party_role: PartyRole
  full_name: string
  dni_nie_passport?: string
  email?: string
  phone?: string
  address?: string
  nationality?: string
  is_company: boolean
  company_name?: string
  company_cif?: string
  kyc_verified: boolean
  kyc_verified_at?: string
  created_at?: string
}

export async function listParties(folderId: string): Promise<FolderParty[]> {
  return apiRequest(`/api/dms/folders/${folderId}/parties`)
}

export async function createParty(folderId: string, payload: {
  party_role: PartyRole
  full_name: string
  dni_nie_passport?: string
  email?: string
  phone?: string
  address?: string
  nationality?: string
  is_company?: boolean
  company_name?: string
  company_cif?: string
}): Promise<FolderParty> {
  return apiRequest(`/api/dms/folders/${folderId}/parties`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ── Generated documents ────────────────────────────────────────────────────────

export type DocumentStatus = 'draft' | 'review_required' | 'approved' | 'signed' | 'archived'

export interface GeneratedDocument {
  id: string
  folder_id: string
  org_id: string
  template_version_id: string
  title: string
  status: DocumentStatus
  generation_payload: Record<string, unknown>
  storage_path?: string
  generated_at?: string
  created_at?: string
}

export async function generateDocument(folderId: string, payload: {
  template_version_id: string
  title: string
  generation_payload: Record<string, unknown>
}): Promise<GeneratedDocument> {
  return apiRequest(`/api/dms/folders/${folderId}/generate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listGeneratedDocuments(folderId: string): Promise<GeneratedDocument[]> {
  return apiRequest(`/api/dms/folders/${folderId}/generated`)
}

export async function getGeneratedDocument(generatedId: string): Promise<GeneratedDocument> {
  return apiRequest(`/api/dms/${generatedId}`)
}

// ── Legal review ───────────────────────────────────────────────────────────────

export async function triggerAutoReview(generatedId: string, payload: {
  document_text: string
  document_type?: string
  canonical_template?: string
  jurisdiction?: string
  language?: string
}): Promise<Record<string, unknown>> {
  return apiRequest(`/api/dms/generated/${generatedId}/review/auto`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listReviewDecisions(generatedId: string): Promise<Record<string, unknown>[]> {
  return apiRequest(`/api/dms/generated/${generatedId}/review`)
}

// ── Retention policies ─────────────────────────────────────────────────────────

export interface RetentionPolicy {
  id: string
  org_id: string
  template_document_type?: TemplateDocumentType
  retention_days: number
  auto_archive: boolean
  auto_delete: boolean
  created_at?: string
}

export async function listRetentionPolicies(): Promise<RetentionPolicy[]> {
  return apiRequest('/api/dms/retention/')
}

export async function createRetentionPolicy(payload: {
  template_document_type?: TemplateDocumentType
  retention_days?: number
  auto_archive?: boolean
}): Promise<RetentionPolicy> {
  return apiRequest('/api/dms/retention/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
