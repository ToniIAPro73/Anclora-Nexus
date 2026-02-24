'use client'
import { useState } from 'react'
import { useStore, Task } from '@/lib/store' // Added Task type import
import { ArrowLeft, Check, Clock, Calendar, ChevronLeft, ChevronRight, Trash2, Edit2, Plus } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import TaskFormModal from '@/components/modals/TaskFormModal'

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
              <h1 className="text-3xl font-bold text-soft-white">{t('tasks')}</h1>
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
                    className="flex items-center gap-3 p-4 rounded-xl bg-navy-deep/40 border border-soft-subtle hover:border-gold/30 transition-all cursor-pointer group"
                    onClick={() => toggleTask(task.id)}
                  >
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
                      <Check className="w-4 h-4 text-navy-deep" strokeWidth={3} />
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
