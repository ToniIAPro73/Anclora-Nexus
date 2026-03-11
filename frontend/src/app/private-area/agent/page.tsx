import { redirect } from 'next/navigation'
import { buildPortalLoginHref } from '@/lib/private-area-access'

export default function PrivateAreaAgentRedirectPage() {
  redirect(buildPortalLoginHref('agent'))
}
