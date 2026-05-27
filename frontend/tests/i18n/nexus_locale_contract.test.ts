import { describe, expect, it } from 'vitest'
import { NEXUS_BRAND, isSupportedNexusLanguage } from '../../src/lib/brand'
import {
  ACTIVE_NEXUS_LOCALES,
  ANCLORA_INTERNAL_LOCALE_META,
  getLanguageToggleMode,
  INTERNAL_LOCALES,
  resolveInitialLocale,
} from '../../src/lib/anclora-language-toggle'

describe('nexus locale contract', () => {
  it('preserves the active Internal locale list', () => {
    expect(NEXUS_BRAND.defaultLanguage).toBe('es')
    expect(NEXUS_BRAND.supportedLanguages).toEqual(['es', 'en', 'de'])
    expect(ACTIVE_NEXUS_LOCALES).toEqual(['es', 'en', 'de'])
  })

  it('documents Internal governance order and excludes Russian from the selector target', () => {
    expect(INTERNAL_LOCALES).toEqual(['es', 'ca', 'en', 'de'])
    expect(ANCLORA_INTERNAL_LOCALE_META.ca.status).toBe('pending-copy')
    expect(INTERNAL_LOCALES).not.toContain('ru')
  })

  it('accepts only active locales for runtime i18n', () => {
    expect(isSupportedNexusLanguage('es')).toBe(true)
    expect(isSupportedNexusLanguage('en')).toBe(true)
    expect(isSupportedNexusLanguage('de')).toBe(true)
    expect(isSupportedNexusLanguage('ca')).toBe(false)
    expect(isSupportedNexusLanguage('ru')).toBe(false)
    expect(isSupportedNexusLanguage('fr')).toBe(false)
    expect(isSupportedNexusLanguage(null)).toBe(false)
  })

  it('resolves URL, persisted and browser locales without geolocation', () => {
    expect(resolveInitialLocale({ browserLocales: ['en-US'] })).toBe('en')
    expect(resolveInitialLocale({ browserLocales: ['de-CH'] })).toBe('de')
    expect(resolveInitialLocale({ persistedLocale: 'de', browserLocales: ['en-US'] })).toBe('de')
    expect(resolveInitialLocale({ urlLocale: 'en', persistedLocale: 'de' })).toBe('en')
    expect(resolveInitialLocale({ urlLocale: 'ru', persistedLocale: 'ca', browserLocales: ['fr-FR'] })).toBe('es')
  })

  it('requires a compact modal/popover pattern for the Internal list', () => {
    expect(getLanguageToggleMode()).toBe('modal-popover')
  })
})
