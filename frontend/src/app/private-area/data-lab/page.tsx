'use client'

import { PrivateAreaShell } from '@/components/private-area/PrivateAreaShell'
import { DataLabPortalClient } from '@/components/private-area/DataLabPortalClient'
import { useI18n } from '@/lib/i18n'

export default function PrivateAreaDataLabPage() {
  const { t } = useI18n()

  return (
    <PrivateAreaShell
      eyebrow={t('privateAreaDataLabEyebrow')}
      title={t('privateAreaDataLabTitle')}
      subtitle={t('privateAreaDataLabSubtitle')}
    >
      <DataLabPortalClient />
    </PrivateAreaShell>
  )
}
