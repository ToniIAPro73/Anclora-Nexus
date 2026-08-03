import { describe, expect, it } from 'vitest'
import { BrandLogo } from '../../src/components/brand/BrandLogo'
import { NEXUS_BRAND } from '../../src/lib/brand'

describe('Nexus brand wiring', () => {
  it('keeps the supported language set aligned with Nexus', () => {
    expect(NEXUS_BRAND.defaultLanguage).toBe('es')
    expect(NEXUS_BRAND.supportedLanguages).toEqual(['es', 'en', 'de'])
  })

  it('uses the Nexus primary logo by default', () => {
    const element = BrandLogo({})
    expect(element.props.children.props.alt).toBe('Anclora Nexus logo')
    expect(element.props.children.props.src).toContain('/brand/anclora-nexus.png')
  })
})
