'use client'
import { create } from 'zustand'

export interface Lead {
  id: string
  name: string
  email: string
  budget: string
  priority: number
  source: string
  status: string
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
  price: number
  type: string
  status: 'prospect' | 'listed' | 'offer' | 'sold'
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
}

export const useStore = create<AppState>((set) => ({
  leads: [
    { id: '1', name: 'Julianne Moore', email: 'j.moore@luxury.com', budget: '2.5M€', priority: 5, source: 'Web', status: 'New', created_at: '2024-02-12T10:00:00Z' },
    { id: '2', name: 'Robert De Niro', email: 'deniro@film.com', budget: '8.0M€', priority: 4, source: 'Referral', status: 'Contacted', created_at: '2024-02-12T09:30:00Z' },
    { id: '3', name: 'Lady Gaga', email: 'gaga@art.it', budget: '1.2M€', priority: 3, source: 'Web', status: 'Qualified', created_at: '2024-02-12T08:15:00Z' },
  ],
  tasks: [
    { id: '1', title: 'Call Julianne Moore re: Villa Son Vida', due_time: '14:00', status: 'pending' },
    { id: '2', title: 'Send dossier to De Niro', due_time: '16:30', status: 'pending' },
    { id: '3', title: 'Check new listings in Andratx', due_time: '18:00', status: 'done' },
  ],
  properties: [
    { id: '1', address: 'Calle Mar, 12, Andratx', price: 1250000, type: 'Villa', status: 'prospect' },
    { id: '2', address: 'Av. Costa, 5, Calvià', price: 850000, type: 'Apartment', status: 'listed' },
    { id: '3', address: 'Son Ferrer Estate', price: 3400000, type: 'Finca', status: 'sold' },
  ],
  agentLogs: [
    { id: '1', agent: 'LeadIntake', status: 'success', message: 'New lead qualified: Julianne Moore (Priority 5)', timestamp: '10:05' },
    { id: '2', agent: 'Prospection', status: 'active', message: 'Analyzing data from Idealista for Calvià...', timestamp: '09:45' },
    { id: '3', agent: 'Recap', status: 'success', message: 'Weekly report generated and sent to Toni.', timestamp: '08:00' },
  ],
  stats: {
    leadsThisWeek: 14,
    responseRate: 98,
    activeMandates: 6,
  },

  setLeads: (leads) => set({ leads }),
  setTasks: (tasks) => set({ tasks }),
  setProperties: (properties) => set({ properties }),
  setAgentLogs: (agentLogs) => set({ agentLogs }),
  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t)
  })),
}))
