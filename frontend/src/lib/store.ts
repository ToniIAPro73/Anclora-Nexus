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
  source: string // Legacy field
  source_system?: 'manual' | 'cta_web' | 'import' | 'referral' | 'partner' | 'social'
  source_channel?: 'website' | 'linkedin' | 'instagram' | 'facebook' | 'email' | 'phone' | 'other'
  source_campaign?: string
  source_detail?: string
  source_url?: string
  source_referrer?: string
  captured_at?: string
  ingestion_mode?: 'realtime' | 'batch' | 'manual'
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
  title?: string
  address: string
  price: number | string
  type: string
  status: 'prospect' | 'listed' | 'offer' | 'sold' | 'rejected'
  source_system?: 'manual' | 'widget' | 'pbm'
  source_portal?: 'idealista' | 'fotocasa' | 'facebook' | 'instagram' | 'rightmove' | 'kyero' | 'other' | string
  useful_area_m2?: number
  built_area_m2?: number
  plot_area_m2?: number
  stage?: string
  zone?: string
  commission_est?: string
  last_update?: string
  match_score?: number
  image?: string
}

// ...

// ...



export interface AgentLog {
  id: string
  agent: string
  status: 'active' | 'success' | 'error'
  message: string
  timestamp: string
}

export interface RiskAssessment {
  category: 'labor' | 'tax' | 'brand' | 'focus' | 'other'
  level: 'low' | 'medium' | 'high' | 'critical'
  rationale: string
  mitigation?: string
}

export interface GovernorDecision {
  recommendation: 'execute' | 'postpone' | 'reformulate' | 'discard'
  diagnosis: string
  risks: RiskAssessment[]
  next_steps: string[]
  dont_do: string[]
  flags: string[]
  hitl_required: boolean
  strategic_mode_version: string
  domains_used: string[]
  confidence?: number
}

export interface QueryPlan {
  intent_classification: string
  domains_selected: string[]
  rationale: string
  mode: 'fast' | 'deep'
}

export interface IntelligenceResponse {
  response: string
  query_plan: QueryPlan
  governor_decision: GovernorDecision
  audit_id?: string
  status: string
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
    latestInsight: string
  }

  intelligence: {
    queryHistory: { message: string, response: IntelligenceResponse }[]
    isProcessing: boolean
    lastResponse: IntelligenceResponse | null
  }

  setLeads: (leads: Lead[]) => void
  setTasks: (tasks: Task[]) => void
  setProperties: (properties: Property[]) => void
  setAgentLogs: (logs: AgentLog[]) => void
  addLead: (lead: Omit<Lead, 'id' | 'created_at'>) => void
  updateLead: (id: string, updates: Partial<Lead>) => void
  addTask: (task: Omit<Task, 'id'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  addProperty: (property: Omit<Property, 'id'>) => void
  updateProperty: (id: string, updates: Partial<Property>) => void
  toggleTask: (id: string) => void
  deleteLead: (id: string) => void
  deleteTask: (id: string) => void
  deleteProperty: (id: string) => void
  sendIntelligenceQuery: (message: string, mode: 'fast' | 'deep', domainHint?: string) => Promise<void>
  clearIntelligenceHistory: () => void
  initialize: () => Promise<void>
}

// Realistic synthetic data for Anclora Private Estates
const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Klaus MÃ¼ller',
    email: 'klaus.mueller@luxuryestate.de',
    phone: '+49 170 1234567',
    budget: 'â‚¬3.5M - â‚¬5M',
    priority: 5,
    source: 'Web',
    source_system: 'cta_web',
    source_channel: 'website',
    source_detail: 'Formulario Villa',
    status: 'Qualified',
    property_interest: 'Villa con vistas al mar en Port Andratx',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'James Richardson',
    email: 'j.richardson@londoninvest.co.uk',
    phone: '+44 7700 900123',
    budget: 'â‚¬1.2M - â‚¬1.8M',
    priority: 4,
    source: 'eXp',
    status: 'Contacted',
    property_interest: 'Apartamento primera lÃ­nea en CalviÃ ',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Sophie Dubois',
    email: 'sophie.dubois@gmail.com',
    phone: '+41 79 123 45 67',
    budget: 'â‚¬2M - â‚¬3M',
    priority: 3,
    source: 'Referral',
    status: 'New',
    property_interest: 'Finca rÃºstica con terreno en zona Andratx',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Carlos FernÃ¡ndez',
    email: 'cfernandez@techcorp.es',
    phone: '+34 600 123 456',
    budget: 'â‚¬2.5M - â‚¬3.5M',
    priority: 5,
    source: 'LinkedIn',
    source_system: 'social',
    source_channel: 'linkedin',
    source_detail: 'Inbound message',
    status: 'Negotiating',
    property_interest: 'Penthouse moderno en Puerto Portals',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    name: 'Marie & Pierre Laurent',
    email: 'laurent.family@orange.fr',
    phone: '+33 6 12 34 56 78',
    budget: 'â‚¬800K - â‚¬1.2M',
    priority: 3,
    source: 'Web',
    status: 'Contacted',
    property_interest: 'Apartamento 2-3 hab en Santa Ponsa',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    name: 'Elena Rossi',
    email: 'elena.rossi@milano.it',
    phone: '+39 333 1234567',
    budget: 'â‚¬4M - â‚¬6M',
    priority: 4,
    source: 'Partner',
    status: 'New',
    property_interest: 'Villa histÃ³rica en Son Vida',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    name: 'Lars Svensson',
    email: 'lars.svensson@stockholm.se',
    phone: '+46 70 123 45 67',
    budget: 'â‚¬1.5M - â‚¬2.5M',
    priority: 3,
    source: 'Web',
    source_system: 'cta_web',
    source_channel: 'website',
    source_detail: 'Formulario Villa',
    status: 'Qualified',
    property_interest: 'Ãtico con terraza en Palma centro',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    name: 'Sarah Jones',
    email: 'sarah.jones@nyrealestate.com',
    phone: '+1 212 555 1234',
    budget: 'â‚¬5M+',
    priority: 5,
    source: 'Referral',
    status: 'Negotiating',
    property_interest: 'Propiedad exclusiva acceso directo mar',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '9',
    name: 'Dr. Hans Weber',
    email: 'h.weber@klinik-muenchen.de',
    phone: '+49 171 9876543',
    budget: 'â‚¬2.2M - â‚¬3M',
    priority: 4,
    source: 'Web',
    status: 'Contacted',
    property_interest: 'Casa vacacional familiar en Camp de Mar',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10',
    name: 'Isabella Garcia',
    email: 'isabella.garcia@madrid.es',
    phone: '+34 611 222 333',
    budget: 'â‚¬1M - â‚¬1.5M',
    priority: 2,
    source: 'Instagram',
    status: 'New',
    property_interest: 'InversiÃ³n para alquiler',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '11',
    name: 'Oliver Smith',
    email: 'oliver.smith@techlondon.uk',
    phone: '+44 7800 111222',
    budget: 'â‚¬3M - â‚¬4M',
    priority: 4,
    source: 'LinkedIn',
    status: 'Qualified',
    property_interest: 'Villa moderna minimalista',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '12',
    name: 'Ana Silva',
    email: 'ana.silva@lisboa.pt',
    phone: '+351 91 234 56 78',
    budget: 'â‚¬1.8M - â‚¬2.2M',
    priority: 3,
    source: 'Web',
    status: 'Contacted',
    property_interest: 'Vista mar indispensable',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '13',
    name: 'Dmitry Volkov',
    email: 'd.volkov@invest.ru',
    phone: '+7 903 123 45 67',
    budget: 'â‚¬6M - â‚¬8M',
    priority: 5,
    source: 'Partner',
    status: 'New',
    property_interest: 'MansiÃ³n privada alta seguridad',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '14',
    name: 'Emma Wilson',
    email: 'emma.wilson@artgallery.com',
    phone: '+44 7900 333444',
    budget: 'â‚¬2.5M',
    priority: 3,
    source: 'Event',
    status: 'Contacted',
    property_interest: 'Casa con carÃ¡cter y jardÃ­n',
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '15',
    name: 'Lucas Martin',
    email: 'lucas.martin@paris.fr',
    phone: '+33 6 99 88 77 66',
    budget: 'â‚¬1.5M',
    priority: 2,
    source: 'Web',
    status: 'New',
    property_interest: 'Apartamento cerca de la playa',
    created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  }
]

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Llamada de seguimiento Klaus MÃ¼ller', due_time: 'MaÃ±ana 10:00', status: 'pending' },
  { id: '2', title: 'Enviar dossier propiedades a James Richardson', due_time: 'Hoy 15:00', status: 'pending' },
  { id: '3', title: 'Responder consulta Sophie Dubois', due_time: 'Hoy 16:00', status: 'pending' },
  { id: '4', title: 'Visita urgente Carlos FernÃ¡ndez', due_time: 'Hoy 18:00', status: 'pending' },
  { id: '5', title: 'Actualizar fotos villa Port Andratx', due_time: 'Pasado maÃ±ana', status: 'pending' },
  { id: '6', title: 'Preparar contrato arras Sarah Jones', due_time: 'Viernes 11:00', status: 'pending' },
  { id: '7', title: 'ReuniÃ³n equipo eXp', due_time: 'Lunes 09:30', status: 'pending' },
  { id: '8', title: 'Revisar nuevas captaciones Idealista', due_time: 'Martes 10:00', status: 'pending' },
  { id: '9', title: 'Llamar a Elena Rossi (Partner)', due_time: 'MiÃ©rcoles 12:00', status: 'pending' },
  { id: '10', title: 'Enviar valoraciÃ³n Dr. Hans Weber', due_time: 'Jueves 16:00', status: 'pending' },
  
  { id: '11', title: 'Follow-up Marie & Pierre Laurent', due_time: 'Ayer 14:00', status: 'done' },
  { id: '12', title: 'Email bienvenida Isabella Garcia', due_time: 'Ayer 09:00', status: 'done' },
  { id: '13', title: 'Cierre notarÃ­a propiedad CalviÃ ', due_time: 'Hace 2 dÃ­as', status: 'done' },
  { id: '14', title: 'Publicar tour virtual Finca S\'ArracÃ³', due_time: 'Hace 3 dÃ­as', status: 'done' },
  { id: '15', title: 'ReuniÃ³n mensual objetivos', due_time: 'Hace 4 dÃ­as', status: 'done' },
  { id: '16', title: 'Actualizar CRM con nuevos leads', due_time: 'Hace 5 dÃ­as', status: 'done' },
  { id: '17', title: 'Llamada prospecciÃ³n zona Costa d\'en Blanes', due_time: 'Hace 1 semana', status: 'done' },
]

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    address: 'Carrer de la Mar, 15, Port Andratx',
    price: 'â‚¬4.5M',
    type: 'Villa',
    status: 'listed',
    stage: 'CaptaciÃ³n',
    zone: 'Port Andratx',
    commission_est: 'â‚¬135K',
    last_update: 'Hace 2 dÃ­as',
  },
  {
    id: '2',
    address: 'Paseo MarÃ­timo, 42, CalviÃ ',
    price: 'â‚¬1.65M',
    type: 'Apartamento',
    status: 'offer',
    stage: 'NegociaciÃ³n',
    zone: 'CalviÃ ',
    commission_est: 'â‚¬49.5K',
    last_update: 'Hace 1 hora',
  },
  {
    id: '3',
    address: 'CamÃ­ de S\'ArracÃ³, Km 3, Andratx',
    price: 'â‚¬2.8M',
    type: 'Finca',
    status: 'prospect',
    stage: 'CaptaciÃ³n',
    zone: 'Andratx',
    commission_est: 'â‚¬84K',
    last_update: 'Hace 3 dÃ­as',
  },
  {
    id: '4',
    address: 'Avenida Portals Nous, 8, Puerto Portals',
    price: 'â‚¬3.2M',
    type: 'Penthouse',
    status: 'listed',
    stage: 'Cierre',
    zone: 'Puerto Portals',
    commission_est: 'â‚¬96K',
    last_update: 'Hace 5 horas',
  },
  {
    id: '5',
    address: 'Carrer de la Salut, 12, Sol de Mallorca',
    price: 'â‚¬5.5M',
    type: 'Villa',
    status: 'listed',
    stage: 'CaptaciÃ³n',
    zone: 'Sol de Mallorca',
    commission_est: 'â‚¬165K',
    last_update: 'Hace 1 dÃ­a',
  },
  {
    id: '6',
    address: 'Via Rei Sanxo, 4, Santa Ponsa',
    price: 'â‚¬1.2M',
    type: 'Penthouse',
    status: 'offer',
    stage: 'NegociaciÃ³n',
    zone: 'Santa Ponsa',
    commission_est: 'â‚¬36K',
    last_update: 'Hace 6 horas',
  },
  {
    id: '7',
    address: 'CamÃ­ de Son Pillo, 15, CalviÃ ',
    price: 'â‚¬2.1M',
    type: 'Finca',
    status: 'prospect',
    stage: 'CaptaciÃ³n',
    zone: 'CalviÃ ',
    commission_est: 'â‚¬63K',
    last_update: 'Hace 4 dÃ­as',
  },
  {
    id: '8',
    address: 'Bulevar de Paguera, 88, Paguera',
    price: 'â‚¬650K',
    type: 'Apartamento',
    status: 'sold',
    stage: 'Vendido',
    zone: 'Paguera',
    commission_est: 'â‚¬19.5K',
    last_update: 'Hace 1 semana',
  },
  {
    id: '9',
    address: 'Carrer del Mar, 22, Camp de Mar',
    price: 'â‚¬4.8M',
    type: 'Villa',
    status: 'listed',
    stage: 'Listado',
    zone: 'Camp de Mar',
    commission_est: 'â‚¬144K',
    last_update: 'Hace 2 dÃ­as',
  },
  {
    id: '10',
    address: 'Avinguda de la Mar, 10, Costa de la Calma',
    price: 'â‚¬1.1M',
    type: 'Chalet',
    status: 'offer',
    stage: 'Oferta',
    zone: 'Costa de la Calma',
    commission_est: 'â‚¬33K',
    last_update: 'Hace 3 horas',
  },
  {
    id: '11',
    address: 'Carrer del Golf, 5, Nova Santa Ponsa',
    price: 'â‚¬3.9M',
    type: 'Villa',
    status: 'listed',
    stage: 'Listado',
    zone: 'Santa Ponsa',
    commission_est: 'â‚¬117K',
    last_update: 'Hace 5 dÃ­as',
  },
  {
    id: '12',
    address: 'Paseo del Mar, 100, Palmanova',
    price: 'â‚¬550K',
    type: 'Piso',
    status: 'prospect',
    stage: 'CaptaciÃ³n',
    zone: 'Palmanova',
    commission_est: 'â‚¬16.5K',
    last_update: 'Hace 2 semanas',
  },
  {
    id: '13',
    address: 'Carrer de la Playa, 1, Magaluf',
    price: 'â‚¬450K',
    type: 'Atico',
    status: 'listed',
    stage: 'Listado',
    zone: 'Magaluf',
    commission_est: 'â‚¬13.5K',
    last_update: 'Hace 3 dÃ­as',
  },
  {
    id: '14',
    address: 'CamÃ­ de Na Fita, 9, Es CapdellÃ ',
    price: 'â‚¬1.8M',
    type: 'Finca',
    status: 'offer',
    stage: 'NegociaciÃ³n',
    zone: 'Es CapdellÃ ',
    commission_est: 'â‚¬54K',
    last_update: 'Hace 8 horas',
  },
  {
    id: '15',
    address: 'Carrer de la Torre, 3, Portals Vells',
    price: 'â‚¬2.5M',
    type: 'Casa',
    status: 'listed',
    stage: 'Listado',
    zone: 'Portals Vells',
    commission_est: 'â‚¬75K',
    last_update: 'Hace 1 dÃ­a',
  },
  {
    id: '16',
    address: 'Avinguda de Bendinat, 15, Bendinat',
    price: 'â‚¬6.2M',
    type: 'Villa',
    status: 'prospect',
    stage: 'CaptaciÃ³n',
    zone: 'Bendinat',
    commission_est: 'â‚¬186K',
    last_update: 'Hace 4 horas',
  },
  {
    id: '17',
    address: 'Passeig de Illetas, 40, Illetas',
    price: 'â‚¬950K',
    type: 'Apartamento',
    status: 'sold',
    stage: 'Vendido',
    zone: 'Illetas',
    commission_est: 'â‚¬28.5K',
    last_update: 'Hace 2 semanas',
  },
  {
    id: '18',
    address: 'Carrer de la Rosa, 7, Cas CatalÃ ',
    price: 'â‚¬1.4M',
    type: 'Chalet',
    status: 'listed',
    stage: 'Listado',
    zone: 'Cas CatalÃ ',
    commission_est: 'â‚¬42K',
    last_update: 'Hace 1 mes',
  },
  {
    id: '19',
    address: 'Carrer del Sol, 1, Son Vida',
    price: 'â‚¬8.5M',
    type: 'Villa',
    status: 'listed',
    stage: 'Listado',
    zone: 'Son Vida',
    commission_est: 'â‚¬255K',
    last_update: 'Hace 10 horas',
  },
]

const MOCK_AGENT_LOGS: AgentLog[] = [
  {
    id: '4',
    agent: 'Weekly Recap',
    status: 'success',
    message: 'Recap semanal generado: 15 leads, â‚¬8.2M pipeline',
    timestamp: 'Hace 3 dÃ­as',
  },
  {
    id: '1',
    agent: 'Lead Intake',
    status: 'success',
    message: 'Nuevo lead cualificado: Klaus MÃ¼ller (P5)',
    timestamp: 'Hace 2 dÃ­as',
  },
  {
    id: '3',
    agent: 'Lead Intake',
    status: 'success',
    message: 'Nuevo lead cualificado: Carlos FernÃ¡ndez (P5)',
    timestamp: 'Hace 3 horas',
  },
  {
    id: '2',
    agent: 'Prospection',
    status: 'active',
    message: 'ProspecciÃ³n zona Puerto Portals en progreso...',
    timestamp: 'Hace 2 horas',
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
    latestInsight: 'Generando anÃ¡lisis de mercado...'
  },

  intelligence: {
    queryHistory: [],
    isProcessing: false,
    lastResponse: null,
  },

  setLeads: (leads) => set({ leads }),
  setTasks: (tasks) => set({ tasks }),
  setProperties: (properties) => set({ properties }),
  setAgentLogs: (agentLogs) => set({ agentLogs }),

  addLead: (leadData) => set((state) => ({
    leads: [{
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      ...leadData
    } as Lead, ...state.leads]
  })),
  updateLead: (id, updates) => set((state) => ({
    leads: state.leads.map(l => l.id === id ? { ...l, ...updates } : l)
  })),

  addTask: (taskData) => set((state) => ({
    tasks: [{
      id: Math.random().toString(36).substr(2, 9),
      ...taskData
    } as Task, ...state.tasks]
  })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),

  addProperty: (propertyData: Omit<Property, 'id'>) => set((state) => ({
    properties: [{
      id: Math.random().toString(36).substr(2, 9),
      last_update: 'Justo ahora',
      ...propertyData
    } as Property, ...state.properties]
  })),
  updateProperty: (id: string, updates: Partial<Property>) => set((state) => ({
    properties: state.properties.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  
  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t)
  })),

  deleteLead: (id) => set((state) => ({
    leads: state.leads.filter(l => l.id !== id)
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
  deleteProperty: (id) => set((state) => ({
    properties: state.properties.filter(p => p.id !== id)
  })),

  sendIntelligenceQuery: async (message, mode, domainHint) => {
    set((state) => ({ intelligence: { ...state.intelligence, isProcessing: true } }))
    try {
      // Import dynamic to avoid circular dep if any, though here it's fine
      const { fetchIntelligenceQuery } = await import('./api')
      const response = await fetchIntelligenceQuery(message, mode, domainHint)
      
      set((state) => ({
        intelligence: {
          ...state.intelligence,
          isProcessing: false,
          lastResponse: response,
          queryHistory: [...state.intelligence.queryHistory, { message, response }]
        }
      }))
    } catch (error) {
      set((state) => ({ intelligence: { ...state.intelligence, isProcessing: false } }))
      throw error
    }
  },

  clearIntelligenceHistory: () => set((state) => ({
    intelligence: { ...state.intelligence, queryHistory: [], lastResponse: null }
  })),

  initialize: async () => {
    try {
      // Try to fetch from Supabase, but fallback to mock data if it fails
      const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
      const { data: tasks } = await supabase.from('tasks').select('*').order('due_date', { ascending: true })
      const { data: props } = await supabase.from('properties').select('*')
      const { data: logs } = await supabase.from('agent_logs').select('*').order('timestamp', { ascending: false }).limit(20)

      if (leads && leads.length > 0) {
        set({
          leads: leads.map((l: any) => ({
            id: l.id,
            name: l.name,
            email: l.email || '',
            phone: l.phone || '',
            budget: l.budget_range || '',
            priority: l.ai_priority || 3,
            source: l.source || 'Direct',
            status: l.status || 'New',
            property_interest: l.property_interest || '',
            created_at: l.created_at
          }))
        })
      }

      if (tasks && tasks.length > 0) {
        set({
          tasks: tasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            due_time: t.due_date ? new Date(t.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00',
            status: t.status === 'done' ? 'done' : 'pending'
          }))
        })
      }

      if (props && props.length > 0) {
        set({
          properties: props.map((p: any) => ({
            id: p.id,
            title: p.address.split(',')[0], // Use first part of address as title
            address: p.address,
            price: p.price || 0,
            type: p.property_type || 'Villa',
            status: p.status === 'listed' ? 'listed' : p.status === 'sold' ? 'sold' : 'prospect',
            source_system: p.source_system || 'manual',
            source_portal: p.source_portal || undefined,
            useful_area_m2: p.useful_area_m2 ?? undefined,
            built_area_m2: p.built_area_m2 ?? p.surface_m2 ?? undefined,
            plot_area_m2: p.plot_area_m2 ?? undefined,
            zone: p.city || 'Mallorca',
            match_score: p.prospection_score ? Math.round(p.prospection_score * 100) : undefined
          }))
        })
      }
      
      if (logs && logs.length > 0) {
        set({ 
          agentLogs: logs.map((log: any) => {
            const date = new Date(log.timestamp)
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            
            return {
              id: log.id,
              agent: log.agent_name || log.skill_name || 'Agente',
              status: log.status === 'success' ? 'success' : log.status === 'running' ? 'active' : 'error',
              message: log.output?.ai_summary || log.output?.luxury_summary || log.output?.summary || log.output?.message || log.skill_name || 'EjecuciÃ³n finalizada',
              timestamp: timeStr
            }
          })
        })
      }

      // Update stats
      const latestRecap = logs && logs.length > 0 ? logs[0] : null // Placeholder or fetch actual recap
      
      // Fetch actual latest recap for insight
      const { data: recaps } = await supabase.from('weekly_recaps').select('insights').order('created_at', { ascending: false }).limit(1)
      const latestInsight = recaps && recaps.length > 0 ? recaps[0].insights : 'Ejecuta el Recap Semanal para generar insights.'

      set({
        stats: {
          leadsThisWeek: leads?.length || 0,
          responseRate: 98,
          activeMandates: props?.filter((p: any) => p.status === 'listed').length || 0,
          latestInsight: latestInsight
        }
      })
    } catch (error) {
      console.log('Using mock data (Supabase not available):', error)
      // Mock data is already set as default, no need to do anything
    }
  }
}))
