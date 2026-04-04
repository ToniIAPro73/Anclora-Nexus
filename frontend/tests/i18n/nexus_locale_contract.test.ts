import { describe, expect, it } from 'vitest'
import { NEXUS_BRAND, isSupportedNexusLanguage } from '../../src/lib/brand'

describe('nexus locale contract', () => {
  it('preserves the supported locale list', () => {
    expect(NEXUS_BRAND.defaultLanguage).toBe('es')
    expect(NEXUS_BRAND.supportedLanguages).toEqual(['es', 'en', 'de', 'ru'])
  })

  it('accepts only the documented locales', () => {
    expect(isSupportedNexusLanguage('es')).toBe(true)
    expect(isSupportedNexusLanguage('en')).toBe(true)
    expect(isSupportedNexusLanguage('de')).toBe(true)
    expect(isSupportedNexusLanguage('ru')).toBe(true)
    expect(isSupportedNexusLanguage('fr')).toBe(false)
    expect(isSupportedNexusLanguage(null)).toBe(false)
  })
})
