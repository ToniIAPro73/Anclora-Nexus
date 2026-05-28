'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

const modes: Array<{ code: ThemeMode; label: string; icon: typeof Sun }> = [
  { code: 'light', label: 'Light', icon: Sun },
  { code: 'dark', label: 'Dark', icon: Moon },
  { code: 'system', label: 'System', icon: Monitor },
]

function applyTheme(mode: ThemeMode) {
  const resolved = mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : mode
  document.documentElement.classList.toggle('light', resolved === 'light')
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.dataset.theme = mode
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = window.localStorage.getItem('anclora-nexus-theme')
    return stored === 'light' || stored === 'system' ? stored : 'dark'
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  function selectTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme)
    window.localStorage.setItem('anclora-nexus-theme', nextTheme)
    applyTheme(nextTheme)
  }

  return (
    <div className="flex items-center rounded-lg border border-soft-subtle bg-navy-surface/40 p-1" role="group" aria-label="Theme selector">
      {modes.map((mode) => {
        const Icon = mode.icon
        const active = theme === mode.code
        return (
          <button
            key={mode.code}
            type="button"
            onClick={() => selectTheme(mode.code)}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${
              active ? 'bg-gold text-navy-darker' : 'text-soft-muted hover:bg-white/5 hover:text-soft-white'
            }`}
            aria-pressed={active}
            title={mode.label}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{mode.label}</span>
          </button>
        )
      })}
    </div>
  )
}
