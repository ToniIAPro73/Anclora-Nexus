'use client'

import { Ruler } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useCurrency, type UnitSystem } from '@/lib/currency'

const UNITS: { code: UnitSystem; label: string; symbol: string }[] = [
  { code: 'metric', label: 'Métrico', symbol: 'm²' },
  { code: 'imperial', label: 'Imperial', symbol: 'sq ft' },
]

interface UnitSelectorProps {
  menuPlacement?: 'bottom' | 'top'
}

export function UnitSelector({ menuPlacement = 'bottom' }: UnitSelectorProps) {
  const { unitSystem, setUnitSystem } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentUnit = UNITS.find(u => u.code === unitSystem) || UNITS[0]

  // Close dropdown when clicking outside
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
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-surface/40 border border-soft-subtle hover:border-gold/50 transition-all group"
        aria-label="Select unit system"
      >
        <Ruler className="w-4 h-4 text-soft-muted group-hover:text-gold transition-colors" />
        <span className="text-xs font-semibold text-soft-white uppercase">{currentUnit.code === 'metric' ? 'M²' : 'FT²'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: menuPlacement === 'top' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: menuPlacement === 'top' ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 w-48 bg-navy-deep backdrop-blur-xl border-2 border-soft-muted/30 rounded-xl shadow-2xl overflow-hidden z-50 ${
              menuPlacement === 'top' ? 'bottom-full mb-2' : 'mt-2'
            }`}
          >
            {UNITS.map((unit) => (
              <button
                key={unit.code}
                onClick={() => {
                  setUnitSystem(unit.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                  unitSystem === unit.code
                    ? 'bg-gold/10 border-l-2 border-gold text-gold'
                    : 'hover:bg-white/5 text-soft-white hover:text-gold'
                }`}
              >
                <span className="text-sm font-bold w-12">{unit.symbol}</span>
                <span className="text-sm font-medium">{unit.label}</span>
                {unitSystem === unit.code && (
                  <motion.div
                    layoutId="active-unit"
                    className="ml-auto w-2 h-2 rounded-full bg-gold"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
