'use client'
import { useStore } from '@/lib/store'
import { PulseOrb } from '@/components/effects/PulseOrb'
import { TypeWriter, StaggerList, StaggerItem } from '@/components/effects/animations'

export function AgentStream() {
  const logs = useStore((state) => state.agentLogs)

  return (
    <div className="widget-card h-full flex flex-col">
      <h3 className="widget-title">Agent Stream</h3>
      <div className="flex-1 overflow-auto">
        <StaggerList className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-xs text-soft-muted italic">No hay actividad reciente</p>
          ) : (
            logs.map((log, i) => (
              <StaggerItem key={log.id} className="flex gap-3">
                <div className="mt-1">
                  <PulseOrb status={log.status === 'success' ? 'active' : log.status} size={6} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-tighter">
                      {log.agent}
                    </span>
                    <span className="text-[9px] text-white/30">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {i === 0 ? (
                      <TypeWriter text={log.message} speed={20} />
                    ) : (
                      log.message
                    )}
                  </p>
                </div>
              </StaggerItem>
            ))
          )}
        </StaggerList>
      </div>
    </div>
  )
}
