'use client'
import { BentoGrid, BentoCell } from "@/components/layout/BentoGrid"
import { LeadsPulse } from "@/components/widgets/LeadsPulse"
import { TasksToday } from "@/components/widgets/TasksToday"
import { PropertyPipeline } from "@/components/widgets/PropertyPipeline"
import { QuickStats } from "@/components/widgets/QuickStats"
import { AgentStream } from "@/components/widgets/AgentStream"
import { QuickActions } from "@/components/widgets/QuickActions"
import { StaggerList, StaggerItem } from "@/components/effects/animations"
import { useEffect } from "react"
import { useStore } from "@/lib/store"

export default function DashboardPage() {
  const initialize = useStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <div className="p-6 min-h-full">
      <StaggerList>
        <BentoGrid>
          <StaggerItem>
            <BentoCell colSpan={2} rowSpan={2}>
              <LeadsPulse />
            </BentoCell>
          </StaggerItem>

          <StaggerItem>
            <BentoCell colSpan={1} rowSpan={2}>
              <TasksToday />
            </BentoCell>
          </StaggerItem>

          <StaggerItem>
            <BentoCell colSpan={1} rowSpan={1}>
              <QuickStats />
            </BentoCell>
          </StaggerItem>

          <StaggerItem>
            <BentoCell colSpan={2} rowSpan={2}>
              <PropertyPipeline />
            </BentoCell>
          </StaggerItem>

          <StaggerItem>
            <BentoCell colSpan={1} rowSpan={1}>
              <QuickActions />
            </BentoCell>
          </StaggerItem>

          <StaggerItem>
            <BentoCell colSpan={1} rowSpan={1}>
              <AgentStream />
            </BentoCell>
          </StaggerItem>
        </BentoGrid>
      </StaggerList>
    </div>
  )
}
