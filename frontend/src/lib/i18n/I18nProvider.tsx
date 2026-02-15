'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, TranslationKey } from './translations'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('anclora-language') as Language | null
    if (savedLang && savedLang in translations) {
      setLanguageState(savedLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    const safeLang: Language = (lang in translations ? lang : 'es') as Language
    setLanguageState(safeLang)
    localStorage.setItem('anclora-language', safeLang)
  }

  const t = (key: TranslationKey): string => {
    const langGroup = ((translations as Record<string, unknown>)[language] || translations.es) as Record<string, string>
    const fallbackGroup = translations.es as Record<string, string>
    return langGroup[key] || fallbackGroup[key] || key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
