import { authFetch } from './auth-fetch'
import { buildBackendUrl } from './backend-url'

export type DataLabAccessStatus = 'submitted' | 'under_review' | 'approved' | 'rejected'
export type DataLabProfileType = 'partner' | 'client' | 'investor' | 'other'
export type DataLabScope = 'market_brief' | 'partner_intelligence' | 'client_pack' | 'strategic_overview'
export type DataLabAccessTier = 'limited' | 'standard' | 'strategic'

export interface DataLabPackItem {
  id: string
  pack_label: string
  notebook_name: string
  market_scope: string
  zone_scope: string[]
  language_code: string
  source_mode: string
  status: string
  is_default: boolean
  age_hours?: number | null
}

export interface DataLabAccessRequestItem {
  id: string
  org_id: string
  full_name: string
  email: string
  company_name: string | null
  profile_type: DataLabProfileType
  requested_scope: DataLabScope
  intended_use: string
  geography_focus: string[]
  languages: string[]
  website_url: string | null
  notes: string | null
  status: DataLabAccessStatus
  approved_scope: DataLabScope | null
  review_notes: string | null
  reviewed_by_user_id: string | null
  reviewed_at: string | null
  decision_email_sent_at: string | null
  created_at: string
  updated_at: string
  workspace?: {
    id: string
    workspace_status: 'invited' | 'active' | 'paused'
    access_tier: DataLabAccessTier
    approved_scope: DataLabScope
    launch_url: string
    last_seen_at: string | null
  } | null
}

export interface DataLabAccessSummary {
  total: number
  submitted: number
  under_review: number
  approved: number
  rejected: number
  by_profile: Record<string, number>
  by_scope: Record<string, number>
}

export interface DataLabWorkspacePayload {
  id: string
  request_id: string
  requester_name: string
  company_name: string | null
  profile_type: DataLabProfileType
  requested_scope: DataLabScope
  approved_scope: DataLabScope
  access_tier: DataLabAccessTier
  workspace_status: 'invited' | 'active' | 'paused'
  headline: string
  intended_use: string
  geography_focus: string[]
  languages: string[]
  next_steps: string[]
  resources: Array<{ label: string; description: string }>
  packs: DataLabPackItem[]
  last_seen_at: string | null
}

export async function createPublicDataLabAccessRequest(payload: {
  full_name: string
  email: string
  company_name?: string
  profile_type: DataLabProfileType
  requested_scope: DataLabScope
  intended_use: string
  geography_focus: string[]
  languages: string[]
  website_url?: string
  notes?: string
  submission_source?: string
}): Promise<{ status: string; request_id: string }> {
  const response = await fetch(buildBackendUrl('/api/public/data-lab-access-requests'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}

export async function fetchDataLabAccessRequests(params: {
  status?: DataLabAccessStatus | ''
  profile_type?: DataLabProfileType | ''
  q?: string
  limit?: number
} = {}): Promise<{ items: DataLabAccessRequestItem[]; total: number; limit: number; offset: number }> {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.profile_type) search.set('profile_type', params.profile_type)
  if (params.q) search.set('q', params.q)
  if (params.limit) search.set('limit', String(params.limit))
  const response = await authFetch(`/api/intelligence/data-lab-access?${search}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}

export async function fetchDataLabAccessSummary(): Promise<DataLabAccessSummary> {
  const response = await authFetch('/api/intelligence/data-lab-access/summary')
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}

export async function reviewDataLabAccessRequest(
  requestId: string,
  payload: {
    status: DataLabAccessStatus
    review_notes?: string
    access_tier?: DataLabAccessTier
    approved_scope?: DataLabScope
    notify_applicant?: boolean
  },
): Promise<DataLabAccessRequestItem & { notification?: Record<string, unknown> | null }> {
  const response = await authFetch(`/api/intelligence/data-lab-access/${requestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}

export async function fetchPublicDataLabWorkspace(token: string): Promise<DataLabWorkspacePayload> {
  const response = await fetch(buildBackendUrl(`/api/public/data-lab-workspace?token=${encodeURIComponent(token)}`), {
    method: 'GET',
    cache: 'no-store',
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}
