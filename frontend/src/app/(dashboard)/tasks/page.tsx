'use client'
import { useStore } from '@/lib/store'
import { ArrowLeft, Check, Clock, Calendar } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function TasksPage() {
  const tasks = useStore((state) => state.tasks)
  const toggleTask = useStore((state) => state.toggleTask)

  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const doneTasks = tasks.filter(t => t.status === 'done')

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
              <h1 className="text-3xl font-bold text-soft-white">Tasks</h1>
              <p className="text-sm text-soft-muted mt-1">Gestión de tareas y actividades</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <span className="text-sm text-soft-muted">Pendientes: </span>
              <span className="text-lg font-bold text-amber-400">{pendingTasks.length}</span>
            </div>
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <span className="text-sm text-soft-muted">Completadas: </span>
              <span className="text-lg font-bold text-emerald-400">{doneTasks.length}</span>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <div className="bg-navy-surface/40 border border-soft-subtle rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-soft-white">Pendientes</h2>
            </div>
            <div className="space-y-3">
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-soft-muted italic text-center py-8">
                  No hay tareas pendientes
                </p>
              ) : (
                pendingTasks.map((task, index) => (
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
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Done Tasks */}
          <div className="bg-navy-surface/40 border border-soft-subtle rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Check className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-soft-white">Completadas</h2>
            </div>
            <div className="space-y-3">
              {doneTasks.length === 0 ? (
                <p className="text-sm text-soft-muted italic text-center py-8">
                  No hay tareas completadas
                </p>
              ) : (
                doneTasks.map((task, index) => (
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
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
