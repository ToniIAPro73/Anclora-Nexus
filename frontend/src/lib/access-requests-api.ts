import { authFetch } from './auth-fetch'

export type AccessRequestProduct = 'synergi' | 'data_lab'
export type AccessRequestSource = 'landing' | 'synergi_app' | 'data_lab_app'
export type AccessRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface DecisionEmailResult {
  status?: string
  transport?: string
  to?: string
  subject?: string
  error?: string
}

export interface AccessRequest {
  id: string
  org_id: string
  product: AccessRequestProduct
  source: AccessRequestSource
  status: AccessRequestStatus
  full_name: string
  email: string
  phone?: string | null
  company?: string | null
  profile_type?: string | null
  service_category?: string | null
  service_summary?: string | null
  intended_use?: string | null
  requested_scope?: string | null
  message?: string | null
  privacy_accepted: boolean
  gdpr_consent: boolean
  submission_language: string
  external_id?: string | null
  captcha_provider?: string | null
  captcha_verified: boolean
  captcha_hostname?: string | null
  reviewed_at?: string | null
  reviewed_by?: string | null
  admin_notes?: string | null
  rejection_reason?: string | null
  invite_token?: string | null
  invite_expires_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  decision_email?: DecisionEmailResult | null
}

export interface AccessRequestFilters {
  status?: AccessRequestStatus | ''
  product?: AccessRequestProduct | ''
  limit?: number
}

export interface AccessRequestReviewPayload {
  reviewed_by: string
  admin_notes?: string
}

export interface AccessRequestRejectPayload extends AccessRequestReviewPayload {
  rejection_reason: string
}

async function readJsonOrThrow(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}

export async function listAccessRequests(filters: AccessRequestFilters = {}): Promise<AccessRequest[]> {
  const search = new URLSearchParams()
  if (filters.status) search.set('status', filters.status)
  if (filters.product) search.set('product', filters.product)
  search.set('limit', String(filters.limit ?? 50))

  const response = await authFetch(`/api/access-requests?${search.toString()}`)
  return readJsonOrThrow(response)
}

export async function getAccessRequest(id: string): Promise<AccessRequest> {
  const response = await authFetch(`/api/access-requests/${encodeURIComponent(id)}`)
  return readJsonOrThrow(response)
}

export async function approveAccessRequest(id: string, payload: AccessRequestReviewPayload): Promise<AccessRequest> {
  const response = await authFetch(`/api/access-requests/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return readJsonOrThrow(response)
}

export async function rejectAccessRequest(id: string, payload: AccessRequestRejectPayload): Promise<AccessRequest> {
  const response = await authFetch(`/api/access-requests/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return readJsonOrThrow(response)
}
