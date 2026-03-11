import supabase from './supabase'
import { buildBackendUrl } from './backend-url'

export async function getAuthHeaders(extraHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    Authorization: `Bearer ${session?.access_token || ''}`,
    ...extraHeaders,
  }
}

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const baseHeaders = await getAuthHeaders()
  return fetch(buildBackendUrl(path), {
    ...options,
    headers: {
      ...baseHeaders,
      ...((options.headers as Record<string, string> | undefined) || {}),
    },
  })
}
