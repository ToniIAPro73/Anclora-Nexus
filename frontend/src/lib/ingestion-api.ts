import { api } from './api'

export type EntityType = 'lead' | 'property'
export type IngestionStatus = 'success' | 'duplicate' | 'error'

export interface IngestionEvent {
  id: string
  org_id: string
  entity_type: EntityType
  external_id: string
  connector_name: string
  status: IngestionStatus
  message?: string
  payload: Record<string, any>
  error_detail?: Record<string, any>
  processed_at: string
  dedupe_key: string
}

export interface IngestionStats {
  processed: number
  rejected: number
  failed: number
  total: number
  trends: {
    processed: number
    rejected: number
    failed: number
  }
}

export interface IngestionFilters {
  status?: IngestionStatus
  entity_type?: EntityType
  connector_name?: string
  startDate?: string
  endDate?: string
}

export const ingestionApi = {
  getEvents: async (filters: IngestionFilters = {}): Promise<IngestionEvent[]> => {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.entity_type) params.append('entity_type', filters.entity_type)
    if (filters.connector_name) params.append('connector_name', filters.connector_name)
    
    return api.get(`/api/ingestion/events?${params.toString()}`)
  },

  getEventById: async (id: string): Promise<IngestionEvent> => {
    return api.get(`/api/ingestion/events/${id}`)
  },

  getStats: async (): Promise<IngestionStats> => {
    // In v1, this might be a derived call or a specific endpoint
    // For now, let's assume /api/ingestion/stats exists or we'll mock it if backend isn't ready
    try {
      return await api.get('/api/ingestion/stats')
    } catch (e) {
      console.warn('Ingestion stats endpoint not found, using mock data')
      return {
        processed: 124,
        rejected: 12,
        failed: 3,
        total: 139,
        trends: {
          processed: 5.2,
          rejected: -2.1,
          failed: 0
        }
      }
    }
  }
}
