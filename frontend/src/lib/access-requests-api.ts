import { authFetch } from './auth-fetch'

export type AccessRequestProduct = 'synergi' | 'data_lab'
export type AccessRequestSource = 'landing' | 'synergi_app' | 'data_lab_app'
export type AccessRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type AccessRequestDecisionStatus = AccessRequestStatus
export type AccessRequestProvisioningStatus = 'not_started' | 'invite_ready' | 'provisioning_pending' | 'not_applicable'
export type AccessRequestEmailStatus = 'not_applicable' | 'sent' | 'failed' | 'skipped' | 'unknown'

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
  lifecycle?: AccessRequestLifecycle | null
}

export interface AccessRequestLifecycle {
  request_id: string
  status: AccessRequestStatus
  decision_status: AccessRequestDecisionStatus
  provisioning_status: AccessRequestProvisioningStatus
  email_status: AccessRequestEmailStatus
  reviewed_by?: string | null
  reviewed_at?: string | null
  invite_expires_at?: string | null
  retry_available: boolean
  last_event_at?: string | null
}

export interface AccessRequestAttentionItem {
  request_id: string
  reason: string
  severity: 'warning' | 'critical'
  status: AccessRequestStatus
  product: AccessRequestProduct
  source: AccessRequestSource
  email: string
  created_at?: string | null
  reviewed_at?: string | null
  age_hours?: number | null
}

export interface AccessRequestAnalyticsSummary {
  total_requests: number
  pending_count: number
  approved_count: number
  rejected_count: number
  cancelled_count: number
  requests_by_product: Record<string, number>
  requests_by_source: Record<string, number>
  pending_older_than_24h: number
  pending_older_than_72h: number
  average_review_time_hours?: number | null
  decision_email_failed_count: number
  decision_email_unknown_count: number
  retry_available_count: number
  provisioning_attention_count: number
  generated_at: string
  sample_size: number
  sample_limit: number
  is_sampled: boolean
  attention_items: AccessRequestAttentionItem[]
}

export interface AccessRequestAuditEvent {
  id: string
  timestamp?: string | null
  actor_type: string
  actor_id: string
  action: string
  resource_type?: string | null
  resource_id?: string | null
  details: Record<string, unknown>
}

export interface AccessRequestFilters {
  status?: AccessRequestStatus | ''
  product?: AccessRequestProduct | ''
  source?: AccessRequestSource | ''
  email?: string
  created_from?: string
  created_to?: string
  limit?: number
}

export interface AccessRequestReviewPayload {
  admin_notes?: string
}

export interface AccessRequestRejectPayload extends AccessRequestReviewPayload {
  rejection_reason: string
}

async function readJsonOrThrow(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new ApiError(response.status, error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function listAccessRequests(filters: AccessRequestFilters = {}): Promise<AccessRequest[]> {
  const search = new URLSearchParams()
  if (filters.status) search.set('status', filters.status)
  if (filters.product) search.set('product', filters.product)
  if (filters.source) search.set('source', filters.source)
  if (filters.email?.trim()) search.set('email', filters.email.trim())
  if (filters.created_from) search.set('created_from', filters.created_from)
  if (filters.created_to) search.set('created_to', filters.created_to)
  search.set('limit', String(filters.limit ?? 50))

  const response = await authFetch(`/api/access-requests?${search.toString()}`)
  return readJsonOrThrow(response)
}

export async function getAccessRequest(id: string): Promise<AccessRequest> {
  const response = await authFetch(`/api/access-requests/${encodeURIComponent(id)}`)
  return readJsonOrThrow(response)
}

export async function getAccessRequestAudit(id: string): Promise<AccessRequestAuditEvent[]> {
  const response = await authFetch(`/api/access-requests/${encodeURIComponent(id)}/audit`)
  return readJsonOrThrow(response)
}

export async function getAccessRequestLifecycle(id: string): Promise<AccessRequestLifecycle> {
  const response = await authFetch(`/api/access-requests/${encodeURIComponent(id)}/lifecycle`)
  return readJsonOrThrow(response)
}

export async function getAccessRequestAnalyticsSummary(limit = 500): Promise<AccessRequestAnalyticsSummary> {
  const search = new URLSearchParams({ limit: String(limit) })
  const response = await authFetch(`/api/access-requests/analytics/summary?${search.toString()}`)
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

export async function retryAccessRequestDecisionEmail(id: string): Promise<AccessRequest> {
  const response = await authFetch(`/api/access-requests/${encodeURIComponent(id)}/decision-email/retry`, {
    method: 'POST',
  })
  return readJsonOrThrow(response)
}
