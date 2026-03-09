import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function createNoopChannel() {
  return {
    on() {
      return this
    },
    subscribe() {
      return {
        unsubscribe() {
          return undefined
        },
      }
    },
  }
}

function createNoopSupabaseClient() {
  return {
    auth: {
      async getSession() {
        return { data: { session: null }, error: null }
      },
      async getUser() {
        return { data: { user: null }, error: null }
      },
      async signInWithPassword() {
        return { data: null, error: new Error('Supabase env not configured') }
      },
      async signOut() {
        return { error: null }
      },
      async exchangeCodeForSession() {
        return { data: null, error: new Error('Supabase env not configured') }
      },
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe() {} } } }
      },
    },
    from() {
      const chain = {
        select() { return chain },
        insert() { return chain },
        update() { return chain },
        delete() { return chain },
        upsert() { return chain },
        eq() { return chain },
        neq() { return chain },
        in() { return chain },
        order() { return chain },
        limit() { return chain },
        single() { return chain },
        maybeSingle() { return chain },
        async then(resolve: (value: unknown) => unknown) {
          return resolve({ data: null, error: new Error('Supabase env not configured') })
        },
      }
      return chain
    },
    channel() {
      return createNoopChannel()
    },
  }
}

type SupabaseLike =
  | ReturnType<typeof createNoopSupabaseClient>
  | ReturnType<typeof createBrowserClient>

const supabase: SupabaseLike =
  typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey
    ? (createBrowserClient(supabaseUrl, supabaseAnonKey) as SupabaseLike)
    : createNoopSupabaseClient()

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
