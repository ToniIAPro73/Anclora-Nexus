'use client'

import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n'

type RecaptchaApi = {
  ready: (callback: () => void) => void
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      theme?: 'light' | 'dark'
      size?: 'normal' | 'compact'
      callback?: (token: string) => void
      'expired-callback'?: () => void
      'error-callback'?: () => void
    },
  ) => number
  reset: (widgetId: number) => void
}

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi
  }
}

type RecaptchaPanelProps = {
  token: string
  onTokenChange: (token: string) => void
}

const recaptchaSiteKey =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ??
  process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY ??
  process.env.NEXT_PUBLIC_RECAPTCHA_KEY ??
  ''

export function RecaptchaPanel({ token, onTokenChange }: RecaptchaPanelProps) {
  const { t } = useI18n()
  const [ready, setReady] = useState(() => !recaptchaSiteKey)
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!recaptchaSiteKey) return

    const renderWidget = () => {
      const api = window.grecaptcha
      const container = containerRef.current
      if (!api || !container || widgetIdRef.current !== null) return
      const isMobileViewport = window.matchMedia('(max-width: 420px)').matches
      api.ready(() => {
        widgetIdRef.current = api.render(container, {
          sitekey: recaptchaSiteKey,
          theme: 'dark',
          size: isMobileViewport ? 'compact' : 'normal',
          callback: (nextToken) => onTokenChange(nextToken),
          'expired-callback': () => onTokenChange(''),
          'error-callback': () => onTokenChange(''),
        })
        setReady(true)
      })
    }

    if (window.grecaptcha) {
      renderWidget()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-anclora-recaptcha="true"]')
    if (existingScript) {
      existingScript.addEventListener('load', renderWidget, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.ancloraRecaptcha = 'true'
    script.addEventListener('load', renderWidget, { once: true })
    document.head.appendChild(script)
  }, [onTokenChange])

  if (!recaptchaSiteKey) return null

  return (
    <div className="rounded-[26px] border border-[#D4AF37]/18 bg-[rgba(7,37,47,0.38)] p-4">
      <p className="text-sm font-semibold text-soft-white">{t('externalFormCaptchaLabel')}</p>
      <div className="mt-3">
        <div ref={containerRef} className="min-h-[78px] overflow-hidden rounded-2xl border border-white/10 bg-black/15 p-2" />
        {!token ? (
          <p className="mt-3 text-xs text-soft-muted">
            {ready ? t('externalFormCaptchaVerifyPrompt') : t('externalFormCaptchaLoading')}
          </p>
        ) : null}
      </div>
    </div>
  )
}
