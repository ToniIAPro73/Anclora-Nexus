export type PrivatePortalKey = 'agent'

export type PrivatePortalStatus = 'active'

export type PrivatePortalDefinition = {
  key: PrivatePortalKey
  publicPath: string
  authenticatedPath: string
  status: PrivatePortalStatus
  requiresNexusMembership: boolean
}

const DEFAULT_PRIVATE_ESTATES_PUBLIC_URL = 'https://anclora-private-estates.vercel.app/'

export const PRIVATE_AREA_PORTALS: Record<PrivatePortalKey, PrivatePortalDefinition> = {
  agent: {
    key: 'agent',
    publicPath: '/private-area/agent',
    authenticatedPath: '/dashboard',
    status: 'active',
    requiresNexusMembership: true,
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

export function normalizeLanguageParam(raw: string | null | undefined): 'es' | 'en' | 'de' | 'fr' | null {
  const value = String(raw || '').trim().toLowerCase()
  if (value === 'es' || value === 'en' || value === 'de' || value === 'fr') return value
  return null
}

export function getPrivateEstatesPublicHref(language?: string | null): string {
  const raw = (process.env.NEXT_PUBLIC_PRIVATE_ESTATES_URL || DEFAULT_PRIVATE_ESTATES_PUBLIC_URL).trim()
  const base = raw ? (raw.endsWith('/') ? raw : `${raw}/`) : DEFAULT_PRIVATE_ESTATES_PUBLIC_URL
  const normalizedLanguage = normalizeLanguageParam(language)
  if (!normalizedLanguage) return base
  const url = new URL(base)
  url.searchParams.set('lang', normalizedLanguage)
  return url.toString()
}

export function getPrivateEstatesPrivateAreaHref(language?: string | null): string {
  const configuredUrl = process.env.NEXT_PUBLIC_PRIVATE_ESTATES_PRIVATE_AREA_URL?.trim()
  const url = configuredUrl ? new URL(configuredUrl) : new URL(getPrivateEstatesPublicHref(language))

  if (!configuredUrl) {
    url.pathname = '/'
    url.searchParams.set('open', 'private-area')
  }

  const normalizedLanguage = normalizeLanguageParam(language)
  if (normalizedLanguage) {
    url.searchParams.set('lang', normalizedLanguage)
  }

  return url.toString()
}

export function getPrivateEstatesPrivacyHref(language?: string | null): string {
  const url = new URL(getPrivateEstatesPublicHref(language))
  url.pathname = "/legal/privacidad"
  return url.toString()
}

export function resolvePortalEntryHref(portalKey: PrivatePortalKey, isAuthenticated: boolean): string {
  const portal = PRIVATE_AREA_PORTALS[portalKey]
  if (portalKey === 'agent') {
    return isAuthenticated ? portal.authenticatedPath : buildPortalLoginHref(portalKey)
  }
  return portal.publicPath
}
