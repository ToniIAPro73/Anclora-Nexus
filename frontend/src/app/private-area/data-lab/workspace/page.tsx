import { DataLabWorkspaceClient } from '@/components/private-area/DataLabWorkspaceClient'

export default async function PrivateAreaDataLabWorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  const token = params.token || ''
  return <DataLabWorkspaceClient token={token} />
}
