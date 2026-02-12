'use client'
import { useStore } from '@/lib/store'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function TasksToday() {
  const { tasks, toggleTask } = useStore()

  return (
    <div className="widget-card h-full flex flex-col">
      <h3 className="widget-title">Tasks Today</h3>
      
      <div className="flex-1 space-y-3 overflow-auto pr-2">
        <AnimatePresence mode='popLayout'>
          {tasks.map((task) => (
            <motion.div
              layout
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={`flex items-start gap-3 p-3 rounded-widget-inner border transition-all ${
                task.status === 'done' 
                  ? 'bg-soft-subtle border-transparent' 
                  : 'bg-navy-mid/30 border-soft-subtle hover:border-gold/30'
              }`}
            >
              <button 
                onClick={() => toggleTask(task.id)}
                className="mt-0.5 text-soft-muted hover:text-gold transition-colors"
              >
                {task.status === 'done' ? (
                  <CheckCircle2 className="w-5 h-5 text-gold" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              
              <div className="flex-1">
                <p className={`text-sm font-medium transition-all ${
                  task.status === 'done' ? 'text-soft-muted line-through' : 'text-soft-white'
                }`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] uppercase tracking-wider text-soft-muted">
                  <Clock className="w-3 h-3" />
                  <span>{task.due_time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
