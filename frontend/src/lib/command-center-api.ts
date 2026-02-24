import supabase from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

function buildApiUrl(path: string): string {
  const base = API_URL.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/api/') ? path.slice(4) : path
  return `${base}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`,
  }
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(buildApiUrl(path), {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail || `API Error: ${res.status}`)
  }
  return res.json()
}

export interface ScopeMeta {
  org_id: string
  role: string
}

export type CommandCenterKpiLabel =
  | 'leads_total'
  | 'lead_conversion_rate'
  | 'property_close_rate'
  | 'tasks_total'
  | 'tasks_completed'
  | 'task_completion_rate'

export interface KPIValue {
  label: CommandCenterKpiLabel
  value: number
  unit: 'count' | 'percent'
  trend?: number
}

export interface CommandCenterSnapshotResponse {
  version: string
  scope: ScopeMeta
  commercial_kpis: KPIValue[]
  productivity_kpis: KPIValue[]
  budget_status: 'ok' | 'warning' | 'hard_stop'
  burn_pct?: number | null
  monthly_budget_eur?: number | null
  current_usage_eur?: number | null
  cost_visibility: 'full' | 'limited'
}

export interface TrendPoint {
  period: string
  leads_created: number
  tasks_completed: number
  cost_eur: number
}

export interface CommandCenterTrendsResponse {
  version: string
  scope: ScopeMeta
  months: number
  points: TrendPoint[]
}

export async function getCommandCenterSnapshot(): Promise<CommandCenterSnapshotResponse> {
  return apiRequest('/api/command-center/snapshot')
}

export async function getCommandCenterTrends(months = 6): Promise<CommandCenterTrendsResponse> {
  return apiRequest(`/api/command-center/trends?months=${months}`)
}
