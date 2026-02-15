'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type CurrencyCode = 'EUR' | 'GBP' | 'USD' | 'RUB'
export type UnitSystem = 'metric' | 'imperial'

type CurrencyConfig = {
  code: CurrencyCode
  label: string
  locale: string
  symbol: string
  position: 'prefix' | 'suffix'
}

type FxRates = Record<CurrencyCode, number>

const DEFAULT_RATES: FxRates = {
  EUR: 1,
  GBP: 0.86,
  USD: 1.08,
  RUB: 98,
}

export const CURRENCY_OPTIONS: CurrencyConfig[] = [
  { code: 'EUR', label: 'Euro', locale: 'es-ES', symbol: '€', position: 'suffix' },
  { code: 'GBP', label: 'Libra esterlina', locale: 'en-GB', symbol: '£', position: 'prefix' },
  { code: 'USD', label: 'Dólar', locale: 'en-US', symbol: '$', position: 'prefix' },
  { code: 'RUB', label: 'Rublo', locale: 'ru-RU', symbol: '₽', position: 'suffix' },
]

const CURRENCY_BY_CODE = Object.fromEntries(CURRENCY_OPTIONS.map((c) => [c.code, c])) as Record<CurrencyCode, CurrencyConfig>

type CurrencyContextType = {
  currency: CurrencyCode
  currencyConfig: CurrencyConfig
  setCurrency: (currency: CurrencyCode) => void
  unitSystem: UnitSystem
  setUnitSystem: (unit: UnitSystem) => void
  ratesUpdatedAt: string | null
  formatMoney: (amountEur: number, opts?: { minFractionDigits?: number; maxFractionDigits?: number }) => string
  formatSurface: (value_m2: number) => string
  parseAmount: (value: unknown) => number | null
  convertFromEur: (amountEur: number) => number
  convertToEur: (amountInCurrentCurrency: number) => number
  formatBudgetText: (budget: string) => string
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

function formatCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    const n = value / 1_000_000
    return `${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(1)}M`
  }
  if (abs >= 1_000) {
    const n = value / 1_000
    return `${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(1)}K`
  }
  return `${Math.round(value)}`
}

function parseBudgetTokenToEur(token: string): number | null {
  const clean = token.trim().toUpperCase().replace(/\s+/g, '')
  if (!clean) return null
  const mult = clean.endsWith('M') ? 1_000_000 : clean.endsWith('K') ? 1_000 : 1
  const numeric = normalizeNumericString(clean.replace(/[MK]/g, ''))
  const value = Number(numeric)
  if (!Number.isFinite(value)) return null
  return value * mult
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('EUR')
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>('metric')
  const [ratesState, setRatesState] = useState<{ rates: FxRates; updatedAt: string | null }>({
    rates: DEFAULT_RATES,
    updatedAt: null,
  })

  const currencyConfig = CURRENCY_BY_CODE[currency]

  useEffect(() => {
    localStorage.setItem('anclora-currency', currency)
  }, [currency])

  useEffect(() => {
    localStorage.setItem('anclora-unit-system', unitSystem)
  }, [unitSystem])

  useEffect(() => {
    const savedCurrency = localStorage.getItem('anclora-currency') as CurrencyCode | null
    if (savedCurrency && CURRENCY_BY_CODE[savedCurrency]) {
      queueMicrotask(() => setCurrencyState(savedCurrency))
    }

    const savedUnit = localStorage.getItem('anclora-unit-system') as UnitSystem | null
    if (savedUnit === 'metric' || savedUnit === 'imperial') {
      queueMicrotask(() => setUnitSystemState(savedUnit))
    }

    const rawRates = localStorage.getItem('anclora-fx-rates')
    if (rawRates) {
      try {
        const parsed = JSON.parse(rawRates) as { rates?: Partial<FxRates>; updatedAt?: string }
        queueMicrotask(() => {
          setRatesState({
            rates: { ...DEFAULT_RATES, ...(parsed.rates || {}) },
            updatedAt: parsed.updatedAt || null,
          })
        })
      } catch {
        // Ignore invalid cache and keep defaults.
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function refreshRates() {
      try {
        const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=GBP,USD,RUB', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json() as { rates?: Record<string, number>; date?: string }
        const nextRates: FxRates = {
          EUR: 1,
          GBP: json.rates?.GBP ?? DEFAULT_RATES.GBP,
          USD: json.rates?.USD ?? DEFAULT_RATES.USD,
          RUB: json.rates?.RUB ?? DEFAULT_RATES.RUB,
        }
        const updatedAt = json.date || new Date().toISOString()
        if (!cancelled) {
          setRatesState({ rates: nextRates, updatedAt })
          localStorage.setItem('anclora-fx-rates', JSON.stringify({ rates: nextRates, updatedAt }))
        }
      } catch {
        // Keep cached/default rates silently.
      }
    }

    refreshRates()
    const id = window.setInterval(refreshRates, 10 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const setCurrency = (next: CurrencyCode) => {
    setCurrencyState(next)
  }

  const setUnitSystem = (next: UnitSystem) => {
    setUnitSystemState(next)
  }

  const convertFromEur = (amountEur: number): number => {
    const rate = ratesState.rates[currency] || 1
    return amountEur * rate
  }

  const convertToEur = (amountInCurrentCurrency: number): number => {
    const rate = ratesState.rates[currency] || 1
    if (!rate) return amountInCurrentCurrency
    return amountInCurrentCurrency / rate
  }

  const formatMoney = (
    amountEur: number,
    opts?: { minFractionDigits?: number; maxFractionDigits?: number },
  ) => {
    const value = convertFromEur(amountEur)
    const formatted = new Intl.NumberFormat(currencyConfig.locale, {
      minimumFractionDigits: opts?.minFractionDigits ?? 2,
      maximumFractionDigits: opts?.maxFractionDigits ?? 2,
      useGrouping: true,
    }).format(value)

    if (currencyConfig.position === 'prefix') {
      return `${currencyConfig.symbol}${formatted}`
    }
    return `${formatted} ${currencyConfig.symbol}`
  }

  const formatSurface = (value_m2: number): string => {
    if (unitSystem === 'metric') {
      return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(value_m2)} m²`
    }
    const value_sqft = value_m2 * 10.7639
    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value_sqft)} sq ft`
  }

  const parseAmount = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return convertToEur(value)
    }
    if (typeof value !== 'string') return null
    const raw = value.trim()
    if (!raw) return null

    let multiplier = 1
    if (/m\b/i.test(raw)) multiplier = 1_000_000
    else if (/k\b/i.test(raw)) multiplier = 1_000

    const normalized = normalizeNumericString(raw)
    const parsed = Number(normalized)
    if (!Number.isFinite(parsed)) return null
    return convertToEur(parsed * multiplier)
  }

  const formatBudgetText = (budget: string): string => {
    if (!budget) return budget
    const normalized = budget.trim().toUpperCase().replace(/\s+/g, '')
    const hasPlus = normalized.includes('+')
    const parts = normalized.replace('EUR', '').replace('€', '').replace(/\+/g, '').split(/-|–/)
    const a = parseBudgetTokenToEur(parts[0] || '')
    const b = parseBudgetTokenToEur(parts[1] || '')

    if (a == null && b == null) return budget

    if (a != null && b != null) {
      return `${formatCompact(convertFromEur(a))}-${formatCompact(convertFromEur(b))} ${currency}`
    }

    if (a != null && hasPlus) {
      return `${formatCompact(convertFromEur(a))}+ ${currency}`
    }

    if (a != null) {
      return `${formatCompact(convertFromEur(a))} ${currency}`
    }

    return budget
  }

  const contextValue: CurrencyContextType = {
    currency,
    currencyConfig,
    setCurrency,
    unitSystem,
    setUnitSystem,
    ratesUpdatedAt: ratesState.updatedAt,
    formatMoney,
    formatSurface,
    parseAmount,
    convertFromEur,
    convertToEur,
    formatBudgetText,
  }

  return <CurrencyContext.Provider value={contextValue}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
