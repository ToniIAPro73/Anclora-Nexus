'use client'

import { useEffect, useRef, useState } from 'react'
import { Coins } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { CURRENCY_OPTIONS, useCurrency, type CurrencyCode } from '@/lib/currency'

interface CurrencySelectorProps {
  menuPlacement?: 'bottom' | 'top'
  menuAlign?: 'left' | 'center' | 'right'
}

export function CurrencySelector({ menuPlacement = 'bottom', menuAlign = 'right' }: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const current = CURRENCY_OPTIONS.find((c) => c.code === currency) || CURRENCY_OPTIONS[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-surface/40 border border-soft-subtle hover:border-gold/50 transition-all group"
        aria-label="Select currency"
      >
        <Coins className="w-4 h-4 text-soft-muted group-hover:text-gold transition-colors" />
        <span className="text-xs font-semibold text-soft-white">{current.code}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: menuPlacement === 'top' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: menuPlacement === 'top' ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute w-56 bg-navy-deep backdrop-blur-xl border-2 border-soft-muted/30 rounded-xl shadow-2xl overflow-hidden z-50 ${
              menuAlign === 'left' ? 'left-0' : menuAlign === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'
            } ${
              menuPlacement === 'top' ? 'bottom-full mb-2' : 'mt-2'
            }`}
          >
            {CURRENCY_OPTIONS.map((item) => (
              <button
                key={item.code}
                onClick={() => {
                  setCurrency(item.code as CurrencyCode)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                  currency === item.code
                    ? 'bg-gold/10 border-l-2 border-gold text-gold'
                    : 'hover:bg-white/5 text-soft-white hover:text-gold'
                }`}
              >
                <span className="text-sm font-bold w-10">{item.code}</span>
                <span className="text-sm">{item.label}</span>
                {currency === item.code ? <span className="ml-auto text-xs">{item.symbol}</span> : null}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
