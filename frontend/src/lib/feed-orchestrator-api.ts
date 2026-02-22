import supabase from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

function buildApiUrl(path: string): string {
  const base = API_URL.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/api/') ? path.slice(4) : path
  return `${base}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`
}

export type FeedChannelName = 'idealista' | 'fotocasa' | 'rightmove' | 'kyero'

export interface FeedChannelSummary {
  channel: FeedChannelName
  format: 'xml' | 'json'
  status: 'healthy' | 'warning' | 'blocked'
  total_candidates: number
  ready_to_publish: number
  warnings: number
  errors: number
  latest_run_at: string | null
}

export interface FeedWorkspaceResponse {
  generated_at: string
  channels: FeedChannelSummary[]
  totals: {
    channels: number
    candidates: number
    ready: number
    errors: number
    warnings: number
  }
}

export interface FeedValidationIssue {
  property_id: string
  field: string
  severity: 'warning' | 'error'
  message: string
}

export interface FeedValidationResponse {
  channel: FeedChannelName
  generated_at: string
  total_candidates: number
  ready_to_publish: number
  warnings: number
  errors: number
  issues: FeedValidationIssue[]
}

export interface FeedPublishResponse {
  run_id: string
  channel: FeedChannelName
  dry_run: boolean
  status: 'success' | 'partial' | 'failed'
  published_count: number
  rejected_count: number
  error_count: number
  generated_at: string
  sample_payload: Record<string, unknown>
  issues: FeedValidationIssue[]
}

export interface FeedRunItem {
  run_id: string
  channel: FeedChannelName
  status: string
  dry_run: boolean
  published_count: number
  rejected_count: number
  generated_at: string
}

export interface FeedRunListResponse {
  items: FeedRunItem[]
  total: number
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token || ''}`,
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

export async function getFeedWorkspace(): Promise<FeedWorkspaceResponse> {
  return apiRequest('/api/feeds/workspace')
}

export async function validateFeedChannel(channel: FeedChannelName): Promise<FeedValidationResponse> {
  return apiRequest(`/api/feeds/channels/${channel}/validate`, {
    method: 'POST',
  })
}

export async function publishFeedChannel(
  channel: FeedChannelName,
  payload: { dry_run?: boolean; max_items?: number } = {},
): Promise<FeedPublishResponse> {
  return apiRequest(`/api/feeds/channels/${channel}/publish`, {
    method: 'POST',
    body: JSON.stringify({
      dry_run: Boolean(payload.dry_run),
      max_items: payload.max_items ?? 100,
    }),
  })
}

export async function listFeedRuns(params?: {
  channel?: FeedChannelName
  limit?: number
}): Promise<FeedRunListResponse> {
  const query = new URLSearchParams()
  if (params?.channel) query.set('channel', params.channel)
  if (params?.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiRequest(`/api/feeds/runs${qs ? `?${qs}` : ''}`)
}
