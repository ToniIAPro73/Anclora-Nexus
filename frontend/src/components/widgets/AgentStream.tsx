'use client'
import { useStore } from '@/lib/store'
import { PulseOrb } from '@/components/effects/PulseOrb'
import { TypeWriter, StaggerList, StaggerItem } from '@/components/effects/animations'
import { useI18n } from '@/lib/i18n'

export function AgentStream() {
  const logs = useStore((state) => state.agentLogs)
  const { t } = useI18n()

  return (
    <div className="widget-card h-full flex flex-col">
      <h3 className="widget-title">{t('agentStream')}</h3>
      <div className="flex-1 overflow-auto flex flex-col justify-start scrollbar-thin">
        <StaggerList className="space-y-4 w-full">
          {logs.length === 0 ? (
            <p className="text-xs text-soft-muted italic">{t('noRecentActivity')}</p>
          ) : (
            logs.map((log, i) => (
              <StaggerItem key={log.id} className="flex gap-3">
                <div className="mt-1">
                  <PulseOrb status={log.status === 'success' ? 'active' : log.status} size={6} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-tighter">
                      {t(`TYPE_${log.agent.replace(/\s+/g, '_').toUpperCase()}` as any) || log.agent}
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
