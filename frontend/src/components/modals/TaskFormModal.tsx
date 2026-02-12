'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, CheckSquare, Clock } from 'lucide-react'
import { useStore, Task } from '@/lib/store'

interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  editTask?: Task | null
}

export default function TaskFormModal({ isOpen, onClose, editTask }: TaskFormModalProps) {
  const addTask = useStore((state) => state.addTask)
  const updateTask = useStore((state) => state.updateTask)

  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    due_time: '',
    status: 'pending',
  })

  useEffect(() => {
    if (editTask) {
      setFormData(editTask)
    } else {
      setFormData({
        title: '',
        due_time: '',
        status: 'pending',
      })
    }
  }, [editTask, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return

    if (editTask) {
      updateTask(editTask.id, formData)
    } else {
      addTask(formData as Omit<Task, 'id'>)
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-navy-deep border border-soft-subtle rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-soft-subtle flex items-center justify-between bg-navy-surface/50">
              <h2 className="text-xl font-bold text-soft-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-gold" />
                {editTask ? 'Editar Tarea' : 'Nueva Tarea'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 -mr-2 text-soft-muted hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Título</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50"
                  placeholder="Descripción de la tarea"
                />
              </div>

              {/* Due Time */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Vencimiento</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-subtle" />
                  <input
                    type="text"
                    value={formData.due_time || ''}
                    onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-soft-subtle/50"
                    placeholder="ej. Mañana 10:00"
                  />
                </div>
              </div>

               {/* Status */}
               <div className="space-y-2">
                <label className="text-xs font-semibold text-soft-muted uppercase tracking-wider">Estado</label>
                <select
                  value={formData.status || 'pending'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'done' })}
                  className="w-full px-4 py-2 bg-navy-surface/50 border border-soft-subtle rounded-lg text-soft-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all appearance-none cursor-pointer"
                >
                    <option value="pending">Pendiente</option>
                    <option value="done">Completada</option>
                </select>
              </div>

              {/* Footer */}
              <div className="pt-6 mt-6 border-t border-soft-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-soft-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gold text-navy-deep text-sm font-bold hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editTask ? 'Guardar Cambios' : 'Crear Tarea'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
