'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { translations, Language, TranslationKey } from './translations'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'es'
    const params = new URLSearchParams(window.location.search)
    const langFromUrl = params.get('lang') as Language | null
    if (langFromUrl && langFromUrl in translations) {
      return langFromUrl
    }
    const savedLang = localStorage.getItem('anclora-language') as Language | null
    if (savedLang && savedLang in translations) {
      return savedLang
    }
    return 'es'
  })

  const setLanguage = (lang: Language) => {
    const safeLang: Language = (lang in translations ? lang : 'es') as Language
    setLanguageState(safeLang)
    localStorage.setItem('anclora-language', safeLang)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('lang', safeLang)
      window.history.replaceState({}, '', url.toString())
    }
  }

  const t = (key: TranslationKey): string => {
    const fallbackGroup = translations.es as Record<string, string>
    const rawLangGroup = ((translations as Record<string, unknown>)[language] || {}) as Record<string, string>
    const langGroup =
      language === 'ru'
        ? ({ ...fallbackGroup, ...rawLangGroup } as Record<string, string>)
        : rawLangGroup
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
