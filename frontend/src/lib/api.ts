import supabase from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function resolveCurrentOrgId(userId?: string): Promise<string> {
  if (!userId) throw new Error('No authenticated user to resolve org_id')

  // Prefer active membership org (source of truth for team-enabled flows)
  const membershipRes = await supabase
    .from('organization_members')
    .select('org_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (membershipRes.data?.org_id) {
    return membershipRes.data.org_id
  }

  // Fallback to user profile org_id
  const profileRes = await supabase
    .from('user_profiles')
    .select('org_id')
    .eq('id', userId)
    .maybeSingle()

  if (profileRes.data?.org_id) {
    return profileRes.data.org_id
  }

  throw new Error('No active organization found for current user')
}

export async function createLead(leadData: any) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  
  const res = await fetch(`${API_URL}/api/leads/intake`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    },
    body: JSON.stringify(leadData)
  })
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Error creating lead')
  }
  return res.json()
}

export async function runSkill(skill: string, data: any = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  
  const res = await fetch(`${API_URL}/api/skills/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    },
    body: JSON.stringify({ skill, data })
  })
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Error running skill')
  }
  return res.json()
}

export async function createProperty(propertyData: any) {
  const { data: { session } } = await supabase.auth.getSession()
  const org_id = await resolveCurrentOrgId(session?.user?.id)
  
  // Map frontend to backend fields
  const dbData = {
    org_id,
    address: propertyData.address,
    price: parseFloat(propertyData.price) || 0,
    property_type: propertyData.type || 'Villa',
    status: propertyData.status || 'prospect',
    city: propertyData.zone || 'Mallorca',
    prospection_score: (propertyData.match_score || 0) / 100,
    notes: {
      source_system: propertyData.source_system || 'manual',
      source_portal: propertyData.source_portal || null,
    },
  }
  
  const { data, error } = await supabase.from('properties').insert(dbData).select().single()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export async function getWeeklyStats() {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const res = await fetch(`${API_URL}/api/stats/weekly`, {
     headers: {
        'Authorization': `Bearer ${token || ''}`
     }
  })

  if (!res.ok) {
     const error = await res.json()
     throw new Error(error.detail || 'Error fetching stats')
  }
  return res.json()
}

export async function fetchIntelligenceQuery(message: string, mode: 'fast' | 'deep' = 'fast', domainHint?: string) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const res = await fetch(`${API_URL}/api/intelligence/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    },
    body: JSON.stringify({ message, mode, domain_hint: domainHint })
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Error in intelligence query')
  }
  return res.json()
}
