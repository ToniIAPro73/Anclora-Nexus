import { authFetch } from './auth-fetch'

async function readJsonOrThrow(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}

export async function approveSyncXmlPilot(requestId: string, payload: { admin_notes?: string; rotatePassword?: boolean; expiresAt?: string | null } = {}) {
  const response = await authFetch(`/api/syncxml-pilot/${requestId}/approve`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return readJsonOrThrow(response)
}

export async function rejectSyncXmlPilot(requestId: string, payload: { internal_reason: string; user_reason: string }) {
  const response = await authFetch(`/api/syncxml-pilot/${requestId}/reject`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return readJsonOrThrow(response)
}

export async function requestMoreInfoSyncXmlPilot(requestId: string, payload: { message: string }) {
  const response = await authFetch(`/api/syncxml-pilot/${requestId}/request-more-info`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return readJsonOrThrow(response)
}
