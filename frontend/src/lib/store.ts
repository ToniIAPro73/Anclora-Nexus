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

// Realistic synthetic data for Anclora Private Estates
const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Klaus Müller',
    email: 'klaus.mueller@luxuryestate.de',
    phone: '+49 170 1234567',
    budget: '€3.5M - €5M',
    priority: 5,
    source: 'Web',
    status: 'Qualified',
    property_interest: 'Villa con vistas al mar en Port Andratx',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'James Richardson',
    email: 'j.richardson@londoninvest.co.uk',
    phone: '+44 7700 900123',
    budget: '€1.2M - €1.8M',
    priority: 4,
    source: 'eXp',
    status: 'Contacted',
    property_interest: 'Apartamento primera línea en Calvià',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Sophie Dubois',
    email: 'sophie.dubois@gmail.com',
    phone: '+41 79 123 45 67',
    budget: '€2M - €3M',
    priority: 3,
    source: 'Referral',
    status: 'New',
    property_interest: 'Finca rústica con terreno en zona Andratx',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Carlos Fernández',
    email: 'cfernandez@techcorp.es',
    phone: '+34 600 123 456',
    budget: '€2.5M - €3.5M',
    priority: 5,
    source: 'LinkedIn',
    status: 'Negotiating',
    property_interest: 'Penthouse moderno en Puerto Portals',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    name: 'Marie & Pierre Laurent',
    email: 'laurent.family@orange.fr',
    phone: '+33 6 12 34 56 78',
    budget: '€800K - €1.2M',
    priority: 3,
    source: 'Web',
    status: 'Contacted',
    property_interest: 'Apartamento 2-3 hab en Santa Ponsa',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Llamada de seguimiento Klaus Müller', due_time: 'Mañana 10:00', status: 'pending' },
  { id: '2', title: 'Enviar dossier propiedades a James Richardson', due_time: 'Hoy 15:00', status: 'pending' },
  { id: '3', title: 'Responder consulta Sophie Dubois', due_time: 'Hoy 16:00', status: 'pending' },
  { id: '4', title: 'Visita urgente Carlos Fernández', due_time: 'Hoy 18:00', status: 'pending' },
  { id: '5', title: 'Follow-up Marie & Pierre Laurent', due_time: 'Ayer 14:00', status: 'done' },
  { id: '6', title: 'Actualizar fotos villa Port Andratx', due_time: 'Pasado mañana', status: 'pending' },
]

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    address: 'Carrer de la Mar, 15, Port Andratx',
    price: '€4.5M',
    type: 'Villa',
    status: 'listed',
    stage: 'Captación',
    zone: 'Port Andratx',
    commission_est: '€135K',
    last_update: 'Hace 2 días',
  },
  {
    id: '2',
    address: 'Paseo Marítimo, 42, Calvià',
    price: '€1.65M',
    type: 'Apartamento',
    status: 'offer',
    stage: 'Negociación',
    zone: 'Calvià',
    commission_est: '€49.5K',
    last_update: 'Hace 1 hora',
  },
  {
    id: '3',
    address: 'Camí de S\'Arracó, Km 3, Andratx',
    price: '€2.8M',
    type: 'Finca',
    status: 'prospect',
    stage: 'Captación',
    zone: 'Andratx',
    commission_est: '€84K',
    last_update: 'Hace 3 días',
  },
  {
    id: '4',
    address: 'Avenida Portals Nous, 8, Puerto Portals',
    price: '€3.2M',
    type: 'Penthouse',
    status: 'listed',
    stage: 'Cierre',
    zone: 'Puerto Portals',
    commission_est: '€96K',
    last_update: 'Hace 5 horas',
  },
]

const MOCK_AGENT_LOGS: AgentLog[] = [
  {
    id: '1',
    agent: 'Lead Intake',
    status: 'success',
    message: 'Nuevo lead cualificado: Klaus Müller (P5)',
    timestamp: 'Hace 2 días',
  },
  {
    id: '2',
    agent: 'Prospection',
    status: 'active',
    message: 'Prospección zona Puerto Portals en progreso...',
    timestamp: 'Hace 2 horas',
  },
  {
    id: '3',
    agent: 'Lead Intake',
    status: 'success',
    message: 'Nuevo lead cualificado: Carlos Fernández (P5)',
    timestamp: 'Hace 3 horas',
  },
  {
    id: '4',
    agent: 'Weekly Recap',
    status: 'success',
    message: 'Recap semanal generado: 15 leads, €8.2M pipeline',
    timestamp: 'Hace 3 días',
  },
]

export const useStore = create<AppState>((set) => ({
  leads: MOCK_LEADS,
  tasks: MOCK_TASKS,
  properties: MOCK_PROPERTIES,
  agentLogs: MOCK_AGENT_LOGS,
  stats: {
    leadsThisWeek: 15,
    responseRate: 98,
    activeMandates: 12,
  },

  setLeads: (leads) => set({ leads }),
  setTasks: (tasks) => set({ tasks }),
  setProperties: (properties) => set({ properties }),
  setAgentLogs: (agentLogs) => set({ agentLogs }),
  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t)
  })),
  initialize: async () => {
    try {
      // Try to fetch from Supabase, but fallback to mock data if it fails
      const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
      const { data: tasks } = await supabase.from('tasks').select('*').order('due_date', { ascending: true })
      const { data: props } = await supabase.from('properties').select('*')
      const { data: logs } = await supabase.from('agent_logs').select('*').order('created_at', { ascending: false }).limit(20)

      if (leads && leads.length > 0) set({ leads })
      if (tasks && tasks.length > 0) set({ tasks })
      if (props && props.length > 0) set({ properties: props })
      if (logs && logs.length > 0) set({ agentLogs: logs })

      // Update stats
      set({
        stats: {
          leadsThisWeek: leads?.length || 15,
          responseRate: 98,
          activeMandates: props?.filter((p: Property) => p.status === 'listed').length || 12,
        }
      })
    } catch (error) {
      console.log('Using mock data (Supabase not available):', error)
      // Mock data is already set as default, no need to do anything
    }
  }
}))
