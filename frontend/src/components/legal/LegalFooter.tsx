'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

const labels = {
  es: { terms: 'Términos del servicio', privacy: 'Política de privacidad', legal: 'Aviso legal', rights: 'Todos los derechos reservados.', brand: 'Anclora Nexus forma parte del ecosistema operativo de Anclora Group.' },
  en: { terms: 'Terms of service', privacy: 'Privacy policy', legal: 'Legal notice', rights: 'All rights reserved.', brand: 'Anclora Nexus is part of the Anclora Group operational ecosystem.' },
  de: { terms: 'Nutzungsbedingungen', privacy: 'Datenschutzerklärung', legal: 'Impressum', rights: 'Alle Rechte vorbehalten.', brand: 'Anclora Nexus ist Teil des operativen Ökosystems von Anclora Group.' },
  ru: { terms: 'Условия сервиса', privacy: 'Политика конфиденциальности', legal: 'Правовая информация', rights: 'Все права защищены.', brand: 'Anclora Nexus является частью операционной экосистемы Anclora Group.' },
}

export function LegalFooter() {
  const { language } = useI18n()
  const copy = labels[language] ?? labels.es
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/10 bg-navy-dark/80 px-5 py-4 text-xs text-white/55">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p>© {year} Anclora Group — {copy.rights}</p>
          <p>{copy.brand}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/terms" className="hover:text-white">{copy.terms}</Link>
          <Link href="/privacy" className="hover:text-white">{copy.privacy}</Link>
          <Link href="/legal" className="hover:text-white">{copy.legal}</Link>
          <a href="mailto:hola@anclora.com" className="hover:text-white">hola@anclora.com</a>
          <button type="button" onClick={() => window.dispatchEvent(new Event('anclora:open-cookie-preferences'))} className="hover:text-white">Cookies</button>
        </div>
      </div>
    </footer>
  )
}
