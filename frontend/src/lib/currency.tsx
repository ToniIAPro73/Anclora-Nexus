'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type CurrencyCode = 'EUR' | 'GBP' | 'USD' | 'DEM' | 'RUB'
export type UnitSystem = 'metric' | 'imperial'

type CurrencyConfig = {
  code: CurrencyCode
  label: string
  locale: string
  symbol: string
  position: 'prefix' | 'suffix'
}

export const CURRENCY_OPTIONS: CurrencyConfig[] = [
  { code: 'EUR', label: 'Euro', locale: 'de-DE', symbol: '€', position: 'suffix' },
  { code: 'GBP', label: 'Libra esterlina', locale: 'en-GB', symbol: '£', position: 'prefix' },
  { code: 'USD', label: 'Dólar', locale: 'en-US', symbol: '$', position: 'prefix' },
  { code: 'DEM', label: 'Marco alemán', locale: 'de-DE', symbol: 'DM', position: 'suffix' },
  { code: 'RUB', label: 'Rublo', locale: 'ru-RU', symbol: '₽', position: 'suffix' },
]

const CURRENCY_BY_CODE = Object.fromEntries(CURRENCY_OPTIONS.map((c) => [c.code, c])) as Record<CurrencyCode, CurrencyConfig>

type CurrencyContextType = {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  unitSystem: UnitSystem
  setUnitSystem: (unit: UnitSystem) => void
  formatMoney: (amount: number, opts?: { minFractionDigits?: number; maxFractionDigits?: number }) => string
  formatSurface: (value_m2: number) => string
  parseAmount: (value: unknown) => number | null
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

function normalizeNumericString(raw: string): string {
  const cleaned = raw.replace(/[^\d,.\-]/g, '')
  const hasComma = cleaned.includes(',')
  const hasDot = cleaned.includes('.')

  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(',')
    const lastDot = cleaned.lastIndexOf('.')
    if (lastComma > lastDot) return cleaned.replace(/\./g, '').replace(',', '.')
    return cleaned.replace(/,/g, '')
  }

  if (hasComma && !hasDot) return cleaned.replace(',', '.')
  return cleaned
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('EUR')
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('metric')

  useEffect(() => {
    const savedCurrency = localStorage.getItem('anclora-currency') as CurrencyCode | null
    if (savedCurrency && CURRENCY_BY_CODE[savedCurrency]) setCurrencyState(savedCurrency)
    
    const savedUnit = localStorage.getItem('anclora-unit-system') as UnitSystem | null
    if (savedUnit === 'metric' || savedUnit === 'imperial') setUnitSystemState(savedUnit)
  }, [])

  const setCurrency = (next: CurrencyCode) => {
    setCurrencyState(next)
    localStorage.setItem('anclora-currency', next)
  }

  const setUnitSystem = (next: UnitSystem) => {
    setUnitSystemState(next)
    localStorage.setItem('anclora-unit-system', next)
  }

  const formatMoney = (amount: number, opts?: { minFractionDigits?: number; maxFractionDigits?: number }) => {
    const cfg = CURRENCY_BY_CODE[currency]
    
    let formatted = new Intl.NumberFormat(cfg.locale, {
      minimumFractionDigits: opts?.minFractionDigits ?? 2,
      maximumFractionDigits: opts?.maxFractionDigits ?? 2,
      useGrouping: true,
    }).format(amount)

    // Manual adjustments for specific rules
    if (currency === 'RUB') {
      // RUB uses space as thousands separator
      formatted = formatted.replace(/\u00a0/g, ' ')
    }

    if (cfg.position === 'prefix') {
      return `${cfg.symbol}${formatted}`
    } else {
      return `${formatted} ${cfg.symbol}`
    }
  }

  const formatSurface = (value_m2: number): string => {
    if (unitSystem === 'metric') {
      return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(value_m2)} m²`
    } else {
      const value_sqft = value_m2 * 10.7639
      return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value_sqft)} sq ft`
    }
  }

  const parseAmount = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value !== 'string') return null
    const raw = value.trim()
    if (!raw) return null

    let multiplier = 1
    if (/m\b/i.test(raw)) multiplier = 1_000_000
    else if (/k\b/i.test(raw)) multiplier = 1_000

    const normalized = normalizeNumericString(raw)
    const parsed = Number(normalized)
    if (!Number.isFinite(parsed)) return null
    return parsed * multiplier
  }

  const contextValue = useMemo<CurrencyContextType>(
    () => ({ currency, setCurrency, unitSystem, setUnitSystem, formatMoney, formatSurface, parseAmount }),
    [currency, unitSystem],
  )

  return <CurrencyContext.Provider value={contextValue}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}

