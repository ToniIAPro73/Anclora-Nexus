export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Nuevo Lead Calificado',
    message: 'Klaus Müller ha sido calificado como P5 (alta prioridad)',
    timestamp: 'Hace 5 min',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Prospection Run Completado',
    message: '4 propiedades nuevas encontradas en Port Andratx',
    timestamp: 'Hace 1 hora',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Tarea Próxima a Vencer',
    message: 'Follow-up con James Richardson vence en 2 horas',
    timestamp: 'Hace 2 horas',
    read: false,
  },
  {
    id: '4',
    type: 'success',
    title: 'Weekly Recap Generado',
    message: 'Resumen semanal disponible: 15 leads, 98% respuesta',
    timestamp: 'Hace 3 horas',
    read: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'Propiedad Actualizada',
    message: 'Villa Port Andratx - Precio ajustado a €4.2M',
    timestamp: 'Ayer',
    read: true,
  },
  {
    id: '6',
    type: 'success',
    title: 'Lead Contactado',
    message: 'Sophie Dubois respondió positivamente al email inicial',
    timestamp: 'Hace 1 día',
    read: true,
  },
  {
    id: '7',
    type: 'warning',
    title: 'Límite de Tokens',
    message: 'Has usado el 75% del límite diario de tokens LLM',
    timestamp: 'Hace 2 días',
    read: true,
  },
  {
    id: '8',
    type: 'info',
    title: 'Nueva Propiedad en Pipeline',
    message: 'Finca rústica en Calvià añadida al pipeline',
    timestamp: 'Hace 2 días',
    read: true,
  },
  {
    id: '9',
    type: 'error',
    title: 'Error en Prospection',
    message: 'Fallo al conectar con API de Idealista. Reintentando...',
    timestamp: 'Hace 3 días',
    read: true,
  },
  {
    id: '10',
    type: 'success',
    title: 'Mandato Firmado',
    message: 'Contrato de exclusiva firmado para Villa Son Ferrer',
    timestamp: 'Hace 4 días',
    read: true,
  },
]
