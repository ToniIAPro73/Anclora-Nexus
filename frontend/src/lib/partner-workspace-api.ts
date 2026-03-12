import { buildBackendUrl } from './backend-url'

export type PartnerWorkspaceStatus = 'invited' | 'active' | 'paused'
export type PartnerTier = 'approved' | 'preferred' | 'strategic'
export type PartnerOpportunityType =
  | 'buyer_referral'
  | 'seller_referral'
  | 'service_offer'
  | 'collaboration_request'
export type PartnerOpportunityStatus = 'submitted' | 'in_review' | 'accepted' | 'archived'

export interface PartnerWorkspaceResource {
  label: string
  description: string
}

export interface PartnerWorkspaceOpportunity {
  id: string
  title: string
  opportunity_type: PartnerOpportunityType
  summary: string
  target_zone: string | null
  budget_range: string | null
  next_step: string | null
  status: PartnerOpportunityStatus
  created_at: string
}

export interface PartnerWorkspaceActivity {
  id: string
  event_type: string
  title: string
  description: string | null
  related_opportunity_id: string | null
  created_at: string
}

export interface PartnerWorkspacePayload {
  id: string
  admission_id: string
  partner_name: string
  company_name: string | null
  service_category: string
  service_summary: string
  coverage_areas: string[]
  languages: string[]
  sustainability_focus: boolean
  sustainability_notes: string | null
  workspace_status: PartnerWorkspaceStatus
  partner_tier: PartnerTier
  headline: string
  collaboration_focus: string[]
  preferred_opportunity_types: PartnerOpportunityType[]
  priority_zones: string[]
  contact_preferences: string[]
  response_commitment_hours: number | null
  profile_notes: string | null
  next_steps: string[]
  resources: PartnerWorkspaceResource[]
  opportunities: PartnerWorkspaceOpportunity[]
  activity: PartnerWorkspaceActivity[]
  last_seen_at: string | null
}

export async function fetchPartnerWorkspace(token: string): Promise<PartnerWorkspacePayload> {
  const response = await fetch(buildBackendUrl(`/api/public/partner-workspace?token=${encodeURIComponent(token)}`))
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}

export async function submitPartnerWorkspaceOpportunity(payload: {
  token: string
  title: string
  opportunity_type: PartnerOpportunityType
  summary: string
  target_zone?: string
  budget_range?: string
  next_step?: string
}): Promise<{ status: string; opportunity_id: string }> {
  const response = await fetch(buildBackendUrl('/api/public/partner-workspace/opportunities'), {
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

export async function updatePartnerWorkspaceProfile(payload: {
  token: string
  preferred_opportunity_types: PartnerOpportunityType[]
  priority_zones: string[]
  contact_preferences: string[]
  response_commitment_hours?: number
  profile_notes?: string
}): Promise<{ status: string; workspace_id: string }> {
  const response = await fetch(buildBackendUrl('/api/public/partner-workspace/profile'), {
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
