'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { translations, Language, TranslationKey } from './translations'
import { NEXUS_BRAND, isSupportedNexusLanguage } from '@/lib/brand'
import { resolveInitialLocale } from '@/lib/anclora-language-toggle'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(NEXUS_BRAND.defaultLanguage)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setLanguageState(resolveInitialLocale({
      urlLocale: params.get('lang') || params.get('locale'),
      persistedLocale: localStorage.getItem('anclora-language'),
      browserLocales: navigator.languages?.length ? navigator.languages : [navigator.language],
    }))
  }, [])

  const setLanguage = (lang: Language) => {
    const safeLang: Language = (isSupportedNexusLanguage(lang) ? lang : NEXUS_BRAND.defaultLanguage) as Language
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
    const langGroup = rawLangGroup
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
