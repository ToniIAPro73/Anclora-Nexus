import { describe, expect, it } from 'vitest'
import { buildPortalLoginHref, normalizeNextPath, resolvePortalEntryHref } from '../../src/lib/private-area-access'

describe('private area access helpers', () => {
  it('normalizes valid internal paths', () => {
    expect(normalizeNextPath('/dashboard?tab=sellers')).toBe('/dashboard?tab=sellers')
  })

  it('rejects external or malformed next paths', () => {
    expect(normalizeNextPath('https://evil.com', '/dashboard')).toBe('/dashboard')
    expect(normalizeNextPath('//evil.com', '/dashboard')).toBe('/dashboard')
    expect(normalizeNextPath('dashboard', '/dashboard')).toBe('/dashboard')
  })

  it('builds agent login href with preserved destination', () => {
    expect(buildPortalLoginHref('agent')).toBe('/login?portal=agent&next=%2Fdashboard')
  })

  it('resolves public and authenticated entry routes per portal', () => {
    expect(resolvePortalEntryHref('agent', false)).toBe('/login?portal=agent&next=%2Fdashboard')
    expect(resolvePortalEntryHref('agent', true)).toBe('/dashboard')
    expect(resolvePortalEntryHref('partner', false)).toBe('/private-area/partner')
    expect(resolvePortalEntryHref('data_lab', true)).toBe('/private-area/data-lab')
  })
})
