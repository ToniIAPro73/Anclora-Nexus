import { authFetch } from './auth-fetch'
import type { AccessRequest } from './access-requests-api'

type SyncXmlPilotDecisionResponse = {
  ok?: boolean
  status?: string
  blocked?: boolean
  reason?: string
  record?: AccessRequest & {
    metadata?: {
      error_message?: string
      final_decision?: string
      credential_status?: string
      email_status?: string
    }
  }
}

async function readJsonOrThrow(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }
  return response.json()
}

function explainIncompleteDecision(payload: SyncXmlPilotDecisionResponse, fallback: string) {
  return (
    payload.record?.metadata?.error_message
    || payload.reason
    || payload.status
    || fallback
  )
}

function assertEffectiveDecision(
  payload: SyncXmlPilotDecisionResponse,
  expectedStatus: 'approved' | 'rejected',
): SyncXmlPilotDecisionResponse & { record: AccessRequest } {
  if (payload.blocked || payload.status === 'failed_credentials') {
    throw new Error(explainIncompleteDecision(payload, 'GuestHub pilot decision did not complete'))
  }
  if (!payload.record) {
    throw new Error(explainIncompleteDecision(payload, 'GuestHub pilot decision returned no record'))
  }
  const record = payload.record
  if (record.status !== expectedStatus) {
    throw new Error(
      explainIncompleteDecision(
        payload,
        `GuestHub pilot request remained ${record.status}`,
      ),
    )
  }
  return { ...payload, record }
}

export async function approveSyncXmlPilot(requestId: string, payload: { admin_notes?: string; rotatePassword?: boolean; expiresAt?: string | null } = {}) {
  const response = await authFetch(`/api/syncxml-pilot/${requestId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return assertEffectiveDecision(await readJsonOrThrow(response), 'approved')
}

export async function rejectSyncXmlPilot(requestId: string, payload: { internal_reason: string; user_reason: string }) {
  const response = await authFetch(`/api/syncxml-pilot/${requestId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return assertEffectiveDecision(await readJsonOrThrow(response), 'rejected')
}

export async function requestMoreInfoSyncXmlPilot(requestId: string, payload: { message: string }) {
  const response = await authFetch(`/api/syncxml-pilot/${requestId}/request-more-info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return readJsonOrThrow(response)
}
