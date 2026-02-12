'use client'
import { createClient } from '@supabase/supabase-js'

// Stub client for development - will connect to real URL later
const supabase = createClient(
  'https://placeholder.supabase.co',
  'placeholder-key'
)

export function subscribeToLeads(cb: (p: any) => void) {
  console.log('Subscribed to leads realtime stub')
  // No-op for mock data
  return { unsubscribe: () => {} }
}

export function subscribeToAgentLogs(cb: (p: any) => void) {
  console.log('Subscribed to agent logs realtime stub')
  return { unsubscribe: () => {} }
}

export function subscribeToTasks(cb: (p: any) => void) {
  console.log('Subscribed to tasks realtime stub')
  return { unsubscribe: () => {} }
}

export default supabase
