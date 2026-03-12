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
  preferred_opportunity_types: string[]
  priority_zones: string[]
  contact_preferences: string[]
  response_commitment_hours: number | null
  profile_notes: string | null
  opportunities_count: number
  shared_opportunities_count: number
  shared_interested_count: number
  shared_declined_count: number
  shared_pending_count: number
  buyer_referrals_count: number
  high_intent_buyers_count: number
  engagement_score: number
  response_rate: number
  recommended_opportunity_type: string | null
  recommended_zone: string | null
  last_seen_at: string | null
  last_referral_at: string | null
  last_shared_response_at: string | null
  workspace_launch_url: string | null
}

export interface PartnerNetworkSummary {
  total: number
  strategic: number
  preferred: number
  eco_focus: number
  buyer_referrals: number
  shared_opportunities: number
  responsive_partners: number
}

export async function fetchPartnerNetwork(params: {
  relationship_status?: PartnerRelationshipStatus | ''
  service_category?: string
  preferred_opportunity_type?: string
  response_status?: string
  q?: string
} = {}): Promise<{ items: PartnerNetworkItem[]; total: number; limit: number; offset: number }> {
  const search = new URLSearchParams()
  if (params.relationship_status) search.set('relationship_status', params.relationship_status)
  if (params.service_category) search.set('service_category', params.service_category)
  if (params.preferred_opportunity_type) search.set('preferred_opportunity_type', params.preferred_opportunity_type)
  if (params.response_status) search.set('response_status', params.response_status)
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

export async function sharePartnerOpportunity(
  workspaceId: string,
  payload: {
    title: string
    summary: string
    opportunity_type: string
    target_zone?: string
    budget_context?: string
    next_step?: string
  },
): Promise<{ id: string }> {
  const response = await authFetch(`/api/partners/network/${workspaceId}/shared-opportunities`, {
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
