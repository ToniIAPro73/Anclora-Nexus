export type PrivatePortalKey = 'agent' | 'partner' | 'data_lab'

export type PrivatePortalStatus = 'active' | 'admission_review' | 'controlled_access'

export type PrivatePortalDefinition = {
  key: PrivatePortalKey
  publicPath: string
  authenticatedPath: string
  status: PrivatePortalStatus
  requiresNexusMembership: boolean
}

export const PRIVATE_AREA_PORTALS: Record<PrivatePortalKey, PrivatePortalDefinition> = {
  agent: {
    key: 'agent',
    publicPath: '/private-area/agent',
    authenticatedPath: '/dashboard',
    status: 'active',
    requiresNexusMembership: true,
  },
  partner: {
    key: 'partner',
    publicPath: '/private-area/partner',
    authenticatedPath: '/private-area/partner/workspace',
    status: 'active',
    requiresNexusMembership: false,
  },
  data_lab: {
    key: 'data_lab',
    publicPath: '/private-area/data-lab',
    authenticatedPath: '/private-area/data-lab',
    status: 'controlled_access',
    requiresNexusMembership: false,
  },
}

export function normalizeNextPath(raw: string | null | undefined, fallback = '/dashboard'): string {
  const candidate = String(raw || '').trim()
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return fallback
  }

  try {
    const url = new URL(candidate, 'https://anclora.local')
    if (url.origin !== 'https://anclora.local') {
      return fallback
    }
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}

export function buildPortalLoginHref(portalKey: PrivatePortalKey): string {
  const portal = PRIVATE_AREA_PORTALS[portalKey]
  const nextPath = normalizeNextPath(portal.authenticatedPath, '/dashboard')
  return `/login?portal=${portalKey}&next=${encodeURIComponent(nextPath)}`
}

export function resolvePortalEntryHref(portalKey: PrivatePortalKey, isAuthenticated: boolean): string {
  const portal = PRIVATE_AREA_PORTALS[portalKey]
  if (portalKey === 'agent') {
    return isAuthenticated ? portal.authenticatedPath : buildPortalLoginHref(portalKey)
  }
  return portal.publicPath
}
