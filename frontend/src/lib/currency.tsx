'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type CurrencyCode = 'EUR' | 'GBP' | 'USD' | 'DEM' | 'RUB'

type CurrencyConfig = {
  code: CurrencyCode
  label: string
  locale: string
  symbol: string
}

export const CURRENCY_OPTIONS: CurrencyConfig[] = [
  { code: 'EUR', label: 'Euro', locale: 'es-ES', symbol: '€' },
  { code: 'GBP', label: 'Libra esterlina', locale: 'en-GB', symbol: '£' },
  { code: 'USD', label: 'Dólar', locale: 'en-US', symbol: '$' },
  { code: 'DEM', label: 'Marco alemán', locale: 'de-DE', symbol: 'DM' },
  { code: 'RUB', label: 'Rublo', locale: 'ru-RU', symbol: '₽' },
]

const CURRENCY_BY_CODE = Object.fromEntries(CURRENCY_OPTIONS.map((c) => [c.code, c])) as Record<CurrencyCode, CurrencyConfig>

type CurrencyContextType = {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  formatMoney: (amount: number, opts?: { minFractionDigits?: number; maxFractionDigits?: number }) => string
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

  useEffect(() => {
    const saved = localStorage.getItem('anclora-currency') as CurrencyCode | null
    if (saved && CURRENCY_BY_CODE[saved]) setCurrencyState(saved)
  }, [])

  const setCurrency = (next: CurrencyCode) => {
    setCurrencyState(next)
    localStorage.setItem('anclora-currency', next)
  }

  const formatMoney = (amount: number, opts?: { minFractionDigits?: number; maxFractionDigits?: number }) => {
    const cfg = CURRENCY_BY_CODE[currency]
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.code,
      minimumFractionDigits: opts?.minFractionDigits ?? 2,
      maximumFractionDigits: opts?.maxFractionDigits ?? 2,
    }).format(amount)
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
    () => ({ currency, setCurrency, formatMoney, parseAmount }),
    [currency],
  )

  return <CurrencyContext.Provider value={contextValue}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}

