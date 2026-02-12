'use client'
import { useStore } from '@/lib/store'
import { PulseOrb } from '@/components/effects/PulseOrb'
import { TypeWriter } from '@/components/effects/TypeWriter'
import { Bot } from 'lucide-react'

export function AgentStream() {
  const logs = useStore((state) => state.agentLogs)

  return (
    <div className="widget-card h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-4 h-4 text-blue-light" />
        <h3 className="widget-title mb-0">Agent Stream</h3>
      </div>
      
      <div className="flex-1 space-y-4 overflow-auto text-xs">
        {logs.map((log, idx) => (
          <div key={log.id} className="flex gap-3 relative">
            {idx < logs.length - 1 && (
              <div className="absolute left-[7px] top-4 bottom-[-16px] w-[1px] bg-soft-subtle" />
            )}
            <div className="relative z-10 pt-0.5">
              <PulseOrb status={log.status as any} size={6} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-blue-light uppercase tracking-tighter">{log.agent}</span>
                <span className="text-[10px] text-soft-muted opacity-50">{log.timestamp}</span>
              </div>
              <div className="text-soft-muted leading-relaxed">
                {idx === 0 ? (
                  <TypeWriter text={log.message} speed={30} />
                ) : (
                  log.message
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
