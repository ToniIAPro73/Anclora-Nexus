import supabase from './supabase'
import { buildBackendUrl } from './backend-url'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`,
  }
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(buildBackendUrl(path), {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail || `API Error: ${res.status}`)
  }
  return res.json()
}

export interface SourceScorecard {
  source_key: string
  total_events: number
  success_events: number
  duplicate_events: number
  error_events: number
  success_rate_pct: number
  lead_count: number
}

export interface RankingItem {
  source_key: string
  score: number
  success_rate_pct: number
  lead_count: number
}

export interface TrendPoint {
  period: string
  source_key: string
  events: number
  success_rate_pct: number
}

export async function getSourceOverview(): Promise<{ version: string; scope: { org_id: string; role: string }; items: SourceScorecard[]; total: number }> {
  return apiRequest('/api/source-observatory/overview')
}

export async function getSourceRanking(): Promise<{ version: string; scope: { org_id: string; role: string }; items: RankingItem[]; total: number }> {
  return apiRequest('/api/source-observatory/ranking')
}

export async function getSourceTrends(months = 6): Promise<{ version: string; scope: { org_id: string; role: string }; months: number; points: TrendPoint[] }> {
  return apiRequest(`/api/source-observatory/trends?months=${months}`)
}
