import { PartnerWorkspaceClient } from '@/components/private-area/PartnerWorkspaceClient'

type PageProps = {
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function PartnerWorkspacePage({ searchParams }: PageProps) {
  const params = await searchParams
  const tokenValue = params.token
  const token = Array.isArray(tokenValue) ? tokenValue[0] || '' : tokenValue || ''
  return <PartnerWorkspaceClient token={token} />
}
