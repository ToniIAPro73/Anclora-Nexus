'use client'
import { useState } from 'react'
import { useStore, Task } from '@/lib/store' // Added Task type import
import { ArrowLeft, Check, Clock, Calendar, ChevronLeft, ChevronRight, Trash2, Edit2, Plus, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import TaskFormModal from '@/components/modals/TaskFormModal'
import { approveSyncXmlPilot, rejectSyncXmlPilot, requestMoreInfoSyncXmlPilot } from '@/lib/syncxml-pilot-api'

export default function TasksPage() {
  const tasks = useStore((state) => state.tasks)
  const toggleTask = useStore((state) => state.toggleTask)
  const deleteTask = useStore((state) => state.deleteTask)
  const { t } = useI18n()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const doneTasks = tasks.filter(t => t.status === 'done')

  const ITEMS_PER_PAGE = 5
  const [pendingPage, setPendingPage] = useState(1)
  const [donePage, setDonePage] = useState(1)

  const pendingTotalPages = Math.ceil(pendingTasks.length / ITEMS_PER_PAGE)
  const doneTotalPages = Math.ceil(doneTasks.length / ITEMS_PER_PAGE)

  const visiblePending = pendingTasks.slice((pendingPage - 1) * ITEMS_PER_PAGE, pendingPage * ITEMS_PER_PAGE)
  const visibleDone = doneTasks.slice((donePage - 1) * ITEMS_PER_PAGE, donePage * ITEMS_PER_PAGE)

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleNewTask = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  // ... (inside return)
  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg bg-navy-surface/40 border border-soft-subtle hover:border-gold/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-soft-white" />
            </Link>
            <div>
              <h1 className="page-title">{t('tasks')}</h1>
              <p className="text-sm text-soft-muted mt-1">{t('taskManagement')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button
                onClick={handleNewTask}
                className="btn-create"
              >
                <Plus className="w-4 h-4" />
                Nueva Tarea
              </button>
             <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <span className="text-sm text-soft-muted">{t('pending')}: </span>
                <span className="text-lg font-bold text-amber-400">{pendingTasks.length}</span>
             </div>
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <span className="text-sm text-soft-muted">{t('completed')}: </span>
                <span className="text-lg font-bold text-emerald-400">{doneTasks.length}</span>
             </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <div className="bg-navy-surface/40 border border-soft-subtle rounded-2xl p-6 flex flex-col hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-soft-white">{t('pending')}</h2>
            </div>
            <div className="space-y-3 flex-1">
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-soft-muted italic text-center py-8">
                  {t('noPendingTasks')}
                </p>
              ) : (
                visiblePending.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-navy-deep/40 border border-soft-subtle hover:border-gold/30 transition-all cursor-pointer group"
                    onClick={() => {
                      if (task.task_type !== 'syncxml_pilot_review') toggleTask(task.id)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md border-2 border-soft-subtle group-hover:border-gold/50 flex items-center justify-center transition-colors flex-shrink-0">
                        {/* Empty checkbox */}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-soft-white group-hover:text-gold transition-colors">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-soft-muted" />
                          <span className="text-xs text-soft-muted uppercase tracking-wider">
                            {task.due_time}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(task)
                          }}
                          className="p-2 text-soft-muted/50 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all shrink-0"
                          title="Editar tarea"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm('¿Eliminar esta tarea?')) deleteTask(task.id)
                          }}
                          className="p-2 text-soft-muted/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {task.task_type === 'syncxml_pilot_review' ? <SyncXmlPilotTaskPanel task={task} /> : null}
                  </motion.div>
                ))
              )}
            </div>
            {/* Pagination Pending */}
            {pendingTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-soft-subtle/30 pt-4 mt-4">
                <button
                  onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                  disabled={pendingPage === 1}
                  className="p-1 rounded-md hover:bg-white/5 disabled:opacity-30 transition-colors text-soft-muted"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] text-soft-muted">
                  {pendingPage} / {pendingTotalPages}
                </span>
                <button
                  onClick={() => setPendingPage(p => Math.min(pendingTotalPages, p + 1))}
                  disabled={pendingPage === pendingTotalPages}
                  className="p-1 rounded-md hover:bg-white/5 disabled:opacity-30 transition-colors text-soft-muted"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Done Tasks */}
          <div className="bg-navy-surface/40 border border-soft-subtle rounded-2xl p-6 flex flex-col hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300">
            <div className="flex items-center gap-2 mb-6">
              <Check className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-soft-white">{t('completed')}</h2>
            </div>
            <div className="space-y-3 flex-1">
              {doneTasks.length === 0 ? (
                <p className="text-sm text-soft-muted italic text-center py-8">
                  {t('noCompletedTasks')}
                </p>
              ) : (
                visibleDone.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-soft-subtle/50 opacity-60 hover:opacity-100 transition-all cursor-pointer group"
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className="w-6 h-6 rounded-md bg-gold border-2 border-gold flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-[#0F1629]" strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-soft-muted line-through">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-soft-muted" />
                        <span className="text-xs text-soft-muted uppercase tracking-wider">
                          {task.due_time}
                        </span>
                      </div>
                    </div>
                     <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(task)
                        }}
                        className="p-2 text-soft-muted/50 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all shrink-0"
                        title="Editar tarea"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm('¿Eliminar esta tarea?')) deleteTask(task.id)
                        }}
                        className="p-2 text-soft-muted/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            {/* Pagination Done */}
            {doneTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-soft-subtle/30 pt-4 mt-4">
                <button
                  onClick={() => setDonePage(p => Math.max(1, p - 1))}
                  disabled={donePage === 1}
                  className="p-1 rounded-md hover:bg-white/5 disabled:opacity-30 transition-colors text-soft-muted"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] text-soft-muted">
                  {donePage} / {doneTotalPages}
                </span>
                <button
                  onClick={() => setDonePage(p => Math.min(doneTotalPages, p + 1))}
                  disabled={donePage === doneTotalPages}
                  className="p-1 rounded-md hover:bg-white/5 disabled:opacity-30 transition-colors text-soft-muted"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editTask={editingTask}
      />
    </div>
  )
}

function readPath(source: unknown, path: string[]): unknown {
  return path.reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[key]
  }, source)
}

function text(value: unknown, fallback = 'No especificado') {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number') return String(value)
  return fallback
}

function SyncXmlPilotTaskPanel({ task }: { task: Task }) {
  const [mode, setMode] = useState<'idle' | 'reject' | 'more-info'>('idle')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [internalReason, setInternalReason] = useState('')
  const [userReason, setUserReason] = useState('En esta fase estamos aceptando únicamente casos que encajan con una validación controlada muy concreta. Tu solicitud no encaja suficientemente con el alcance actual del piloto o requiere condiciones que todavía no ofrecemos.')
  const [message, setMessage] = useState('Gracias por tu interés en Anclora SyncXML. Antes de confirmar el acceso al piloto necesitamos aclarar algunos detalles sobre tu caso de uso y confirmar que la prueba se realizará solo con datos sintéticos o anonimizados.')

  const metadata = task.metadata || {}
  const accessRequest = readPath(metadata, ['access_request']) || {}
  const aiReview = readPath(metadata, ['ai_review']) || {}
  const requestId = task.entity_id || text(readPath(accessRequest, ['id']), '')
  const email = text(readPath(accessRequest, ['email']))
  const fullName = text(readPath(accessRequest, ['full_name']))
  const company = text(readPath(accessRequest, ['company']))
  const accommodation = text(readPath(accessRequest, ['profile_type']))
  const volume = text(readPath(accessRequest, ['metadata', 'estimatedMonthlyReservations']))
  const mainPain = text(readPath(accessRequest, ['service_summary']))
  const score = text(readPath(aiReview, ['score']), 'Sin score')
  const decision = text(readPath(aiReview, ['decision']), 'Sin recomendación')
  const flags = Array.isArray(readPath(aiReview, ['riskFlags'])) ? readPath(aiReview, ['riskFlags']) as unknown[] : []
  const credentialStatus = text(readPath(metadata, ['credential_status']), 'Pendiente')
  const emailStatus = text(readPath(metadata, ['email_status']), 'Pendiente')
  const errorMessage = text(readPath(metadata, ['error_message']), '')

  async function run(action: 'approve' | 'reject' | 'more-info') {
    setError(null)
    if (!requestId) {
      setError('Falta entity_id/request id para operar esta solicitud.')
      return
    }
    if (action === 'approve' && !window.confirm(`¿Aprobar este piloto y enviar credenciales a ${email}?`)) return
    if (action === 'reject' && (!internalReason.trim() || !userReason.trim())) {
      setError('El rechazo requiere motivo interno y motivo visible para usuario.')
      return
    }
    if (action === 'more-info' && !message.trim()) {
      setError('La solicitud de más información requiere mensaje.')
      return
    }
    setBusy(true)
    try {
      if (action === 'approve') await approveSyncXmlPilot(requestId, {})
      if (action === 'reject') await rejectSyncXmlPilot(requestId, { internal_reason: internalReason, user_reason: userReason })
      if (action === 'more-info') await requestMoreInfoSyncXmlPilot(requestId, { message })
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-4" onClick={(event) => event.stopPropagation()}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
          SyncXML · Piloto controlado
        </span>
        {flags.length ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-300">
            <AlertTriangle className="h-3 w-3" />
            Riesgo revisable
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 text-xs text-soft-muted sm:grid-cols-2">
        <Info label="Nombre" value={fullName} />
        <Info label="Email" value={email} />
        <Info label="Empresa" value={company} />
        <Info label="Alojamiento" value={accommodation} />
        <Info label="Volumen estimado" value={volume} />
        <Info label="Score Hermes" value={score} />
        <Info label="Recomendación Hermes" value={decision} />
        <Info label="Credenciales" value={credentialStatus} />
        <Info label="Email" value={emailStatus} />
        {errorMessage ? <Info label="Error" value={errorMessage} /> : null}
      </div>
      <div className="mt-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-soft-muted">Problema declarado</p>
        <p className="mt-1 text-sm text-soft-white">{mainPain}</p>
      </div>
      {flags.length ? (
        <p className="mt-3 text-xs text-amber-300">Flags: {flags.map(String).join(', ')}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-create" disabled={busy} onClick={() => run('approve')}>Aprobar piloto</button>
        <button className="rounded-lg border border-red-400/30 px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-500/10" disabled={busy} onClick={() => setMode(mode === 'reject' ? 'idle' : 'reject')}>Rechazar piloto</button>
        <button className="rounded-lg border border-blue-400/30 px-3 py-2 text-sm font-bold text-blue-300 hover:bg-blue-500/10" disabled={busy} onClick={() => setMode(mode === 'more-info' ? 'idle' : 'more-info')}>Solicitar más información</button>
      </div>

      {mode === 'reject' ? (
        <div className="mt-4 grid gap-3">
          <textarea className="ui-input min-h-20 py-2" value={internalReason} onChange={(event) => setInternalReason(event.target.value)} placeholder="Motivo interno" />
          <textarea className="ui-input min-h-24 py-2" value={userReason} onChange={(event) => setUserReason(event.target.value)} placeholder="Motivo visible para usuario" />
          <button className="btn-create justify-center" disabled={busy} onClick={() => run('reject')}>Confirmar rechazo y enviar email</button>
        </div>
      ) : null}

      {mode === 'more-info' ? (
        <div className="mt-4 grid gap-3">
          <textarea className="ui-input min-h-24 py-2" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Mensaje para el usuario" />
          <button className="btn-create justify-center" disabled={busy} onClick={() => run('more-info')}>Enviar solicitud de más información</button>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-300" role="alert">{error}</p> : null}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-soft-muted">{label}</p>
      <p className="mt-1 text-sm text-soft-white">{value}</p>
    </div>
  )
}
