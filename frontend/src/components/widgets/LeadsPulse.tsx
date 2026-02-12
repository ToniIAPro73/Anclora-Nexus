'use client'
import { useStore } from '@/lib/store'
import { PulseOrb } from '@/components/effects/PulseOrb'
import { GoldShimmer } from '@/components/effects/GoldShimmer'

export function LeadsPulse() {
  const leads = useStore((state) => state.leads)

  return (
    <GoldShimmer className="h-full">
      <div className="widget-card h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="widget-title mb-0">Leads Pulse</h3>
          <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <PulseOrb status="active" size={6} />
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider">LIVE</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-soft-muted border-b border-soft-subtle">
                <th className="pb-3 font-semibold">Lead</th>
                <th className="pb-3 font-semibold">Budget</th>
                <th className="pb-3 font-semibold">Priority</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soft-subtle">
              {leads.map((lead) => (
                <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-soft-white">{lead.name}</span>
                      <span className="text-xs text-soft-muted">{lead.source}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm font-medium text-blue-light">{lead.budget}</td>
                  <td className="py-4">
                    <span className={`priority-badge priority-${lead.priority}`}>
                      P{lead.priority}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="text-xs text-soft-muted font-medium">{lead.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GoldShimmer>
  )
}
