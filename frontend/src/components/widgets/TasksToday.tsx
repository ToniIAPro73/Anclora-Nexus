'use client'
import { useStore } from '@/lib/store'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function TasksToday() {
  const tasks = useStore((state) => state.tasks)
  const toggleTask = useStore((state) => state.toggleTask)
  const { t } = useI18n()

  const displayTasks = tasks.slice(0, 5)

  return (
    <div className="widget-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Link href="/tasks" className="hover:opacity-80 transition-opacity">
          <h3 className="widget-title mb-0 cursor-pointer">{t('tasksToday')}</h3>
        </Link>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto -mx-2 px-2">
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-xs text-soft-muted italic">{t('noPendingTasks')}</p>
            ) : (
              displayTasks.map((task) => (
                <div 
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 border border-transparent hover:border-soft-subtle cursor-pointer group ${
                    task.status === 'done' ? 'bg-white/5 opacity-50' : 'bg-navy-surface/40 hover:bg-white/[0.04]'
                  }`}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    task.status === 'done' ? 'bg-gold border-gold' : 'border-soft-subtle group-hover:border-gold/50'
                  }`}>
                    {task.status === 'done' && <Check className="w-3 h-3 text-navy-deep" strokeWidth={4} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${task.status === 'done' ? 'line-through text-soft-muted' : 'text-soft-white group-hover:text-gold transition-colors'}`}>
                      {task.title || 'Tarea sin título'}
                    </p>
                    <p className="text-[10px] text-soft-muted uppercase tracking-wider">{task.due_time || '--:--'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {tasks.length > 5 && (
          <div className="pt-3 border-t border-soft-subtle/30 mt-auto flex justify-center">
            <Link 
              href="/tasks" 
              className="text-[10px] uppercase tracking-wider font-bold text-soft-muted hover:text-gold transition-colors flex items-center gap-1 group"
            >
              {t('viewAll')} 
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
