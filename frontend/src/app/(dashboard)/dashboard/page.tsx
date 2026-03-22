'use client'
import { LeadsPulse } from "@/components/widgets/LeadsPulse"
import { TasksToday } from "@/components/widgets/TasksToday"
import { PropertyPipeline } from "@/components/widgets/PropertyPipeline"
import { QuickStats } from "@/components/widgets/QuickStats"
import { AgentStream } from "@/components/widgets/AgentStream"
import { QuickActions } from "@/components/widgets/QuickActions"
import { BudgetStatusWidget } from "@/components/widgets/BudgetStatusWidget"
import { RadarTerritorial } from "@/components/widgets/RadarTerritorial"
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
      <StaggerList className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)] gap-4 xl:gap-6 items-start">
        <div className="space-y-4 xl:space-y-6 min-w-0">
          <StaggerItem>
            <LeadsPulse />
          </StaggerItem>

          <StaggerItem>
            <PropertyPipeline />
          </StaggerItem>

          <StaggerItem>
            <RadarTerritorial />
          </StaggerItem>
        </div>

        <div className="space-y-4 xl:space-y-6 min-w-0">
          <StaggerItem>
            <TasksToday />
          </StaggerItem>

          <StaggerItem>
            <QuickStats />
          </StaggerItem>

          <StaggerItem>
            <QuickActions />
          </StaggerItem>

          <StaggerItem>
            <AgentStream />
          </StaggerItem>

          <StaggerItem>
            <BudgetStatusWidget />
          </StaggerItem>
        </div>
      </StaggerList>
    </div>
  )
}
