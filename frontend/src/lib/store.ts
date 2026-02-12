'use client'
import { create } from 'zustand'
import supabase from './supabase'

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  budget: string
  priority: number
  source: string
  status: string
  property_interest?: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  due_time: string
  status: 'pending' | 'done'
}

export interface Property {
  id: string
  address: string
  price: number | string
  type: string
  status: 'prospect' | 'listed' | 'offer' | 'sold'
  stage?: string
  zone?: string
  commission_est?: string
  last_update?: string
}

export interface AgentLog {
  id: string
  agent: string
  status: 'active' | 'success' | 'error'
  message: string
  timestamp: string
}

interface AppState {
  leads: Lead[]
  tasks: Task[]
  properties: Property[]
  agentLogs: AgentLog[]
  stats: {
    leadsThisWeek: number
    responseRate: number
    activeMandates: number
  }

  setLeads: (leads: Lead[]) => void
  setTasks: (tasks: Task[]) => void
  setProperties: (properties: Property[]) => void
  setAgentLogs: (logs: AgentLog[]) => void
  toggleTask: (id: string) => void
  initialize: () => Promise<void>
}

export const useStore = create<AppState>((set) => ({
  leads: [],
  tasks: [],
  properties: [],
  agentLogs: [],
  stats: {
    leadsThisWeek: 0,
    responseRate: 0,
    activeMandates: 0,
  },

  addLead: (lead: Lead) => set((s) => ({ leads: [lead, ...s.leads] })),
  updateLead: (id: string, data: Partial<Lead>) => set((s) => ({
    leads: s.leads.map((l) => l.id === id ? { ...l, ...data } : l)
  })),
  addAgentLog: (log: AgentLog) => set((s) => ({ agentLogs: [log, ...s.agentLogs].slice(0, 20) })),
  setLeads: (leads) => set({ leads }),
  setTasks: (tasks) => set({ tasks }),
  setProperties: (properties) => set({ properties }),
  setAgentLogs: (agentLogs) => set({ agentLogs }),
  setStats: (stats: AppState['stats']) => set({ stats }),
  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t)
  })),
  initialize: async () => {
    try {
      const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
      const { data: tasks } = await supabase.from('tasks').select('*').order('due_time', { ascending: true })
      const { data: props } = await supabase.from('properties').select('*')
      const { data: logs } = await supabase.from('agent_logs').select('*').order('timestamp', { ascending: false }).limit(20)

      if (leads) set({ leads })
      if (tasks) set({ tasks })
      if (props) set({ properties: props })
      if (logs) set({ agentLogs: logs })

      set({
         stats: {
           leadsThisWeek: leads?.length || 0,
           responseRate: 98,
           activeMandates: props?.filter((p: Property) => p.status === 'listed').length || 0,
         }
      })
    } catch (error) {
      console.error('Failed to initialize store:', error)
    }
  }
}))
