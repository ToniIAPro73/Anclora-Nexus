'use client'
import { BentoGrid, BentoCell } from '@/components/layout/BentoGrid'
import { LeadsPulse } from '@/components/widgets/LeadsPulse'
import { TasksToday } from '@/components/widgets/TasksToday'
import { PropertyPipeline } from '@/components/widgets/PropertyPipeline'
import { QuickStats } from '@/components/widgets/QuickStats'
import { AgentStream } from '@/components/widgets/AgentStream'
import { QuickActions } from '@/components/widgets/QuickActions'

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col overflow-auto bg-navy-darker/20">
      <BentoGrid>
        {/* Row 1: LeadsPulse (4x2) and TasksToday (2x2) */}
        <BentoCell colSpan={4} rowSpan={2}>
          <LeadsPulse />
        </BentoCell>
        <BentoCell colSpan={2} rowSpan={2}>
          <TasksToday />
        </BentoCell>

        {/* Row 2: Property (2x2), Stats (2x1), Agent (2x1) */}
        <BentoCell colSpan={2} rowSpan={2}>
          <PropertyPipeline />
        </BentoCell>
        <BentoCell colSpan={2} rowSpan={1}>
          <QuickStats />
        </BentoCell>
        <BentoCell colSpan={2} rowSpan={1}>
          <AgentStream />
        </BentoCell>

        {/* Row 3: Final QuickActions (4x1 in desktop, logic handles span) */}
        <BentoCell colSpan={4} rowSpan={1}>
          <QuickActions />
        </BentoCell>
      </BentoGrid>
    </div>
  )
}
