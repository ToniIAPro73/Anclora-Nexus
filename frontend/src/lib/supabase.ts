import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export function subscribeToLeads(cb: (payload: Record<string, unknown>) => void) {
  return supabase
    .channel('leads-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'leads' },
      cb
    )
    .subscribe()
}

export function subscribeToAgentLogs(cb: (payload: Record<string, unknown>) => void) {
  return supabase
    .channel('agent-logs-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'agent_logs' },
      cb
    )
    .subscribe()
}

export function subscribeToTasks(cb: (payload: Record<string, unknown>) => void) {
  return supabase
    .channel('tasks-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks' },
      cb
    )
    .subscribe()
}

export default supabase

