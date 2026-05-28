'use client'

import { useEffect, useState } from 'react'
import { Cookie } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

type CookiePreferences = { necessary: true; session: true; analytics: boolean; updatedAt: string; version: 'v1' }
const STORAGE_KEY = 'anclora-cookie-consent-v1'
const defaults: CookiePreferences = { necessary: true, session: true, analytics: false, updatedAt: '', version: 'v1' }

export function CookieConsent() {
  const { language } = useI18n()
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem(STORAGE_KEY)
  })
  const [settings, setSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    if (typeof window === 'undefined') return defaults
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CookiePreferences>
        return { necessary: true, session: true, analytics: Boolean(parsed.analytics), updatedAt: parsed.updatedAt ?? '', version: 'v1' }
      }
    } catch {}
    return defaults
  })
  const en = language === 'en'
  const de = language === 'de'
  const title = de ? 'Cookie-Einstellungen' : en ? 'Cookie preferences' : 'Preferencias de cookies'
  const body = de ? 'Dieses interne Portal verwendet notwendige Cookies für Sitzung, Sicherheit und Betrieb. Optionale Betriebsanalysen sind standardmäßig deaktiviert.' : en ? 'This internal portal uses necessary cookies for session, security and operation. Optional operational analytics are disabled by default.' : 'Este portal interno usa cookies necesarias para sesión, seguridad y operación. El análisis operativo opcional está desactivado por defecto.'

  useEffect(() => {
    const listener = () => { setOpen(true); setSettings(true) }
    window.addEventListener('anclora:open-cookie-preferences', listener)
    return () => window.removeEventListener('anclora:open-cookie-preferences', listener)
  }, [])

  function persist(next: CookiePreferences) {
    const value = { ...next, necessary: true as const, session: true as const, updatedAt: new Date().toISOString(), version: 'v1' as const }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    setPreferences(value)
    setOpen(false)
    setSettings(false)
  }

  return (
    <>
      <button type="button" aria-label={title} onClick={() => { setOpen(true); setSettings(true) }} className="fixed bottom-5 left-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-navy-surface/90 text-gold shadow-2xl backdrop-blur">
        <Cookie className="h-5 w-5" aria-hidden="true" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 px-4 py-6 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="nexus-cookie-title">
          <div className="w-full max-w-lg rounded-2xl border border-gold/20 bg-navy-surface p-6 text-soft-white shadow-2xl">
            <h2 id="nexus-cookie-title" className="text-2xl font-semibold">{settings ? (de ? 'Cookies verwalten' : en ? 'Manage cookies' : 'Gestionar cookies') : title}</h2>
            <p className="mt-3 text-sm leading-6 text-soft-muted">{body}</p>
            {settings ? (
              <div className="mt-5 space-y-3">
                <CookieRow title={de ? 'Notwendige Cookies' : en ? 'Necessary cookies' : 'Cookies necesarias'} description={de ? 'Sitzung, Sicherheit und Betrieb. Nicht deaktivierbar.' : en ? 'Session, security and operation. They cannot be disabled.' : 'Sesión, seguridad y operación. No se pueden desactivar.'} checked disabled onChange={() => {}} />
                <CookieRow title={de ? 'Betriebsanalyse' : en ? 'Operational analytics' : 'Análisis operativo'} description={de ? 'Hilft, Stabilität und interne Nutzung zu verbessern.' : en ? 'Helps improve stability and internal usage.' : 'Ayuda a mejorar estabilidad y uso interno.'} checked={preferences.analytics} onChange={(analytics) => setPreferences((current) => ({ ...current, analytics }))} />
              </div>
            ) : null}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {!settings ? <button type="button" onClick={() => persist({ ...defaults, analytics: true })} className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-[#0F1629]">{de ? 'Alle akzeptieren' : en ? 'Accept all' : 'Aceptar todas'}</button> : null}
              <button type="button" onClick={() => settings ? persist(preferences) : setSettings(true)} className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold">{settings ? (de ? 'Speichern' : en ? 'Save preferences' : 'Guardar preferencias') : (de ? 'Einstellungen' : en ? 'Settings' : 'Configuración')}</button>
              <button type="button" onClick={() => persist(defaults)} className="rounded-full px-5 py-3 text-sm font-semibold text-soft-muted">{de ? 'Optionale ablehnen' : en ? 'Reject optional' : 'Rechazar opcionales'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function CookieRow({ title, description, checked, disabled, onChange }: { title: string; description: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <span><span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-xs leading-5 text-soft-muted">{description}</span></span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5 accent-gold" />
    </label>
  )
}
