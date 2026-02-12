export const translations = {
  es: {
    // Navigation
    dashboard: 'Dashboard',
    leads: 'Leads',
    properties: 'Propiedades',
    tasks: 'Tareas',
    logout: 'Cerrar sesión',

    // Dashboard widgets
    leadsPulse: 'Leads Pulse',
    tasksToday: 'Tareas de Hoy',
    propertyPipeline: 'Pipeline de Propiedades',
    quickStats: 'Estadísticas Rápidas',
    agentStream: 'Agent Stream',
    quickActions: 'Acciones Rápidas',

    // Quick Actions
    newLead: 'Nuevo Lead',
    manualEntry: 'Alta Manual',
    prospectionRun: 'Prospection Run',
    weeklySearch: 'Scan Semanal',
    forceRecap: 'Force Recap',
    generateReport: 'Generar Reporte',

    // Stats
    leadsThisWeek: 'Leads esta semana',
    responseRate: 'Tasa de respuesta',
    activeMandates: 'Mandatos activos',

    // Agent Stream
    noRecentActivity: 'No hay actividad reciente',
    live: 'LIVE',

    // Leads
    lead: 'Lead',
    contact: 'Contacto',
    budget: 'Budget',
    priority: 'Prioridad',
    source: 'Fuente',
    status: 'Estado',
    noLeadsRegistered: 'No hay leads registrados',
    total: 'Total',
    contactManagement: 'Gestión de contactos y oportunidades',

    // Properties
    price: 'Precio',
    estimatedCommission: 'Comisión Est.',
    lastUpdate: 'Última actualización',
    noPipelineProperties: 'No hay propiedades en el pipeline',
    propertyManagement: 'Pipeline de propiedades en gestión',

    // Tasks
    pending: 'Pendientes',
    completed: 'Completadas',
    noPendingTasks: 'No hay tareas pendientes',
    noCompletedTasks: 'No hay tareas completadas',
    taskManagement: 'Gestión de tareas y actividades',

    // Common
    backToDashboard: 'Volver al Dashboard',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    leads: 'Leads',
    properties: 'Properties',
    tasks: 'Tasks',
    logout: 'Logout',

    // Dashboard widgets
    leadsPulse: 'Leads Pulse',
    tasksToday: 'Today\'s Tasks',
    propertyPipeline: 'Property Pipeline',
    quickStats: 'Quick Stats',
    agentStream: 'Agent Stream',
    quickActions: 'Quick Actions',

    // Quick Actions
    newLead: 'New Lead',
    manualEntry: 'Manual Entry',
    prospectionRun: 'Prospection Run',
    weeklySearch: 'Weekly Scan',
    forceRecap: 'Force Recap',
    generateReport: 'Generate Report',

    // Stats
    leadsThisWeek: 'Leads this week',
    responseRate: 'Response rate',
    activeMandates: 'Active mandates',

    // Agent Stream
    noRecentActivity: 'No recent activity',
    live: 'LIVE',

    // Leads
    lead: 'Lead',
    contact: 'Contact',
    budget: 'Budget',
    priority: 'Priority',
    source: 'Source',
    status: 'Status',
    noLeadsRegistered: 'No leads registered',
    total: 'Total',
    contactManagement: 'Contact and opportunity management',

    // Properties
    price: 'Price',
    estimatedCommission: 'Est. Commission',
    lastUpdate: 'Last update',
    noPipelineProperties: 'No properties in pipeline',
    propertyManagement: 'Property pipeline management',

    // Tasks
    pending: 'Pending',
    completed: 'Completed',
    noPendingTasks: 'No pending tasks',
    noCompletedTasks: 'No completed tasks',
    taskManagement: 'Task and activity management',

    // Common
    backToDashboard: 'Back to Dashboard',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  de: {
    // Navigation
    dashboard: 'Dashboard',
    leads: 'Leads',
    properties: 'Immobilien',
    tasks: 'Aufgaben',
    logout: 'Abmelden',

    // Dashboard widgets
    leadsPulse: 'Leads Pulse',
    tasksToday: 'Heutige Aufgaben',
    propertyPipeline: 'Immobilien-Pipeline',
    quickStats: 'Schnellstatistiken',
    agentStream: 'Agent Stream',
    quickActions: 'Schnellaktionen',

    // Quick Actions
    newLead: 'Neuer Lead',
    manualEntry: 'Manuelle Eingabe',
    prospectionRun: 'Prospektionssuche',
    weeklySearch: 'Wöchentlicher Scan',
    forceRecap: 'Zusammenfassung erzwingen',
    generateReport: 'Bericht erstellen',

    // Stats
    leadsThisWeek: 'Leads diese Woche',
    responseRate: 'Antwortrate',
    activeMandates: 'Aktive Mandate',

    // Agent Stream
    noRecentActivity: 'Keine aktuelle Aktivität',
    live: 'LIVE',

    // Leads
    lead: 'Lead',
    contact: 'Kontakt',
    budget: 'Budget',
    priority: 'Priorität',
    source: 'Quelle',
    status: 'Status',
    noLeadsRegistered: 'Keine Leads registriert',
    total: 'Gesamt',
    contactManagement: 'Kontakt- und Chancenverwaltung',

    // Properties
    price: 'Preis',
    estimatedCommission: 'Geschätzte Provision',
    lastUpdate: 'Letzte Aktualisierung',
    noPipelineProperties: 'Keine Immobilien in der Pipeline',
    propertyManagement: 'Immobilien-Pipeline-Verwaltung',

    // Tasks
    pending: 'Ausstehend',
    completed: 'Abgeschlossen',
    noPendingTasks: 'Keine ausstehenden Aufgaben',
    noCompletedTasks: 'Keine abgeschlossenen Aufgaben',
    taskManagement: 'Aufgaben- und Aktivitätsverwaltung',

    // Common
    backToDashboard: 'Zurück zum Dashboard',
    loading: 'Lädt...',
    error: 'Fehler',
    success: 'Erfolg',
  },
} as const

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.es
