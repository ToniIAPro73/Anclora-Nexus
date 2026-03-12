import { authFetch } from './auth-fetch'

export type PartnerNetworkTier = 'approved' | 'preferred' | 'strategic'
export type PartnerRelationshipStatus = 'active' | 'watchlist' | 'paused'

export interface PartnerNetworkItem {
  workspace_id: string
  admission_id: string
  partner_name: string
  company_name: string | null
  service_category: string
  sustainability_focus: boolean
  partner_tier: PartnerNetworkTier
  relationship_status: PartnerRelationshipStatus
  trust_score: number
  preferred_for_buyers: boolean
  preferred_for_sellers: boolean
  network_tags: string[]
  strategic_notes: string | null
  coverage_areas: string[]
  languages: string[]
  opportunities_count: number
  buyer_referrals_count: number
  high_intent_buyers_count: number
  last_seen_at: string | null
  last_referral_at: string | null
  workspace_launch_url: string | null
}

export interface PartnerNetworkSummary {
  total: number
  strategic: number
  preferred: number
  eco_focus: number
  buyer_referrals: number
}

export async function fetchPartnerNetwork(params: {
  relationship_status?: PartnerRelationshipStatus | ''
  service_category?: string
  q?: string
} = {}): Promise<{ items: PartnerNetworkItem[]; total: number; limit: number; offset: number }> {
  const search = new URLSearchParams()
  if (params.relationship_status) search.set('relationship_status', params.relationship_status)
  if (params.service_category) search.set('service_category', params.service_category)
  if (params.q) search.set('q', params.q)
  const response = await authFetch(`/api/partners/network?${search}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}

export async function fetchPartnerNetworkSummary(): Promise<PartnerNetworkSummary> {
  const response = await authFetch('/api/partners/network/summary')
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}

export async function updatePartnerNetwork(
  workspaceId: string,
  payload: {
    partner_tier?: PartnerNetworkTier
    relationship_status?: PartnerRelationshipStatus
    trust_score?: number
    preferred_for_buyers?: boolean
    preferred_for_sellers?: boolean
    strategic_notes?: string
    network_tags?: string[]
  },
): Promise<PartnerNetworkItem> {
  const response = await authFetch(`/api/partners/network/${workspaceId}`, {
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
