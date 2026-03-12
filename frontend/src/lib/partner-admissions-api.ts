import { authFetch } from './auth-fetch'
import { buildBackendUrl } from './backend-url'

export type PartnerAdmissionStatus = 'submitted' | 'under_review' | 'accepted' | 'rejected'
export type PartnerServiceCategory = 'real_estate' | 'professional' | 'luxury' | 'eco' | 'other'

export interface PartnerAdmissionItem {
  id: string
  org_id: string
  full_name: string
  email: string
  phone: string | null
  company_name: string | null
  service_category: PartnerServiceCategory
  service_summary: string
  collaboration_pitch: string | null
  coverage_areas: string[]
  languages: string[]
  website_url: string | null
  linkedin_url: string | null
  instagram_url: string | null
  sustainability_focus: boolean
  sustainability_notes: string | null
  submission_source: string
  status: PartnerAdmissionStatus
  review_notes: string | null
  reviewed_by_user_id: string | null
  reviewed_at: string | null
  decision_email_sent_at: string | null
  created_at: string
  updated_at: string
  workspace?: {
    id: string
    workspace_status: 'invited' | 'active' | 'paused'
    partner_tier: 'approved' | 'preferred' | 'strategic'
    launch_url: string
    opportunities_count: number
    last_seen_at: string | null
  } | null
}

export interface PartnerAdmissionSummary {
  total: number
  submitted: number
  under_review: number
  accepted: number
  rejected: number
  eco_focus: number
  by_category: Record<string, number>
}

export interface PartnerAdmissionListResponse {
  items: PartnerAdmissionItem[]
  total: number
  limit: number
  offset: number
}

export interface PublicPartnerAdmissionPayload {
  full_name: string
  email: string
  phone?: string
  company_name?: string
  service_category: PartnerServiceCategory
  service_summary: string
  collaboration_pitch?: string
  coverage_areas: string[]
  languages: string[]
  website_url?: string
  linkedin_url?: string
  instagram_url?: string
  sustainability_focus: boolean
  sustainability_notes?: string
  privacy_accepted: boolean
  newsletter_opt_in: boolean
  captcha_provider?: string
  captcha_token?: string
  submission_language?: string
  submission_source?: string
}

function formatApiError(error: unknown, fallbackStatus: number): string {
  if (!error || typeof error !== 'object') {
    return `API Error: ${fallbackStatus}`
  }

  const detail = (error as { detail?: unknown }).detail
  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const loc = Array.isArray((item as { loc?: unknown[] }).loc)
          ? (item as { loc?: unknown[] }).loc!.filter(Boolean).join('.')
          : null
        const msg = typeof (item as { msg?: unknown }).msg === 'string'
          ? (item as { msg?: string }).msg
          : null
        if (loc && msg) return `${loc}: ${msg}`
        return msg || loc || null
      })
      .filter(Boolean)

    if (messages.length) {
      return messages.join(' | ')
    }
  }

  return `API Error: ${fallbackStatus}`
}

export async function createPublicPartnerAdmission(payload: PublicPartnerAdmissionPayload): Promise<{ status: string; admission_id: string }> {
  const response = await fetch(buildBackendUrl('/api/public/partner-admissions'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(formatApiError(error, response.status))
  }
  return response.json()
}

export async function fetchPartnerAdmissions(params: {
  status?: PartnerAdmissionStatus | ''
  service_category?: PartnerServiceCategory | ''
  q?: string
  limit?: number
} = {}): Promise<PartnerAdmissionListResponse> {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.service_category) search.set('service_category', params.service_category)
  if (params.q) search.set('q', params.q)
  if (params.limit) search.set('limit', String(params.limit))
  const response = await authFetch(`/api/partners/admissions?${search}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}

export async function fetchPartnerAdmissionsSummary(): Promise<PartnerAdmissionSummary> {
  const response = await authFetch('/api/partners/admissions/summary')
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}

export async function reviewPartnerAdmission(
  admissionId: string,
  payload: { status: PartnerAdmissionStatus; review_notes?: string; notify_applicant?: boolean },
): Promise<PartnerAdmissionItem & { notification?: Record<string, unknown> | null }> {
  const response = await authFetch(`/api/partners/admissions/${admissionId}`, {
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
