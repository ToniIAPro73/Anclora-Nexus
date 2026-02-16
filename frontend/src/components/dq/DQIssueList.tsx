'use client'
import { AlertCircle, AlertTriangle, Shield } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { DQQualityIssue } from '@/lib/dq-api'

interface DQIssueListProps {
  issues: DQQualityIssue[]
}

export function DQIssueList({ issues }: DQIssueListProps) {
  const { t } = useI18n()

  if (issues.length === 0) {
    return (
      <div className="glass-panel p-6 text-center border border-white/5">
        <Shield className="w-12 h-12 text-white-soft/20 mx-auto mb-4" />
        <p className="text-white-soft/60">{t('dqNoIssuesFound')}</p>
      </div>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertCircle
      case 'high': return AlertTriangle
      default: return AlertCircle
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white-soft flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-gold-muted" />
        {t('dqQualityIssues')}
      </h2>
      
      <div className="grid gap-3">
        {issues.map((issue) => {
          const Icon = getSeverityIcon(issue.severity)
          return (
            <div key={issue.id} className="glass-panel p-4 border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${getSeverityColor(issue.severity)} border`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white-soft font-medium">
                      {issue.entity_type === 'lead' ? t('lead') : t('property')}
                    </span>
                    <span className="text-white-soft/30">•</span>
                    <span className="text-white-soft/60 text-sm">
                      {t(`dqIssue_${issue.issue_type}` as any) || issue.issue_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-white-soft/80 text-sm mt-1">
                    {issue.issue_payload?.message || issue.issue_payload?.field || t('dqIssue_technical_error')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border font-semibold ${getSeverityColor(issue.severity)}`}>
                  {t(`dq${issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}` as any) || issue.severity}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
