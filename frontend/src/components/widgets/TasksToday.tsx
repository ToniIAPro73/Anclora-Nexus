'use client'
import { useStore } from '@/lib/store'
import { StaggerList, StaggerItem } from '@/components/effects/animations'
import { Check } from 'lucide-react'

export function TasksToday() {
  const { tasks, toggleTask } = useStore((state) => ({ 
    tasks: state.tasks, 
    toggleTask: state.toggleTask 
  }))

  return (
    <div className="widget-card h-full flex flex-col">
      <h3 className="widget-title">Tareas de Hoy</h3>
      <div className="flex-1 overflow-auto">
        <StaggerList className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-xs text-soft-muted italic">No hay tareas para hoy</p>
          ) : (
            tasks.map((task) => (
              <StaggerItem key={task.id}>
                <div 
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 border border-transparent hover:border-soft-subtle cursor-pointer ${
                    task.status === 'done' ? 'bg-white/5 opacity-50' : 'bg-navy-surface/40'
                  }`}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    task.status === 'done' ? 'bg-gold border-gold' : 'border-soft-subtle group-hover:border-gold/50'
                  }`}>
                    {task.status === 'done' && <Check className="w-3 h-3 text-navy-deep" strokeWidth={4} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${task.status === 'done' ? 'line-through text-soft-muted' : 'text-soft-white'}`}>
                      {task.title}
                    </p>
                    <p className="text-[10px] text-soft-muted uppercase tracking-wider">{task.due_time}</p>
                  </div>
                </div>
              </StaggerItem>
            ))
          )}
        </StaggerList>
      </div>
    </div>
  )
}
