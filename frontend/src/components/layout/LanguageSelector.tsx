'use client'
import { useI18n, Language } from '@/lib/i18n'
import { Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { ANCLORA_INTERNAL_LOCALE_META, INTERNAL_LOCALES, type AncloraInternalLocale } from '@/lib/anclora-language-toggle'

interface LanguageSelectorProps {
  menuPlacement?: 'bottom' | 'top'
  menuAlign?: 'left' | 'center' | 'right'
}

export function LanguageSelector({ menuPlacement = 'bottom', menuAlign = 'right' }: LanguageSelectorProps) {
  const { language, setLanguage } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = ANCLORA_INTERNAL_LOCALE_META[language]
  const pendingLabel = language === 'en' ? 'Pending' : language === 'de' ? 'Ausstehend' : 'Pendiente'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-surface/40 border border-soft-subtle hover:border-gold/50 transition-all group"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Globe className="w-4 h-4 text-soft-muted group-hover:text-gold transition-colors" />
        <span className="text-sm font-semibold text-soft-white">{currentLang.short}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: menuPlacement === 'top' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: menuPlacement === 'top' ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute w-64 bg-navy-deep backdrop-blur-xl border-2 border-soft-muted/30 rounded-xl shadow-2xl overflow-hidden z-50 ${
              menuAlign === 'left' ? 'left-0' : menuAlign === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'
            } ${
              menuPlacement === 'top' ? 'bottom-full mb-2' : 'mt-2'
            }`}
            role="dialog"
            aria-label="Language settings"
          >
            {INTERNAL_LOCALES.map((locale: AncloraInternalLocale) => {
              const lang = ANCLORA_INTERNAL_LOCALE_META[locale]
              const active = lang.status === 'active'
              const selected = language === lang.code
              return (
              <button
                key={lang.code}
                disabled={!active}
                onClick={() => {
                  if (!active) return
                  setLanguage(lang.code as Language)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                  selected
                    ? 'bg-gold/10 border-l-2 border-gold text-gold'
                    : 'hover:bg-white/5 text-soft-white hover:text-gold'
                } ${!active ? 'cursor-not-allowed opacity-55' : ''}`}
                aria-pressed={selected}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-soft-subtle text-xs font-black">
                  {lang.short}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{lang.nativeName}</span>
                  <span className="block text-xs text-soft-muted">{active ? lang.englishName : pendingLabel}</span>
                </span>
                {selected && (
                  <motion.div
                    layoutId="active-lang"
                    className="ml-auto w-2 h-2 rounded-full bg-gold"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
