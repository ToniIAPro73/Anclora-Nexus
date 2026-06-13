import type { NexusLanguage } from './brand'

export type AncloraInternalLocale = 'es' | 'ca' | 'en' | 'de'
export type LanguageToggleMode = 'segmented' | 'modal-popover'

export type AncloraLocaleMeta = {
  code: AncloraInternalLocale
  short: string
  nativeName: string
  englishName: string
  status: 'active' | 'pending-copy'
}

export const INTERNAL_LOCALES: AncloraInternalLocale[] = ['es', 'ca', 'en', 'de']
export const ACTIVE_NEXUS_LOCALES: NexusLanguage[] = ['es', 'en', 'de', 'ca']
export const DEFAULT_NEXUS_LOCALE: NexusLanguage = 'es'

export const ANCLORA_INTERNAL_LOCALE_META: Record<AncloraInternalLocale, AncloraLocaleMeta> = {
  es: { code: 'es', short: 'ES', nativeName: 'Español', englishName: 'Spanish', status: 'active' },
  ca: { code: 'ca', short: 'CA', nativeName: 'Català', englishName: 'Catalan', status: 'active' },
  en: { code: 'en', short: 'EN', nativeName: 'English', englishName: 'English', status: 'active' },
  de: { code: 'de', short: 'DE', nativeName: 'Deutsch', englishName: 'German', status: 'active' },
}

export function normalizeLocaleCode(value: string): string {
  return value.trim().toLowerCase().split(/[-_]/)[0] || ''
}

export function isActiveNexusLocale(value: unknown): value is NexusLanguage {
  if (typeof value !== 'string') return false
  return (ACTIVE_NEXUS_LOCALES as readonly string[]).includes(normalizeLocaleCode(value))
}

export function isInternalLocale(value: unknown): value is AncloraInternalLocale {
  if (typeof value !== 'string') return false
  return (INTERNAL_LOCALES as readonly string[]).includes(normalizeLocaleCode(value))
}

export function normalizeActiveNexusLocale(value: unknown): NexusLanguage {
  if (typeof value !== 'string') return DEFAULT_NEXUS_LOCALE
  const base = normalizeLocaleCode(value)
  return isActiveNexusLocale(base) ? base : DEFAULT_NEXUS_LOCALE
}

export function resolveInitialLocale(input: {
  urlLocale?: string | null
  persistedLocale?: string | null
  browserLocales?: readonly string[]
}): NexusLanguage {
  const urlLocale = typeof input.urlLocale === 'string' ? normalizeLocaleCode(input.urlLocale) : null
  if (urlLocale && isActiveNexusLocale(urlLocale)) return urlLocale

  const persistedLocale = typeof input.persistedLocale === 'string' ? normalizeLocaleCode(input.persistedLocale) : null
  if (persistedLocale && isActiveNexusLocale(persistedLocale)) return persistedLocale

  for (const browserLocale of input.browserLocales || []) {
    const locale = normalizeLocaleCode(browserLocale)
    if (isActiveNexusLocale(locale)) return locale
  }

  return DEFAULT_NEXUS_LOCALE
}

export function getLanguageToggleMode(): LanguageToggleMode {
  return 'modal-popover'
}
