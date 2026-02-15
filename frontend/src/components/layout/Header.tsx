'use client'
import { Search } from 'lucide-react'
import { LanguageSelector } from './LanguageSelector'
import { CurrencySelector } from './CurrencySelector'
import { NotificationPanel } from './NotificationPanel'
import { UserMenu } from './UserMenu'
import { useI18n } from '@/lib/i18n'

export function Header() {
  const { t } = useI18n()

  return (
    <header className="h-20 border-b border-soft-subtle flex items-center justify-between px-8 bg-navy-darker/30 backdrop-blur-md sticky top-0 z-50">
      <div>
        <h2 className="text-soft-white font-medium">{t('projectDashboard')}</h2>
        <p className="text-xs text-soft-muted">
          {t('welcomeBack')}, Toni. {t('agentStatus')}: <span className="text-emerald-400 font-bold">{t('optimal')}</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-muted group-focus-within:text-gold transition-colors" />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            className="bg-navy-surface border border-soft-subtle rounded-full py-2 pl-10 pr-4 text-sm text-soft-white placeholder:text-soft-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all w-64"
          />
        </div>
        
        <NotificationPanel />

        <CurrencySelector />

        <LanguageSelector />

        <UserMenu />
      </div>
    </header>
  )
}
