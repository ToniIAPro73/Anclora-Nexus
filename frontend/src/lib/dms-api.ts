import supabase from './supabase'
import { buildBackendUrl } from './backend-url'

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

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getJsonHeaders()
  const res = await fetch(buildBackendUrl(path), {
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

  const res = await fetch(buildBackendUrl('/api/dms/documents/upload'), {
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
