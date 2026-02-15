'use client'

import { useEffect, useState } from 'react'
import { Wallet, AlertTriangle, ShieldAlert } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { getBudget, BudgetPolicy } from '@/lib/finops-api'
import { cn } from '@/lib/utils'

export function BudgetStatusWidget() {
  const { t } = useI18n()
  const [budget, setBudget] = useState<BudgetPolicy | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBudget()
      .then(setBudget)
      .catch((err) => console.error('Failed to load budget', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="widget-card h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="widget-card h-full flex flex-col items-center justify-center p-4 text-center">
        <Wallet className="w-8 h-8 text-soft-muted mb-2 opacity-50" />
        <span className="text-xs text-soft-muted">{t('budgetUpdateError')}</span>
      </div>
    )
  }

  const usagePercent = budget.monthly_budget_eur > 0
    ? (budget.current_usage_eur / budget.monthly_budget_eur) * 100
    : 0
  
  const isWarning = usagePercent >= budget.warning_threshold_pct
  const isHardStop = usagePercent >= budget.hard_stop_threshold_pct

  let statusColor = "text-emerald-400"
  let progressBarColor = "bg-emerald-400"
  let StatusIcon = Wallet

  if (isHardStop) {
    statusColor = "text-red-400"
    progressBarColor = "bg-red-400"
    StatusIcon = ShieldAlert
  } else if (isWarning) {
    statusColor = "text-amber-400"
    progressBarColor = "bg-amber-400"
    StatusIcon = AlertTriangle
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="widget-card h-full flex flex-col p-4 relative overflow-hidden group">
      {/* Background glow based on status */}
      <div className={cn(
        "absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-colors duration-500",
        isHardStop ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
      )} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-[10px] uppercase tracking-widest text-soft-muted font-semibold">{t('monthlyBudget')}</h3>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={cn("text-2xl font-bold tracking-tight", statusColor)}>
              {formatCurrency(budget.current_usage_eur)}
            </span>
            <span className="text-xs text-soft-muted font-medium">
              / {formatCurrency(budget.monthly_budget_eur)}
            </span>
          </div>
        </div>
        <div className={cn("p-2 rounded-lg bg-white/5 border border-white/10", statusColor)}>
          <StatusIcon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1.5 opacity-80">
          <span>{Math.round(usagePercent)}% {t('currentUsage')}</span>
          <span className={statusColor}>
            {isHardStop ? 'HARD STOP' : isWarning ? 'WARNING' : 'OPTIMAL'}
          </span>
        </div>
        
        <div className="h-1.5 w-full bg-navy-deep/50 rounded-full overflow-hidden border border-white/5">
          <div 
            className={cn("h-full transition-all duration-1000 ease-out rounded-full relative", progressBarColor)}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
