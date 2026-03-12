'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, Database, ShieldCheck } from 'lucide-react'
import { PrivateAreaShell } from '@/components/private-area/PrivateAreaShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchPublicDataLabWorkspace, type DataLabWorkspacePayload } from '@/lib/data-lab-access-api'
import { useI18n } from '@/lib/i18n'

export function DataLabWorkspaceClient({ token }: { token: string }) {
  const { t } = useI18n()
  const [workspace, setWorkspace] = useState<DataLabWorkspacePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) {
      setError(t('dataLabWorkspaceMissingToken'))
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const payload = await fetchPublicDataLabWorkspace(token)
      setWorkspace(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'))
    } finally {
      setLoading(false)
    }
  }, [t, token])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <PrivateAreaShell
      eyebrow={t('dataLabWorkspaceEyebrow')}
      title={t('dataLabWorkspaceTitle')}
      subtitle={t('dataLabWorkspaceSubtitle')}
    >
      {loading ? <p className="text-sm text-soft-muted">{t('loading')}</p> : null}
      {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
      {!loading && !error && workspace ? (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
          <div className="space-y-5">
            <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
              <CardHeader>
                <CardTitle className="text-soft-white">{workspace.requester_name}</CardTitle>
                <CardDescription className="text-soft-muted">{workspace.company_name || t(`dataLabAccessProfile_${workspace.profile_type}` as never)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                  <p className="text-sm font-semibold text-soft-white">{workspace.headline}</p>
                  <p className="mt-3 text-sm leading-6 text-soft-muted">{workspace.intended_use}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('dataLabWorkspaceApprovedScope')}</p>
                    <p className="mt-2 text-sm text-soft-white">{t(`dataLabAccessScope_${workspace.approved_scope}` as never)}</p>
                  </div>
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('dataLabWorkspaceAccessTier')}</p>
                    <p className="mt-2 text-sm text-soft-white">{t(`dataLabAccessTier_${workspace.access_tier}` as never)}</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('dataLabWorkspaceGeography')}</p>
                    <p className="mt-2 break-words text-sm text-soft-white">{workspace.geography_focus.join(', ') || '—'}</p>
                  </div>
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('dataLabWorkspaceLanguages')}</p>
                    <p className="mt-2 break-words text-sm text-soft-white">{workspace.languages.join(', ') || '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
              <CardHeader>
                <CardTitle className="text-soft-white">{t('dataLabWorkspacePacksTitle')}</CardTitle>
                <CardDescription className="text-soft-muted">{t('dataLabWorkspacePacksSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspace.packs.length === 0 ? (
                  <p className="text-sm text-soft-muted">{t('dataLabWorkspacePacksEmpty')}</p>
                ) : (
                  workspace.packs.map((pack) => (
                    <div key={pack.id} className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-soft-white">{pack.pack_label}</p>
                          <p className="mt-1 text-sm text-soft-muted">{pack.notebook_name}</p>
                        </div>
                        <span className="rounded-full border border-blue-light/20 bg-blue-light/10 px-3 py-1 text-xs text-blue-light">
                          {pack.zone_scope.join(', ') || '—'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
              <CardHeader>
                <CardTitle className="text-soft-white">{t('dataLabWorkspaceNextStepsTitle')}</CardTitle>
                <CardDescription className="text-soft-muted">{t('dataLabWorkspaceNextStepsSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspace.next_steps.map((step) => (
                  <div key={step} className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4 text-sm leading-6 text-soft-white">
                    {step}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
              <CardHeader>
                <CardTitle className="text-soft-white">{t('dataLabWorkspaceResourcesTitle')}</CardTitle>
                <CardDescription className="text-soft-muted">{t('dataLabWorkspaceResourcesSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspace.resources.map((resource) => (
                  <div key={resource.label} className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-4 w-4 text-gold" />
                      <p className="text-sm font-semibold text-soft-white">{resource.label}</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-soft-muted">{resource.description}</p>
                  </div>
                ))}
                <a href="mailto:datalab@anclora.com?subject=Ampliacion%20Anclora%20Data%20Lab" className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold px-5 py-3 text-sm font-semibold text-navy-darker transition hover:brightness-110">
                  <ArrowUpRight className="h-4 w-4" />
                  {t('dataLabWorkspaceRequestExpansion')}
                </a>
              </CardContent>
            </Card>

            <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
              <CardHeader>
                <CardTitle className="text-soft-white">{t('dataLabWorkspacePolicyTitle')}</CardTitle>
                <CardDescription className="text-soft-muted">{t('dataLabWorkspacePolicySubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-gold" />
                    <p className="text-sm font-semibold text-soft-white">{t('dataLabWorkspacePolicyControlled')}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-soft-muted">{t('dataLabWorkspacePolicyControlledCopy')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </PrivateAreaShell>
  )
}
