'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n'
import { getBudget, updateBudget, getAlerts, BudgetPolicy, CostAlert } from '@/lib/finops-api'
import { AlertTriangle, CheckCircle, TrendingUp, DollarSign, Save } from 'lucide-react'

// Simple Progress Component
const ProgressBar = ({ value, max = 100, className = "" }: { value: number, max?: number, className?: string }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={`h-2 w-full bg-secondary rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-primary transition-all duration-500 ease-in-out" 
        style={{ width: `${percentage}%` }} 
      />
    </div>
  )
}

export function CostGovernanceTab() {
  const { t } = useI18n()
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
  }
  
  const [budget, setBudget] = useState<BudgetPolicy | null>(null)
  const [alerts, setAlerts] = useState<CostAlert[]>([])
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  // Local state for form
  const [monthlyLimit, setMonthlyLimit] = useState<string>('')
  const [softLimit, setSoftLimit] = useState<string>('')
  const [hardLimit, setHardLimit] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (saveStatus !== 'idle') {
      const timer = setTimeout(() => setSaveStatus('idle'), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus])

  async function loadData() {
    try {
      setLoading(true)
      const [budgetData, alertsData] = await Promise.all([
        getBudget(),
        getAlerts()
      ])
      
      setBudget(budgetData)
      setAlerts(alertsData)
      
      if (budgetData) {
        setMonthlyLimit(budgetData.monthly_budget_eur.toString())
        setSoftLimit((budgetData.warning_threshold_pct * 100).toString())
        setHardLimit((budgetData.hard_stop_threshold_pct * 100).toString())
      }
      
    } catch (error) {
      console.error('Failed to load FinOps data', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveBudget() {
    if (!budget) return
    
    try {
      setUpdating(true)
      setSaveStatus('idle')
      
      const updated = await updateBudget({
        monthly_budget_eur: Number(monthlyLimit),
        warning_threshold_pct: Number(softLimit) / 100,
        hard_stop_threshold_pct: Number(hardLimit) / 100
      })
      
      setBudget(updated)
      setSaveStatus('success')
    } catch (error) {
      console.error('Failed to update budget', error)
      setSaveStatus('error')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const currentUsage = budget?.current_usage_eur || 0
  const percentUsed = budget ? (currentUsage / budget.monthly_budget_eur) * 100 : 0
  const isOverBudget = percentUsed > 100
  const isWarning = percentUsed > (budget?.warning_threshold_pct ? budget.warning_threshold_pct * 100 : 80)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Usage Summary Card */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('budgetOverview')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(currentUsage)}</div>
                <p className="text-xs text-muted-foreground mb-4">
                  {t('remainingBudget')}: {formatCurrency(Math.max(0, (budget?.monthly_budget_eur || 0) - currentUsage))}
                </p>
                
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{percentUsed.toFixed(1)}%</span>
                        <span>{t('monthlyBudget')}: {formatCurrency(budget?.monthly_budget_eur || 0)}</span>
                    </div>
                    <ProgressBar 
                        value={percentUsed} 
                        className={isOverBudget ? "bg-red-100" : isWarning ? "bg-yellow-100" : "bg-secondary"}
                    />
                </div>
            </CardContent>
        </Card>
        
        {/* Alerts Card */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('activeAlerts')}</CardTitle>
                <AlertTriangle className={`h-4 w-4 ${alerts.length > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{alerts.length}</div>
                <div className="mt-4 space-y-2">
                    {alerts.length === 0 ? (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {t('noAlerts')}
                        </p>
                    ) : (
                        alerts.slice(0, 3).map(alert => (
                            <div key={alert.id} className="text-xs flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded border border-red-100">
                                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                                <span>{alert.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('configureBudget')}</CardTitle>
          <CardDescription>{t('budgetControl')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
                <label className="text-sm font-medium">{t('monthlyBudget')}</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">€</span>
                    <Input 
                        type="number" 
                        value={monthlyLimit} 
                        onChange={e => setMonthlyLimit(e.target.value)}
                        min="0"
                        className="pl-7"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">{t('warningThreshold')}</label>
                <div className="relative">
                    <Input 
                        type="number" 
                        value={softLimit} 
                        onChange={e => setSoftLimit(e.target.value)}
                        min="0"
                        max="100"
                        className="pr-7"
                    />
                    <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">{t('hardStopThreshold')}</label>
                <div className="relative">
                    <Input 
                        type="number" 
                        value={hardLimit} 
                        onChange={e => setHardLimit(e.target.value)}
                        min="0"
                        max="100"
                        className="pr-7"
                    />
                    <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-4 pt-4">
            {saveStatus === 'success' && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {t('budgetUpdated')}
                </span>
            )}
             {saveStatus === 'error' && (
                <span className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {t('budgetUpdateError')}
                </span>
            )}
            <Button onClick={handleSaveBudget} disabled={updating} className="min-w-[140px]">
                {updating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                    <Save className="h-4 w-4 mr-2" />
                )}
                {t('saveConfiguration')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
